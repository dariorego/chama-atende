import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, Store, ArrowLeft, Sparkles, Crown, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(72, 'Senha muito longa'),
  confirmPassword: z.string(),
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  slug: z.string().trim()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .max(50, 'Slug muito longo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  subtitle: z.string().trim().max(200, 'Subtítulo muito longo').optional(),
  plan: z.enum(['starter', 'professional', 'enterprise']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const PLANS = [
  {
    value: 'starter',
    label: 'Starter',
    description: 'Cardápio digital e informações da loja (redes sociais e contato)',
    icon: Sparkles,
    price: 'Grátis',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Todos os módulos liberados',
    icon: Rocket,
    price: 'R$ 69,90/mês',
  },
  {
    value: 'enterprise',
    label: 'Enterprise com IA',
    description: 'Todos os módulos + recursos de IA (em breve)',
    icon: Crown,
    price: 'R$ 129,90/mês',
    comingSoon: true,
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [freeProfessional, setFreeProfessional] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
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
    if (slugAvailable === false) {
      toast.error('Este slug já está em uso. Escolha outro.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Encerra qualquer sessão ativa para garantir usuário isolado
      try { await supabase.auth.signOut(); } catch { /* noop */ }

      // 2. Cria a nova conta
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: data.fullName },
        },
      });

      if (signUpError) {
        const msg = signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')
          ? 'Este email já está cadastrado. Faça login e crie o estabelecimento a partir da sua conta.'
          : signUpError.message;
        toast.error(msg);
        setIsSubmitting(false);
        return;
      }

      // 3. Se não veio sessão (confirmação de email), tenta login imediato
      if (!signUpData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password,
        });
        if (signInError) {
          toast.error('Conta criada, mas não foi possível autenticar automaticamente. Confirme seu email e faça login.');
          setIsSubmitting(false);
          return;
        }
      }

      // 4. Cria o estabelecimento usando o JWT do novo usuário
      const { data: response, error } = await supabase.functions.invoke('create-tenant', {
        body: {
          name: data.name,
          slug: data.slug,
          subtitle: data.subtitle || null,
          plan: data.plan,
          free_trial: data.plan === 'professional' ? freeProfessional : false,
        },
      });

      if (error) {
        console.error('Error creating restaurant:', error);
        toast.error(error.message || 'Erro ao criar estabelecimento');
        setIsSubmitting(false);
        return;
      }

      if (!response?.success) {
        toast.error(response?.error || 'Erro ao criar estabelecimento');
        setIsSubmitting(false);
        return;
      }

      toast.success('Estabelecimento criado com sucesso!');
      navigate(`/admin/${data.slug}`, { replace: true });
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro inesperado. Tente novamente.');
      setIsSubmitting(false);
    }
  };

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
              <CardTitle className="text-2xl font-bold">Criar Novo Estabelecimento</CardTitle>
              <CardDescription className="mt-2">
                Configure seu estabelecimento e comece a usar o sistema
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sua conta</h3>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" autoComplete="name" className="bg-surface placeholder:text-surface-foreground" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" autoComplete="email" className="bg-surface placeholder:text-surface-foreground" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" autoComplete="new-password" className="bg-surface placeholder:text-surface-foreground" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar senha *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" autoComplete="new-password" className="bg-surface placeholder:text-surface-foreground" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-t border-border" />

                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dados do estabelecimento</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Estabelecimento *</FormLabel>
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
                      <FormLabel>URL do Estabelecimento *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">plataforma.chamaatende.com/</span>
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
                          const isDisabled = (plan as any).comingSoon;
                          return (
                            <div
                              key={plan.value}
                              onClick={() => {
                                if (isDisabled) return;
                                field.onChange(plan.value);
                              }}
                              className={`
                                relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                                ${isDisabled
                                  ? 'opacity-60 cursor-not-allowed border-border'
                                  : 'cursor-pointer'
                                }
                                ${isSelected && !isDisabled
                                  ? 'border-primary bg-primary/5'
                                  : !isDisabled ? 'border-border hover:border-primary/50' : ''
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
                                  <span className="font-medium">
                                    {plan.label}
                                    {isDisabled && (
                                      <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                                        em breve
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-sm font-semibold text-primary">{plan.price}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                {plan.value === 'professional' && isSelected && (
                                  <label
                                    className="mt-3 flex items-center gap-2 text-sm text-foreground cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Checkbox
                                      checked={freeProfessional}
                                      onCheckedChange={(v) => setFreeProfessional(!!v)}
                                    />
                                    Ativar Professional sem pagamento (período de avaliação)
                                  </label>
                                )}
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
                    'Criar Estabelecimento'
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
