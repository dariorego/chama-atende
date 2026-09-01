import { useState, useEffect, useRef, useMemo } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ProductCard } from "@/components/ui/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChefHat, Loader2, Bell, Check, ChevronDown } from "lucide-react";
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
import { useTenantModules } from "@/hooks/useRestaurantModules";
import { useTableContext } from "@/hooks/useTableContext";
import { useClientServiceCall } from "@/hooks/useClientServiceCall";
import { usePublicTables } from "@/hooks/usePublicTables";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/hooks/useTenant";
import { useCustomerName, MAX_CUSTOMER_NAME } from "@/hooks/useCustomerName";
import { CustomerNameDialog } from "@/components/CustomerNameDialog";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isFallbackImage?: boolean;
  highlight?: boolean;
  promotion?: string;
}

// Transform Supabase product to local Product interface
function transformProduct(product: MenuProduct, fallbackImage?: string | null): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    price: product.promotional_price ? Number(product.promotional_price) : Number(product.price),
    category: product.category?.slug ?? '',
    image: product.image_url ?? fallbackImage ?? undefined,
    isFallbackImage: !product.image_url && !!fallbackImage,
    highlight: product.is_highlight ?? false,
    promotion: calculatePromotion(Number(product.price), product.promotional_price ? Number(product.promotional_price) : null),
  };
}

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingRef = useRef(false);

  const { toast } = useToast();
  const { tenant } = useTenant();

  const chefLabel =
    (tenant?.theme_settings as Record<string, string> | null)?.chef_suggestion_label?.trim() ||
    "Sugestão do Chef";

  // Fetch data from Supabase
  const { data: categoriesData, isLoading: isLoadingCategories } = useMenuCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useMenuProducts();

  // Waiter call functionality
  const { data: modules } = useTenantModules();
  const { table, setTable } = useTableContext();
  const { data: tables, isLoading: isLoadingTables } = usePublicTables();
  const { hasActiveCall, createCall, isCreatingCall } = useClientServiceCall(table?.id || null);
  const { customerName, saveName } = useCustomerName();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [pendingTableId, setPendingTableId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  // Pré-preenche o campo de nome do diálogo com o nome salvo no aparelho.
  useEffect(() => {
    if (isTableModalOpen) setNameInput(customerName ?? "");
  }, [isTableModalOpen, customerName]);


  const isWaiterCalled = hasActiveCall("waiter", customerName);

  const sendWaiterCall = async (targetTableId: string, name: string | null) => {
    try {
      await createCall({
        tableId: targetTableId,
        sessionId: null,
        callType: "waiter",
        customerName: name,
      });
      toast({
        title: "Atendente chamado!",
        description: name ? `Aguarde ${name}, estamos a caminho.` : "Aguarde, estamos a caminho.",
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

  const handleQuickWaiterCall = async (tableId?: string) => {
    const targetTableId = tableId || table?.id;

    if (!targetTableId) {
      setIsTableModalOpen(true);
      return;
    }

    if (!customerName) {
      setPendingTableId(targetTableId);
      setIsNameModalOpen(true);
      return;
    }

    await sendWaiterCall(targetTableId, customerName);
  };

  const handleTableSelectAndCall = async () => {
    if (!selectedTableId) return;

    const success = await setTable(selectedTableId);
    if (success) {
      const saved = saveName(nameInput);
      await sendWaiterCall(selectedTableId, saved);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível identificar a mesa.",
        variant: "destructive",
      });
    }
  };


  const isLoading = isLoadingCategories || isLoadingProducts;

  // Categories (no "Todos" — the whole menu is always rendered)
  const categories = categoriesData?.map(cat => ({ id: cat.slug, name: cat.name, description: cat.description })) ?? [];

  // Transform products
  const products = productsData?.map((p) => transformProduct(p, tenant?.logo_url)) ?? [];

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
    const q = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      (product.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const highlightedProducts = products.filter((p) => p.highlight);
  const regularProducts = filteredProducts.filter((p) => !p.highlight);

  // Group products by category for the scrollable, collapsible sections
  const sections = useMemo(() => {
    const cats = categoriesData ?? [];
    return cats
      .map((cat) => ({
        id: cat.slug,
        name: cat.name,
        description: cat.description,
        items: regularProducts.filter((p) => p.category === cat.slug),
      }))
      .filter((s) => s.items.length > 0);
  }, [categoriesData, regularProducts]);

  const uncategorized = regularProducts.filter(
    (p) => !(categoriesData ?? []).some((c) => c.slug === p.category)
  );

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const el = sectionRefs.current[id];
    if (el) {
      isScrollingRef.current = true;
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 700);
    }
  };

  // Scroll-spy: highlight the category currently in view
  useEffect(() => {
    if (sections.length === 0) return;

    const onScroll = () => {
      if (isScrollingRef.current) return;
      let current = sections[0].id;
      for (const section of sections) {
        const el = sectionRefs.current[section.id];
        if (!el) continue;
        if (el.getBoundingClientRect().top - 100 <= 0) {
          current = section.id;
        }
      }
      setActiveCategory((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const backTo = tenant?.slug
    ? table?.id
      ? `/${tenant.slug}/mesa/${table.id}`
      : `/${tenant.slug}`
    : "/";

  if (isLoading) {
    return (
      <ClientLayout title="Cardápio" showBack backTo={backTo}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout showBack backTo={backTo}>
      {/* Hero: cover image + circular logo */}
      <div className="-mx-4 mb-16">
        <div className="relative w-full aspect-[16/6] bg-gradient-to-br from-emerald-deep/20 to-emerald-deep/5 overflow-visible">
          <div className="absolute inset-0 overflow-hidden">
          {tenant?.cover_image_url ? (
            <img
              src={tenant.cover_image_url}
              alt={`Capa ${tenant?.name ?? ""}`}
              className="w-full h-full object-cover"
            />
          ) : null}
          </div>
          {/* Logo overlay */}
          <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 z-20">
            <div className="w-28 h-28 rounded-full border-4 border-cream bg-cream shadow-lg overflow-hidden flex items-center justify-center p-1">
              {tenant?.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={`Logo ${tenant?.name ?? ""}`}
                  className="w-full h-full object-contain rounded-full"
                />
              ) : (
                <ChefHat className="h-10 w-10 text-emerald-deep" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chef Highlights Carousel */}
      {highlightedProducts.length > 0 && (
        <div className="mb-6 -mx-4">
          <div className="px-4 mb-3">
            <h2 className="editorial-label text-gold flex items-center gap-2">
              <ChefHat className="h-4 w-4" /> {chefLabel}
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
                  <div
                    className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden group border border-emerald-deep/10"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/95 via-[#064e3b]/40 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold text-emerald-deep text-[10px] font-semibold tracking-widest uppercase">
                        <ChefHat className="h-3 w-3" />
                        Chef
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                      <h3 className="editorial-title text-2xl text-white mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-white/75 line-clamp-2 font-sans-editorial">
                        {product.description}
                      </p>
                    </div>
                  </div>
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
                      ? "bg-gold w-6"
                      : "bg-emerald-deep/20"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs - swipeable carousel */}
      <div className="mb-6 -mx-4 sticky top-0 z-30 bg-background/95 backdrop-blur py-3 border-b border-emerald-deep/10">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
            containScroll: false,
          }}
          className="w-full"
        >
          <CarouselContent className="px-4">
            {categories.map((category) => {
              const count = products.filter((p) => p.category === category.id).length;
              const isActive = activeCategory === category.id;
              return (
                <CarouselItem key={category.id} className="basis-auto pl-0 pr-2 last:pr-0">
                  <button
                    onClick={() => scrollToCategory(category.id)}
                    className={cn(
                      "group flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.18em] uppercase font-medium whitespace-nowrap transition-all border",
                      isActive
                        ? "bg-emerald-deep text-cream border-emerald-deep shadow-md"
                        : "bg-cream-soft text-emerald-deep/70 border-emerald-deep/10 hover:border-gold hover:text-emerald-deep"
                    )}
                  >
                    {category.name}
                    <span
                      className={cn(
                        "text-[10px] rounded-full px-1.5 py-0.5 leading-none",
                        isActive ? "bg-gold text-emerald-deep" : "bg-emerald-deep/8 text-emerald-deep/50"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-deep/40" />
        <Input
          type="search"
          placeholder="Buscar no cardápio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus-visible:ring-emerald-deep/30"
        />
      </div>

      {/* Products grouped by category (collapsible sections) */}
      <div className="space-y-8">
        {sections.map((section) => {
          const isCollapsed = collapsed[section.id] ?? false;
          return (
            <div
              key={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              className="scroll-mt-24"
            >
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [section.id]: !isCollapsed }))
                }
                className="w-full flex items-start justify-between gap-3 mb-2 pb-2 border-b border-emerald-deep/15"
              >
                <div className="text-left">
                  <h2 className="editorial-label text-emerald-deep flex items-center gap-2">
                    {section.name}
                  </h2>
                  {section.description ? (
                    <p className="mt-1 text-sm text-emerald-deep/60 font-sans-editorial italic leading-relaxed">
                      {section.description}
                    </p>
                  ) : null}
                </div>
                <span className="flex items-center gap-2 text-emerald-deep/50 text-xs shrink-0 mt-0.5">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-cream-soft border border-emerald-deep/10 text-emerald-deep/70 text-[10px] font-medium">
                    {section.items.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </span>
              </button>

              {!isCollapsed && (
                <div className="space-y-3">
                  {section.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.image}
                      isFallbackImage={product.isFallbackImage}
                      promotion={product.promotion}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {uncategorized.length > 0 && (
          <div className="space-y-3">
            {uncategorized.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                isFallbackImage={product.isFallbackImage}
                promotion={product.promotion}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product detail popup */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedProduct && (
            <>
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className={`w-full aspect-[4/3] rounded-xl ${selectedProduct.isFallbackImage ? 'object-contain bg-cream-soft p-8' : 'object-cover'}`}
                />
              )}
              <DialogHeader>
                <DialogTitle
                  className="editorial-title text-2xl text-emerald-deep text-left break-words"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {selectedProduct.name}
                </DialogTitle>
                {selectedProduct.description && (
                  <DialogDescription className="text-left font-sans-editorial">
                    {selectedProduct.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              <p className="editorial-title text-3xl text-gold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(selectedProduct.price)}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="editorial-title text-2xl text-emerald-deep/50">Nenhum item encontrado</p>
        </div>
      )}

      {/* Floating Waiter Call Button */}
      {modules?.waiterCall && (
        <button
          onClick={() => handleQuickWaiterCall()}
          disabled={isCreatingCall || isWaiterCalled}
          className={cn(
            "fixed bottom-6 right-6 z-50",
            "w-16 h-16 rounded-full",
            "shadow-xl hover:shadow-2xl",
            "flex items-center justify-center",
            "transition-all duration-300",
            isWaiterCalled
              ? "bg-gold text-emerald-deep cursor-default"
              : "bg-emerald-deep text-cream hover:scale-105 border-2 border-gold/40",
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

            <div className="space-y-1.5">
              <Input
                value={nameInput}
                maxLength={MAX_CUSTOMER_NAME}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Seu nome (opcional)"
                className="h-12 bg-surface placeholder:text-surface-foreground border-border focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Guardamos seu nome neste celular para os próximos chamados.
              </p>
            </div>



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

      <CustomerNameDialog
        open={isNameModalOpen}
        onOpenChange={setIsNameModalOpen}
        initialName={customerName}
        onConfirm={(name) => {
          const saved = saveName(name);
          if (pendingTableId) {
            const target = pendingTableId;
            setPendingTableId(null);
            void sendWaiterCall(target, saved);
          }
        }}
      />
    </ClientLayout>
  );
};

export default MenuPage;
