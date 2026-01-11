import { useState, useEffect } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ProductCard } from "@/components/ui/product-card";
import { ProductDetailSheet } from "@/components/ui/product-detail-sheet";
import { CartButton } from "@/components/ui/cart-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChefHat, Loader2, Bell, Check, ShoppingBag, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useMenuProducts, calculatePromotion, type MenuProduct } from "@/hooks/useMenuProducts";
import { useRestaurantModules } from "@/hooks/useRestaurantModules";
import { useTableContext } from "@/hooks/useTableContext";
import { useClientServiceCall } from "@/hooks/useClientServiceCall";
import { usePublicTables } from "@/hooks/usePublicTables";
import { usePreOrderCart } from "@/hooks/usePreOrderCart";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  highlight?: boolean;
  promotion?: string;
  isOrderable?: boolean;
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
    isOrderable: (product as MenuProduct & { is_orderable?: boolean }).is_orderable ?? false,
  };
}

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  const { toast } = useToast();

  // Fetch data from Supabase
  const { data: categoriesData, isLoading: isLoadingCategories } = useMenuCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useMenuProducts();

  // Waiter call functionality
  const { data: modules } = useRestaurantModules();
  const { table, setTable } = useTableContext();
  const { data: tables, isLoading: isLoadingTables } = usePublicTables();
  const { hasActiveCall, createCall, isCreatingCall } = useClientServiceCall(table?.id || null);
  const { addItem, totalItems } = usePreOrderCart();

  const isWaiterCalled = hasActiveCall("waiter");
  const isPreOrdersActive = modules?.preOrders ?? false;

  const handleQuickWaiterCall = async (tableId?: string) => {
    const targetTableId = tableId || table?.id;
    
    if (!targetTableId) {
      setIsTableModalOpen(true);
      return;
    }
    
    try {
      await createCall({
        tableId: targetTableId,
        sessionId: null,
        callType: "waiter",
      });
      toast({
        title: "Atendente chamado!",
        description: "Aguarde, estamos a caminho.",
      });
      setIsTableModalOpen(false);
      setSelectedTableId("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível chamar o atendente.",
        variant: "destructive",
      });
    }
  };

  const handleTableSelectAndCall = async () => {
    if (!selectedTableId) return;
    
    const success = await setTable(selectedTableId);
    if (success) {
      await handleQuickWaiterCall(selectedTableId);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível identificar a mesa.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingCategories || isLoadingProducts;

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

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // Find original product data
    const originalProduct = productsData?.find(p => p.id === product.id);
    if (originalProduct) {
      addItem(originalProduct);
      toast({
        title: "Adicionado ao carrinho",
        description: product.name,
      });
    }
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
      <ClientLayout title="Cardápio" showBack backTo="/">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

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
              isOrderable={isPreOrdersActive && product.isOrderable}
              onAddToCart={isPreOrdersActive && product.isOrderable ? (e) => handleAddToCart(product, e) : undefined}
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

      {/* Floating Cart Button */}
      {isPreOrdersActive && totalItems > 0 && (
        <CartButton itemCount={totalItems} />
      )}

      {/* Floating Waiter Call Button */}
      {modules?.waiterCall && (
        <button
          onClick={() => handleQuickWaiterCall()}
          disabled={isCreatingCall || isWaiterCalled}
          className={cn(
            "fixed bottom-6 z-50",
            isPreOrdersActive && totalItems > 0 ? "right-24" : "right-6",
            "w-14 h-14 rounded-full",
            "shadow-lg hover:shadow-xl",
            "flex items-center justify-center",
            "transition-all duration-300",
            isWaiterCalled
              ? "bg-green-600 text-white cursor-default"
              : "bg-primary text-primary-foreground hover:scale-105",
            isCreatingCall && "opacity-70"
          )}
          aria-label="Chamar atendente"
        >
          {isCreatingCall ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isWaiterCalled ? (
            <Check className="h-6 w-6" />
          ) : (
            <Bell className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Table Selection Modal */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Qual é sua mesa?</DialogTitle>
            <DialogDescription>
              Selecione sua mesa para chamar o atendente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
              <SelectTrigger className="w-full h-14 text-lg bg-surface border-border">
                <SelectValue placeholder="Selecione a mesa" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTables ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  tables?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      Mesa {t.number.toString().padStart(2, "0")}
                      {t.name ? ` - ${t.name}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Button
              onClick={handleTableSelectAndCall}
              disabled={!selectedTableId || isCreatingCall}
              className="w-full h-12"
            >
              {isCreatingCall ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Chamando...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Chamar Atendente
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
};

export default MenuPage;
