import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Store, ArrowLeft, Sparkles, Crown, Rocket } from 'lucide-react';
import { toast } from 'sonner';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const onboardingSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  slug: z.string().trim()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .max(50, 'Slug muito longo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  subtitle: z.string().trim().max(200, 'Subtítulo muito longo').optional(),
  plan: z.enum(['starter', 'professional', 'enterprise']),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const PLANS = [
  {
    value: 'starter',
    label: 'Starter',
    description: 'Até 3 usuários, funcionalidades básicas',
    icon: Sparkles,
    price: 'Grátis',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Até 10 usuários, relatórios avançados',
    icon: Rocket,
    price: 'R$ 99/mês',
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'Usuários ilimitados, API, domínio próprio',
    icon: Crown,
    price: 'R$ 299/mês',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      slug: '',
      subtitle: '',
      plan: 'starter',
    },
  });

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    setCheckingSlug(false);
    setSlugAvailable(!data && !error);
  };

  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    const generatedSlug = slugify(value);
    form.setValue('slug', generatedSlug);
    checkSlugAvailability(generatedSlug);
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = slugify(value);
    form.setValue('slug', cleanSlug);
    checkSlugAvailability(cleanSlug);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um restaurante');
      navigate('/login', { state: { from: '/onboarding' } });
      return;
    }

    if (slugAvailable === false) {
      toast.error('Este slug já está em uso. Escolha outro.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: response, error } = await supabase.functions.invoke('create-tenant', {
        body: {
          name: data.name,
          slug: data.slug,
          subtitle: data.subtitle || null,
          plan: data.plan,
        },
      });

      if (error) {
        console.error('Error creating restaurant:', error);
        toast.error(error.message || 'Erro ao criar restaurante');
        setIsSubmitting(false);
        return;
      }

      if (!response?.success) {
        toast.error(response?.error || 'Erro ao criar restaurante');
        setIsSubmitting(false);
        return;
      }

      toast.success('Restaurante criado com sucesso!');
      navigate(`/admin/${data.slug}`, { replace: true });
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro inesperado. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Acesso Necessário</CardTitle>
              <CardDescription className="mt-2">
                Você precisa estar logado para criar um restaurante
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login" state={{ from: '/onboarding' }}>
                Fazer Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/signup">
                Criar Conta
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Criar Novo Restaurante</CardTitle>
              <CardDescription className="mt-2">
                Configure seu estabelecimento e comece a usar o sistema
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Restaurante *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Bistro Verde"
                          className="bg-surface placeholder:text-surface-foreground"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Restaurante *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">chamaatende.lovable.app/</span>
                          <Input
                            placeholder="bistro-verde"
                            className="bg-surface placeholder:text-surface-foreground flex-1"
                            {...field}
                            onChange={(e) => handleSlugChange(e.target.value)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {checkingSlug && (
                          <span className="text-muted-foreground">Verificando disponibilidade...</span>
                        )}
                        {!checkingSlug && slugAvailable === true && (
                          <span className="text-green-500">✓ Disponível</span>
                        )}
                        {!checkingSlug && slugAvailable === false && (
                          <span className="text-destructive">✗ Já está em uso</span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtítulo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Uma breve descrição do seu estabelecimento"
                          className="bg-surface placeholder:text-surface-foreground resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano *</FormLabel>
                      <div className="grid gap-3">
                        {PLANS.map((plan) => {
                          const Icon = plan.icon;
                          const isSelected = field.value === plan.value;
                          return (
                            <div
                              key={plan.value}
                              onClick={() => field.onChange(plan.value)}
                              className={`
                                relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                                ${isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                                }
                              `}
                            >
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center
                                ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                              `}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{plan.label}</span>
                                  <span className="text-sm font-semibold text-primary">{plan.price}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || slugAvailable === false}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Restaurante'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
