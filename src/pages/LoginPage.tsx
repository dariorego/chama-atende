import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ChefHat } from 'lucide-react';
import { useRestaurant } from '@/hooks/useRestaurant';

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(72, 'Senha muito longa'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch restaurant to get slug for redirect
  const { data: restaurant } = useRestaurant(profile?.restaurant_id ? '' : '');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading || profileLoading) return;
    
    if (isAuthenticated && profile?.restaurant_id) {
      // Fetch restaurant slug and redirect
      const fetchAndRedirect = async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('restaurants')
          .select('slug')
          .eq('id', profile.restaurant_id!)
          .single();
        
        if (data?.slug) {
          navigate(`/${data.slug}/admin`, { replace: true });
        }
      };
      fetchAndRedirect();
    }
  }, [isAuthenticated, profile, authLoading, profileLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const { error } = await login(data.email, data.password);
    setIsSubmitting(false);

    if (!error) {
      // Will be redirected by the useEffect above
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
            <CardDescription className="mt-2">
              Entre na sua conta para acessar o painel
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

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
