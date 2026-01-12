import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Store, ArrowRight, Shield } from 'lucide-react';

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  logo_url: string | null;
  status: string | null;
  plan: string | null;
}

export default function TenantSelectPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [slugInput, setSlugInput] = useState('');

  // Fetch all active restaurants
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['public-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, slug, name, subtitle, logo_url, status, plan')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Restaurant[];
    },
  });

  const filteredRestaurants = restaurants?.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigateToSlug = () => {
    if (slugInput.trim()) {
      navigate(`/${slugInput.trim().toLowerCase()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigateToSlug();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Chama Atende</h1>
                <p className="text-sm text-muted-foreground">Plataforma SaaS para Restaurantes</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/login')} className="gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Direct Access */}
        <Card className="mb-8 bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-lg">Acesso Direto</CardTitle>
            <CardDescription>
              Digite o código do estabelecimento para acessar diretamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  /
                </span>
                <Input
                  placeholder="codigo-do-restaurante"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-6 bg-background border-border"
                />
              </div>
              <Button onClick={handleNavigateToSlug} disabled={!slugInput.trim()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estabelecimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>
        </div>

        {/* Restaurants Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/${restaurant.slug}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {restaurant.name}
                        </h3>
                        <Badge
                          variant={restaurant.status === 'open' ? 'default' : 'secondary'}
                          className="text-xs shrink-0"
                        >
                          {restaurant.status === 'open' ? 'Aberto' : 'Fechado'}
                        </Badge>
                      </div>
                      {restaurant.subtitle && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {restaurant.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        /{restaurant.slug}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum estabelecimento encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Tente buscar com outros termos'
                : 'Ainda não há estabelecimentos cadastrados'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Chama Atende. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
