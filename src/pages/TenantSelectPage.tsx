import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Store, ArrowRight, Shield, Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="border-b border-emerald-deep/10 bg-cream-soft/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-deep border border-gold/40 flex items-center justify-center">
                <Store className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="editorial-label text-gold leading-none">Plataforma</p>
                <h1 className="text-2xl font-serif-editorial text-emerald-deep leading-none mt-0.5">Chama Atende</h1>
                <p className="text-xs text-emerald-deep/60 font-sans-editorial mt-0.5">SaaS para restaurantes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/onboarding')}
                className="gap-2 rounded-full bg-emerald-deep text-cream border border-gold/40 hover:bg-emerald-deep/90 font-sans-editorial"
              >
                <Plus className="h-4 w-4" />
                Criar Restaurante
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="gap-2 rounded-full bg-cream-soft border-emerald-deep/15 text-emerald-deep hover:border-gold/40 hover:bg-cream-soft font-sans-editorial"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 flex-1">
        {/* Editorial intro */}
        <div className="mb-10 max-w-2xl">
          <p className="editorial-label text-gold">Bem-vindo</p>
          <h2 className="text-4xl md:text-5xl font-serif-editorial text-emerald-deep leading-[1.05] mt-1">
            Encontre seu estabelecimento
          </h2>
          <div className="w-16 h-px bg-gold/60 mt-4" />
        </div>

        {/* Search */}
        <div className="mb-6">
          <p className="editorial-label text-emerald-deep/70 mb-2">Explore</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-deep/50" />
            <Input
              placeholder="Buscar estabelecimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus:ring-2 focus:ring-gold"
            />
          </div>
        </div>

        {/* Restaurants Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
          </div>
        ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="bg-cream-soft border-emerald-deep/10 hover:border-gold/60 rounded-2xl transition-all cursor-pointer group shadow-[0_10px_40px_-25px_rgba(6,78,59,0.35)] hover:shadow-[0_20px_60px_-25px_rgba(6,78,59,0.45)]"
                onClick={() => navigate(`/${restaurant.slug}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gold/40"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-deep border border-gold/40 flex items-center justify-center">
                        <Store className="h-6 w-6 text-gold" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif-editorial text-xl text-emerald-deep truncate leading-tight">
                          {restaurant.name}
                        </h3>
                        <Badge
                          variant={restaurant.status === 'open' ? 'default' : 'secondary'}
                          className={
                            restaurant.status === 'open'
                              ? 'text-[10px] shrink-0 bg-emerald-deep text-cream border border-gold/40 font-sans-editorial uppercase tracking-wider'
                              : 'text-[10px] shrink-0 bg-emerald-deep/10 text-emerald-deep border border-emerald-deep/15 font-sans-editorial uppercase tracking-wider'
                          }
                        >
                          {restaurant.status === 'open' ? 'Aberto' : 'Fechado'}
                        </Badge>
                      </div>
                      {restaurant.subtitle && (
                        <p className="text-sm text-emerald-deep/70 font-sans-editorial line-clamp-1">
                          {restaurant.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-gold mt-1 font-sans-editorial tracking-wide">
                        /{restaurant.slug}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-deep/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-cream-soft border border-gold flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-2xl font-serif-editorial text-emerald-deep mb-2">
              Nenhum estabelecimento encontrado
            </h3>
            <p className="text-emerald-deep/60 font-sans-editorial">
              {searchQuery
                ? 'Tente buscar com outros termos'
                : 'Ainda não há estabelecimentos cadastrados'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-deep/10 mt-auto py-6 bg-cream-soft/40">
        <div className="container mx-auto px-4 text-center text-sm text-emerald-deep/60 font-sans-editorial">
          <p>© {new Date().getFullYear()} Chama Atende. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
