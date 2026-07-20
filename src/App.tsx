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
import EventBookingPage from "./pages/EventBookingPage";
import VitrineDisplayPage from "./pages/VitrineDisplayPage";
import PreOrderMenuPage from "./pages/PreOrderMenuPage";
import PreOrderCartPage from "./pages/PreOrderCartPage";
import PreOrderCheckoutPage from "./pages/PreOrderCheckoutPage";
import PreOrderStatusPage from "./pages/PreOrderStatusPage";
import SalesPage from "./pages/SalesPage";
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
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="categorias"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="importar"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminImport />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="modulos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminModules />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="usuarios"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="configuracoes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="atendimentos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminWaiterCalls />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="mesas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminTables />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="atendentes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminWaiters />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="reservas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="fila"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminQueue />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="avaliacoes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminReviews />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="pedidos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="itens-pedido"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminOrderItems />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="combinacoes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminCombinationGroups />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="metricas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminMetrics />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="encomendas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminPreOrders />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="vitrine"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminVitrine />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="comandas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminComandas />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="eventos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminEventBookings />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="agenda"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminStaffSchedule />
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
          <Route path="/login/:slug" element={<TenantProvider><ThemeProvider><LoginPage /></ThemeProvider></TenantProvider>} />
          <Route path="/signup" element={<ThemeProvider><SignupPage /></ThemeProvider>} />
          <Route path="/onboarding" element={<ThemeProvider><OnboardingPage /></ThemeProvider>} />
          
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
