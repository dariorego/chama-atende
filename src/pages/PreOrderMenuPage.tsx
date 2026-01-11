import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { PreOrderProductCard } from "@/components/ui/pre-order-product-card";
import { ProductDetailSheet } from "@/components/ui/product-detail-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, ShoppingBag, Clock, AlertCircle, Phone, Calendar, CreditCard, QrCode, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreOrderProducts, usePreOrderCategories, type PreOrderProduct } from "@/hooks/usePreOrderProducts";
import { usePreOrderCart } from "@/hooks/usePreOrderCart";
import { usePreOrderModuleSettings } from "@/hooks/usePreOrderModuleSettings";
import { useSearchPreOrders, type PreOrderSearchResult } from "@/hooks/useClientPreOrder";
import { useToast } from "@/hooks/use-toast";
import { calculatePromotion } from "@/hooks/useMenuProducts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  confirmed: { label: 'Confirmada', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  preparing: { label: 'Em Preparo', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  ready: { label: 'Pronta', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  delivered: { label: 'Entregue', color: 'bg-green-600/10 text-green-600 border-green-600/20' },
  cancelled: { label: 'Cancelada', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const PAYMENT_METHOD_LABELS: Record<string, { label: string; icon: typeof CreditCard }> = {
  pix: { label: 'PIX', icon: QrCode },
  card: { label: 'Cartão', icon: CreditCard },
};

const PreOrderMenuPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("order");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");

  // Fetch data
  const { data: productsData, isLoading: isLoadingProducts } = usePreOrderProducts();
  const { data: categoriesData, isLoading: isLoadingCategories } = usePreOrderCategories();
  const { settings, isLoading: isLoadingSettings } = usePreOrderModuleSettings();
  const { items, addItem, removeItem, updateQuantity, totalItems, totalAmount } = usePreOrderCart();
  const { data: searchResults, isLoading: isSearching } = useSearchPreOrders(phoneSearch);

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

  // Format phone for search
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhoneSearch(value);
  };

  if (isLoading) {
    return (
      <ClientLayout title="Encomendas" showBack backTo="/">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Encomendas" showBack backTo="/">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="order">Fazer Encomenda</TabsTrigger>
          <TabsTrigger value="search">Consultar</TabsTrigger>
        </TabsList>

        {/* Tab: Fazer Encomenda */}
        <TabsContent value="order" className="mt-0">
          {!productsData || productsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Nenhum produto disponível
              </h2>
              <p className="text-muted-foreground">
                No momento não há produtos disponíveis para encomenda.
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </TabsContent>

        {/* Tab: Consultar */}
        <TabsContent value="search" className="mt-0">
          <div className="space-y-6">
            {/* Phone Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Digite seu telefone para consultar</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phoneSearch}
                  onChange={handlePhoneChange}
                  className="pl-10 bg-surface border-border placeholder:text-surface-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Informe o telefone cadastrado na encomenda
              </p>
            </div>

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* Search Results */}
            {!isSearching && searchResults && searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">
                  {searchResults.length} encomenda{searchResults.length > 1 ? 's' : ''} encontrada{searchResults.length > 1 ? 's' : ''}
                </h3>
                {searchResults.map((order) => (
                  <PreOrderSearchCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {/* Empty Results */}
            {!isSearching && phoneSearch.replace(/\D/g, '').length >= 10 && (!searchResults || searchResults.length === 0) && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma encomenda encontrada</h3>
                <p className="text-muted-foreground text-sm">
                  Não encontramos encomendas ativas para este telefone.
                </p>
              </div>
            )}

            {/* Initial State */}
            {!isSearching && phoneSearch.replace(/\D/g, '').length < 10 && (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Consulte suas encomendas</h3>
                <p className="text-muted-foreground text-sm">
                  Digite seu telefone para ver o status das suas encomendas.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ClientLayout>
  );
};

// Component for displaying search result cards
function PreOrderSearchCard({ order }: { order: PreOrderSearchResult }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const paymentConfig = order.payment_method ? PAYMENT_METHOD_LABELS[order.payment_method] : null;
  const PaymentIcon = paymentConfig?.icon || CreditCard;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const pickupDate = new Date(order.pickup_date + 'T12:00:00');
  const formattedDate = format(pickupDate, "dd/MM/yyyy", { locale: ptBR });
  const formattedTime = order.pickup_time.slice(0, 5);

  return (
    <Link to={`/encomendas/status/${order.id}`}>
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <span className="font-bold text-lg">
                #{order.order_number.toString().padStart(3, '0')}
              </span>
              <Badge className={cn('ml-2 border', statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>
            <span className="font-semibold text-primary">
              {formatPrice(Number(order.total_amount))}
            </span>
          </div>

          {/* Pickup Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedTime}</span>
            </div>
            {paymentConfig && (
              <div className="flex items-center gap-1">
                <PaymentIcon className="h-3.5 w-3.5" />
                <span>{paymentConfig.label}</span>
              </div>
            )}
          </div>

          {/* Admin Response */}
          {order.admin_response && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{order.admin_response}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default PreOrderMenuPage;
