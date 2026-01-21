import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ChefHat } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(72, 'Senha muito longa'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  
  // Try to get tenant from context (when wrapped in TenantProvider)
  let tenant = null;
  let tenantLoading = false;
  try {
    const tenantContext = useTenant();
    tenant = tenantContext.tenant;
    tenantLoading = tenantContext.isLoading;
  } catch {
    // Not inside TenantProvider, tenant context not available
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine redirect destination
  const tenantSlug = params.slug || tenant?.slug;
  const from = (location.state as { from?: string })?.from || 
    (tenantSlug ? `/admin/${tenantSlug}` : '/');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading || tenantLoading) return;
    
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, tenantLoading, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const { error } = await login(data.email, data.password);
    setIsSubmitting(false);

    if (!error) {
      navigate(from, { replace: true });
    }
  };

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use tenant info if available
  const displayName = tenant?.name || 'ChamaAtende';
  const logoUrl = tenant?.logo_url;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={displayName} 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <ChefHat className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{displayName}</CardTitle>
            <CardDescription className="mt-2">
              Entre na sua conta para acessar o painel administrativo
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link 
              to={tenantSlug ? `/${tenantSlug}` : '/'} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
