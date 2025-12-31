import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
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
import AdminReservations from "./pages/admin/AdminReservations";
import AdminQueue from "./pages/admin/AdminQueue";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMetrics from "./pages/admin/AdminMetrics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing page - redirects to default restaurant */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Admin routes - protected */}
          <Route
            path="/:slug/admin"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/produtos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/categorias"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/modulos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminModules />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/usuarios"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/configuracoes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/atendimentos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminWaiterCalls />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/reservas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/fila"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminQueue />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/avaliacoes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminReviews />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/pedidos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/:slug/admin/metricas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminMetrics />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route path="/:slug" element={<HubPage />} />
          <Route path="/:slug/cardapio" element={<MenuPage />} />
          <Route path="/:slug/solicitar-atendimento" element={<WaiterCallPage />} />
          <Route path="/:slug/reservas" element={<ReservationsPage />} />
          <Route path="/:slug/fila" element={<QueuePage />} />
          <Route path="/:slug/pedido-cozinha" element={<KitchenOrderPage />} />
          <Route path="/:slug/pedido-cozinha/:baseId" element={<CustomizeOrderPage />} />
          <Route path="/:slug/pedido-cozinha/:baseId/revisao" element={<OrderReviewPage />} />
          <Route path="/:slug/pedido-cozinha/:baseId/status" element={<OrderStatusPage />} />
          <Route path="/:slug/avaliacao" element={<CustomerReviewPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
