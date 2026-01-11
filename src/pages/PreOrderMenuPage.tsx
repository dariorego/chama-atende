import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { PreOrderProductCard } from "@/components/ui/pre-order-product-card";
import { ProductDetailSheet } from "@/components/ui/product-detail-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ShoppingBag, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreOrderProducts, usePreOrderCategories, type PreOrderProduct } from "@/hooks/usePreOrderProducts";
import { usePreOrderCart } from "@/hooks/usePreOrderCart";
import { usePreOrderModuleSettings } from "@/hooks/usePreOrderModuleSettings";
import { useToast } from "@/hooks/use-toast";
import { calculatePromotion } from "@/hooks/useMenuProducts";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  promotion?: string;
}

function transformProduct(product: PreOrderProduct): Product {
  const hasPromo = product.promotional_price && Number(product.promotional_price) < Number(product.price);
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    price: hasPromo ? Number(product.promotional_price) : Number(product.price),
    originalPrice: hasPromo ? Number(product.price) : undefined,
    category: product.category?.slug ?? '',
    image: product.image_url ?? undefined,
    promotion: calculatePromotion(Number(product.price), product.promotional_price ? Number(product.promotional_price) : null),
  };
}

const PreOrderMenuPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch data
  const { data: productsData, isLoading: isLoadingProducts } = usePreOrderProducts();
  const { data: categoriesData, isLoading: isLoadingCategories } = usePreOrderCategories();
  const { settings, isLoading: isLoadingSettings } = usePreOrderModuleSettings();
  const { items, addItem, removeItem, updateQuantity, totalItems, totalAmount } = usePreOrderCart();

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingSettings;

  // Transform data
  const products = productsData?.map(transformProduct) ?? [];
  const categories = [
    { id: "all", name: "Todos", slug: "all" },
    ...(categoriesData ?? [])
  ];

  // Get quantity for a product
  const getQuantity = (productId: string) => {
    return items.find(item => item.productId === productId)?.quantity ?? 0;
  };

  // Handle add to cart
  const handleAddProduct = (productId: string) => {
    const originalProduct = productsData?.find(p => p.id === productId);
    if (originalProduct) {
      addItem(originalProduct as any);
      toast({
        title: "Adicionado!",
        description: originalProduct.name,
      });
    }
  };

  // Handle remove from cart
  const handleRemoveProduct = (productId: string) => {
    const currentQty = getQuantity(productId);
    if (currentQty > 1) {
      updateQuantity(productId, currentQty - 1);
    } else {
      removeItem(productId);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Format currency
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (isLoading) {
    return (
      <ClientLayout title="Encomendas" showBack backTo="/">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  if (!productsData || productsData.length === 0) {
    return (
      <ClientLayout title="Encomendas" showBack backTo="/">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Nenhum produto disponível
          </h2>
          <p className="text-muted-foreground">
            No momento não há produtos disponíveis para encomenda.
          </p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Fazer Encomenda" showBack backTo="/">
      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Encomendas com Antecedência</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pedidos devem ser feitos com pelo menos{" "}
              <span className="font-medium text-primary">
                {settings.min_advance_hours} horas
              </span>{" "}
              de antecedência
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-surface border-border placeholder:text-surface-foreground"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none -mx-4 px-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.slug)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              activeCategory === category.slug
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4 pb-28">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <PreOrderProductCard
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              promotion={product.promotion}
              quantity={getQuantity(product.id)}
              onAdd={() => handleAddProduct(product.id)}
              onRemove={() => handleRemoveProduct(product.id)}
              onClick={() => {
                setSelectedProduct(product);
                setIsSheetOpen(true);
              }}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-50">
          <div className="container mx-auto max-w-lg">
            <Button
              onClick={() => navigate("/encomendas/carrinho")}
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary-foreground text-primary"
                    >
                      {totalItems}
                    </Badge>
                  </div>
                  <span>Ver Carrinho</span>
                </div>
                <span className="font-bold">{formatPrice(totalAmount)}</span>
              </div>
            </Button>
          </div>
        </div>
      )}
    </ClientLayout>
  );
};

export default PreOrderMenuPage;
