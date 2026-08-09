import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TenantProvider } from "@/contexts/TenantContext";
import { TenantThemeApplier } from "@/components/TenantThemeApplier";
import HubPage from "./pages/HubPage";
import MenuPage from "./pages/MenuPage";
import WaiterCallPage from "./pages/WaiterCallPage";
import TableEntryPage from "./pages/TableEntryPage";
import ReservationsPage from "./pages/ReservationsPage";
import QueuePage from "./pages/QueuePage";
import KitchenOrderPage from "./pages/KitchenOrderPage";
import CustomizeOrderPage from "./pages/CustomizeOrderPage";
import OrderReviewPage from "./pages/OrderReviewPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import CustomerReviewPage from "./pages/CustomerReviewPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TenantSelectPage from "./pages/TenantSelectPage";
import OnboardingPage from "./pages/OnboardingPage";
import LandingPage from "./pages/LandingPage";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminImport from "./pages/admin/AdminImport";
import AdminModules from "./pages/admin/AdminModules";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminWaiterCalls from "./pages/admin/AdminWaiterCalls";
import AdminTables from "./pages/admin/AdminTables";
import AdminWaiters from "./pages/admin/AdminWaiters";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminQueue from "./pages/admin/AdminQueue";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderItems from "./pages/admin/AdminOrderItems";
import AdminCombinationGroups from "./pages/admin/AdminCombinationGroups";
import AdminMetrics from "./pages/admin/AdminMetrics";
import AdminPreOrders from "./pages/admin/AdminPreOrders";
import AdminVitrine from "./pages/admin/AdminVitrine";
import AdminComandas from "./pages/admin/AdminComandas";
import AdminEventBookings from "./pages/admin/AdminEventBookings";
import AdminStaffSchedule from "./pages/admin/AdminStaffSchedule";
import AdminWhatsApp from "./pages/admin/AdminWhatsApp";
import AdminLoyalty from "./pages/admin/AdminLoyalty";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminIngredients from "./pages/admin/AdminIngredients";
import AdminRecipes from "./pages/admin/AdminRecipes";
import AdminCmv from "./pages/admin/AdminCmv";
import AdminRecipeEditor from "./pages/admin/AdminRecipeEditor";
import AdminWaste from "./pages/admin/AdminWaste";
import EventBookingPage from "./pages/EventBookingPage";
import VitrineDisplayPage from "./pages/VitrineDisplayPage";
import PreOrderMenuPage from "./pages/PreOrderMenuPage";
import PreOrderCartPage from "./pages/PreOrderCartPage";
import PreOrderCheckoutPage from "./pages/PreOrderCheckoutPage";
import PreOrderStatusPage from "./pages/PreOrderStatusPage";
import SalesPage from "./pages/SalesPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import { useParams } from "react-router-dom";

function AdminRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/login/${slug}`} replace state={{ from: `/admin/${slug}` }} />;
}

function LoginRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/login/${slug}`} replace />;
}

const queryClient = new QueryClient();

// Client pages wrapper with tenant context and client theme
function ClientTenantPages() {
  return (
    <TenantProvider>
      <ThemeProvider storageKey="client-theme" defaultTheme="light">
        <TenantThemeApplier />
        <Routes>
          <Route index element={<HubPage />} />
          <Route path="cardapio" element={<MenuPage />} />
          <Route path="atendimento/:tableId" element={<WaiterCallPage />} />
          <Route path="mesa/:tableId" element={<TableEntryPage />} />
          <Route path="solicitar-atendimento" element={<WaiterCallPage />} />
          <Route path="reservas" element={<ReservationsPage />} />
          <Route path="fila" element={<QueuePage />} />
          <Route path="pedido-cozinha" element={<KitchenOrderPage />} />
          <Route path="pedido-cozinha/:baseId" element={<CustomizeOrderPage />} />
          <Route path="pedido-cozinha/:baseId/revisao" element={<OrderReviewPage />} />
          <Route path="pedido-cozinha/status/:orderId" element={<OrderStatusPage />} />
          <Route path="avaliacao" element={<CustomerReviewPage />} />
          <Route path="encomendas" element={<PreOrderMenuPage />} />
          <Route path="encomendas/carrinho" element={<PreOrderCartPage />} />
          <Route path="encomendas/checkout" element={<PreOrderCheckoutPage />} />
          <Route path="encomendas/status/:orderId" element={<PreOrderStatusPage />} />
          <Route path="vitrine" element={<VitrineDisplayPage />} />
          <Route path="eventos" element={<EventBookingPage />} />
          <Route path="admin" element={<AdminRedirect />} />
          <Route path="login" element={<LoginRedirect />} />
        </Routes>
      </ThemeProvider>
    </TenantProvider>
  );
}

// Admin pages wrapper with tenant context and admin theme
function AdminTenantPages() {
  return (
    <TenantProvider>
      <ThemeProvider storageKey="admin-theme" defaultTheme="light">
        <TenantThemeApplier />
        <Routes>
          <Route
            index
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="produtos"
            element={
              <AuthGuard requireAdmin section="produtos">
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="categorias"
            element={
              <AuthGuard requireAdmin section="categorias">
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="importar"
            element={
              <AuthGuard requireAdmin section="importar">
                <AdminLayout>
                  <AdminImport />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="modulos"
            element={
              <AuthGuard requireAdmin section="modulos">
                <AdminLayout>
                  <AdminModules />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="usuarios"
            element={
              <AuthGuard requireAdmin section="usuarios">
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="configuracoes"
            element={
              <AuthGuard requireAdmin section="configuracoes">
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="atendimentos"
            element={
              <AuthGuard requireAdmin section="atendimentos">
                <AdminLayout>
                  <AdminWaiterCalls />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="mesas"
            element={
              <AuthGuard requireAdmin section="mesas">
                <AdminLayout>
                  <AdminTables />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="atendentes"
            element={
              <AuthGuard requireAdmin section="atendentes">
                <AdminLayout>
                  <AdminWaiters />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="reservas"
            element={
              <AuthGuard requireAdmin section="reservas">
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="fila"
            element={
              <AuthGuard requireAdmin section="fila">
                <AdminLayout>
                  <AdminQueue />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="avaliacoes"
            element={
              <AuthGuard requireAdmin section="avaliacoes">
                <AdminLayout>
                  <AdminReviews />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="pedidos"
            element={
              <AuthGuard requireAdmin section="pedidos">
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="itens-pedido"
            element={
              <AuthGuard requireAdmin section="itens-pedido">
                <AdminLayout>
                  <AdminOrderItems />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="combinacoes"
            element={
              <AuthGuard requireAdmin section="combinacoes">
                <AdminLayout>
                  <AdminCombinationGroups />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="metricas"
            element={
              <AuthGuard requireAdmin section="metricas">
                <AdminLayout>
                  <AdminMetrics />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="encomendas"
            element={
              <AuthGuard requireAdmin section="encomendas">
                <AdminLayout>
                  <AdminPreOrders />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="vitrine"
            element={
              <AuthGuard requireAdmin section="vitrine">
                <AdminLayout>
                  <AdminVitrine />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="comandas"
            element={
              <AuthGuard requireAdmin section="comandas">
                <AdminLayout>
                  <AdminComandas />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="eventos"
            element={
              <AuthGuard requireAdmin section="eventos">
                <AdminLayout>
                  <AdminEventBookings />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="agenda"
            element={
              <AuthGuard requireAdmin section="agenda">
                <AdminLayout>
                  <AdminStaffSchedule />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="whatsapp"
            element={
              <AuthGuard requireAdmin section="whatsapp">
                <AdminLayout>
                  <AdminWhatsApp />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="fidelidade"
            element={
              <AuthGuard requireAdmin section="fidelidade">
                <AdminLayout>
                  <AdminLoyalty />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="cupons"
            element={
              <AuthGuard requireAdmin section="cupons">
                <AdminLayout>
                  <AdminCoupons />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="indicacao"
            element={
              <AuthGuard requireAdmin section="indicacao">
                <AdminLayout>
                  <AdminReferrals />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="insumos"
            element={
              <AuthGuard requireAdmin section="insumos">
                <AdminLayout>
                  <AdminIngredients />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="fichas"
            element={
              <AuthGuard requireAdmin section="fichas">
                <AdminLayout>
                  <AdminRecipes />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="fichas/:recipeId"
            element={
              <AuthGuard requireAdmin section="fichas">
                <AdminLayout>
                  <AdminRecipeEditor />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="desperdicio"
            element={
              <AuthGuard requireAdmin section="desperdicio">
                <AdminLayout>
                  <AdminWaste />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="cmv"
            element={
              <AuthGuard requireAdmin section="cmv">
                <AdminLayout>
                  <AdminCmv />
                </AdminLayout>
              </AuthGuard>
            }
          />
        </Routes>
      </ThemeProvider>
    </TenantProvider>
  );
}

// Global pages wrapper (tenant selection only)
function GlobalPages() {
  return (
    <ThemeProvider storageKey="client-theme" defaultTheme="light">
      <TenantSelectPage />
    </ThemeProvider>
  );
}

function LandingWrapper() {
  return (
    <ThemeProvider storageKey="landing-theme" defaultTheme="light">
      <LandingPage />
    </ThemeProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Global auth routes FIRST (most specific) */}
          <Route path="/vendas" element={<ThemeProvider><SalesPage /></ThemeProvider>} />
          <Route path="/login" element={<Navigate to="/estabelecimentos?admin=1" replace />} />
          <Route path="/login/:slug" element={<TenantProvider><ThemeProvider><TenantThemeApplier /><LoginPage /></ThemeProvider></TenantProvider>} />
          <Route path="/signup" element={<ThemeProvider><SignupPage /></ThemeProvider>} />
          <Route path="/onboarding" element={<ThemeProvider><OnboardingPage /></ThemeProvider>} />

          {/* Module marketing pages */}
          <Route path="/modulos/:moduleSlug" element={<ThemeProvider storageKey="landing-theme" defaultTheme="light"><ModuleDetailPage /></ThemeProvider>} />
          
          {/* Admin routes with tenant slug */}
          <Route path="/admin/:slug/*" element={<AdminTenantPages />} />
          
          {/* Legacy redirect for /admin without slug */}
          <Route path="/admin" element={<Navigate to="/" replace />} />

          {/* Legacy tenant-first routes */}
          <Route path="/:slug/admin" element={<AdminRedirect />} />
          <Route path="/:slug/login" element={<LoginRedirect />} />
          
          {/* Landing page (marketing) */}
          <Route path="/" element={<LandingWrapper />} />

          {/* Tenant selector (list of establishments) */}
          <Route path="/estabelecimentos" element={<GlobalPages />} />
          
          {/* Client routes with tenant slug (AFTER specific routes) */}
          <Route path="/:slug/*" element={<ClientTenantPages />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
