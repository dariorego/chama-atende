import { useState } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ProductCard } from "@/components/ui/product-card";
import { ProductDetailSheet } from "@/components/ui/product-detail-sheet";
import { Input } from "@/components/ui/input";
import { Search, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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

// Demo data - will be replaced with Supabase data
const categories = [
  { id: "all", name: "Todos" },
  { id: "entradas", name: "Entradas" },
  { id: "principais", name: "Principais" },
  { id: "sobremesas", name: "Sobremesas" },
  { id: "bebidas", name: "Bebidas" },
];

const products = [
  {
    id: "1",
    name: "Bruschetta Clássica",
    description: "Pão italiano tostado com tomates frescos, manjericão e azeite extra virgem",
    price: 28.90,
    category: "entradas",
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop",
    highlight: true,
  },
  {
    id: "2",
    name: "Carpaccio de Carne",
    description: "Finas fatias de filé mignon com rúcula, parmesão e molho especial",
    price: 45.90,
    category: "entradas",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: "Risoto de Funghi",
    description: "Arroz arbóreo cremoso com mix de cogumelos frescos e parmesão",
    price: 68.90,
    category: "principais",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
    highlight: true,
  },
  {
    id: "4",
    name: "Filé ao Molho Madeira",
    description: "Filé mignon grelhado com molho madeira, acompanha arroz e legumes",
    price: 89.90,
    category: "principais",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    name: "Salmão Grelhado",
    description: "Salmão fresco grelhado com ervas finas, purê de batatas e aspargos",
    price: 95.90,
    category: "principais",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    promotion: "-15%",
  },
  {
    id: "6",
    name: "Tiramisù",
    description: "Sobremesa italiana clássica com café, mascarpone e cacau",
    price: 32.90,
    category: "sobremesas",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
  },
  {
    id: "7",
    name: "Petit Gâteau",
    description: "Bolo de chocolate com centro cremoso, servido com sorvete de baunilha",
    price: 34.90,
    category: "sobremesas",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
  },
  {
    id: "8",
    name: "Suco Natural",
    description: "Suco de frutas da estação - 300ml",
    price: 12.90,
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop",
  },
  {
    id: "9",
    name: "Caipirinha",
    description: "Limão, cachaça, açúcar e gelo - tradicional brasileira",
    price: 22.90,
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=400&h=300&fit=crop",
  },
];

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  // Setup carousel API listener
  useState(() => {
    if (!carouselApi) return;
    
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  });

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const highlightedProducts = products.filter((p) => p.highlight);
  const regularProducts = filteredProducts.filter((p) => !p.highlight);

  return (
    <ClientLayout title="Cardápio" showBack backTo="/">
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
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum item encontrado</p>
        </div>
      )}
    </ClientLayout>
  );
};

export default MenuPage;
