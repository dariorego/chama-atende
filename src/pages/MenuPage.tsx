import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ProductCard } from "@/components/ui/product-card";
import { ProductDetailSheet } from "@/components/ui/product-detail-sheet";
import { Input } from "@/components/ui/input";
import { Search, ChefHat, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useMenuProducts, calculatePromotion, type MenuProduct } from "@/hooks/useMenuProducts";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  highlight?: boolean;
  promotion?: string;
}

// Transform Supabase product to local Product interface
function transformProduct(product: MenuProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    price: product.promotional_price ? Number(product.promotional_price) : Number(product.price),
    category: product.category?.slug ?? '',
    image: product.image_url ?? undefined,
    highlight: product.is_highlight ?? false,
    promotion: calculatePromotion(Number(product.price), product.promotional_price ? Number(product.promotional_price) : null),
  };
}

const MenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch data from Supabase
  const { data: restaurant, isLoading: isLoadingRestaurant } = useRestaurant(slug ?? '');
  const { data: categoriesData, isLoading: isLoadingCategories } = useMenuCategories(restaurant?.id);
  const { data: productsData, isLoading: isLoadingProducts } = useMenuProducts(restaurant?.id);

  const isLoading = isLoadingRestaurant || isLoadingCategories || isLoadingProducts;

  // Transform categories with "Todos" option
  const categories = [
    { id: "all", name: "Todos" },
    ...(categoriesData?.map(cat => ({ id: cat.slug, name: cat.name })) ?? [])
  ];

  // Transform products
  const products = productsData?.map(transformProduct) ?? [];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  // Setup carousel API listener
  useEffect(() => {
    if (!carouselApi) return;
    
    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const highlightedProducts = products.filter((p) => p.highlight);
  const regularProducts = filteredProducts.filter((p) => !p.highlight);

  if (isLoading) {
    return (
      <ClientLayout title="Cardápio" showBack backTo={`/${slug}`}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Cardápio" showBack backTo={`/${slug}`}>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar no cardápio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {/* Chef Highlights Carousel */}
      {highlightedProducts.length > 0 && (
        <div className="mb-6 -mx-4">
          <div className="px-4 mb-3">
            <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
              <ChefHat className="h-4 w-4" /> Sugestão do Chef
            </h2>
          </div>
          
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 px-4">
              {highlightedProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-2 basis-[85%] md:basis-[60%]">
                  <button
                    onClick={() => handleProductClick(product)}
                    className="relative w-full aspect-[16/10] rounded-xl overflow-hidden group"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        <ChefHat className="h-3 w-3" />
                        Sugestão do Chef
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-white/80 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          {/* Carousel Indicators */}
          {highlightedProducts.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {highlightedProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentSlide === index
                      ? "bg-primary w-4"
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none -mx-4 px-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              activeCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Regular Products */}
      <div className="space-y-3">
        {regularProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-slide-up"
            style={{ animationDelay: `${(highlightedProducts.length + index) * 0.05}s` }}
          >
            <ProductCard
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image}
              promotion={product.promotion}
              onClick={() => handleProductClick(product)}
            />
          </div>
        ))}
      </div>

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      {/* Empty State */}
      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum item encontrado</p>
        </div>
      )}
    </ClientLayout>
  );
};

export default MenuPage;
