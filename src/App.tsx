import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
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
import { AuthGuard } from "./components/auth/AuthGuard";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
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
import PreOrderMenuPage from "./pages/PreOrderMenuPage";
import PreOrderCartPage from "./pages/PreOrderCartPage";
import PreOrderCheckoutPage from "./pages/PreOrderCheckoutPage";
import PreOrderStatusPage from "./pages/PreOrderStatusPage";
const queryClient = new QueryClient();

// Client pages wrapper with client theme
function ClientPages() {
  return (
    <ThemeProvider storageKey="client-theme" defaultTheme="dark">
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/cardapio" element={<MenuPage />} />
        <Route path="/atendimento/:tableId" element={<WaiterCallPage />} />
        <Route path="/solicitar-atendimento" element={<WaiterCallPage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="/fila" element={<QueuePage />} />
        <Route path="/pedido-cozinha" element={<KitchenOrderPage />} />
        <Route path="/pedido-cozinha/:baseId" element={<CustomizeOrderPage />} />
        <Route path="/pedido-cozinha/:baseId/revisao" element={<OrderReviewPage />} />
        <Route path="/pedido-cozinha/status/:orderId" element={<OrderStatusPage />} />
        <Route path="/avaliacao" element={<CustomerReviewPage />} />
        <Route path="/encomendas" element={<PreOrderMenuPage />} />
        <Route path="/encomendas/carrinho" element={<PreOrderCartPage />} />
        <Route path="/encomendas/checkout" element={<PreOrderCheckoutPage />} />
        <Route path="/encomendas/status/:orderId" element={<PreOrderStatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </ThemeProvider>
  );
}

// Admin pages wrapper with admin theme
function AdminPages() {
  return (
    <ThemeProvider storageKey="admin-theme" defaultTheme="dark">
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/produtos"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/categorias"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/modulos"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminModules />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/usuarios"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/atendimentos"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminWaiterCalls />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/mesas"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminTables />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/atendentes"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminWaiters />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/reservas"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminReservations />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/fila"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminQueue />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/avaliacoes"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminReviews />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/pedidos"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/itens-pedido"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminOrderItems />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/combinacoes"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminCombinationGroups />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/metricas"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminMetrics />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/encomendas"
          element={
            <AuthGuard requireAdmin>
              <AdminLayout>
                <AdminPreOrders />
              </AdminLayout>
            </AuthGuard>
          }
        />
      </Routes>
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
          {/* Admin routes with separate theme */}
          <Route path="/admin/*" element={<AdminPages />} />
          
          {/* Client routes with separate theme */}
          <Route path="/*" element={<ClientPages />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
