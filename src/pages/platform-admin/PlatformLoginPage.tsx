import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PlatformLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (!error) {
      const destination = (location.state as { from?: string } | null)?.from || '/adminchamaatende';
      navigate(destination, { replace: true });
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Building2 className="h-7 w-7" /></div>
          <CardTitle className="text-2xl">Administração Chama-Atende</CardTitle>
          <CardDescription>Acesso exclusivo para administradores da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2"><Label htmlFor="platform-email">Email</Label><Input id="platform-email" type="email" autoComplete="email" required maxLength={255} className="bg-surface placeholder:text-surface-foreground" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="platform-password">Senha</Label><Input id="platform-password" type="password" autoComplete="current-password" required minLength={6} maxLength={72} className="bg-surface placeholder:text-surface-foreground" placeholder="Sua senha" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
            <Button className="w-full" disabled={loading} type="submit">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
