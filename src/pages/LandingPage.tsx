import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LandingPage = () => {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, slug, subtitle, logo_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Store className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Sistema de Gestão
          </h1>
          <p className="text-muted-foreground text-lg">
            Plataforma para restaurantes
          </p>
        </div>

        {restaurants && restaurants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto mb-12">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/${restaurant.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    {restaurant.logo_url && (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="h-16 w-16 object-contain mb-2"
                      />
                    )}
                    <CardTitle>{restaurant.name}</CardTitle>
                    {restaurant.subtitle && (
                      <CardDescription>{restaurant.subtitle}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Acessar Menu
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mb-12">
            Nenhum restaurante disponível no momento.
          </p>
        )}

        <div className="text-center">
          <Link to="/login">
            <Button size="lg" className="gap-2">
              <LogIn className="h-5 w-5" />
              Acessar Painel Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
