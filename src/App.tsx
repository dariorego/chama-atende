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
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Global auth routes (legacy - kept for compatibility) */}
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Admin login - per establishment */}
          <Route path="/admin/:slug/login" element={<LoginPage />} />
          
          {/* Admin routes - protected, with /admin/:slug prefix */}
          <Route
            path="/admin/:slug"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/produtos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/categorias"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/modulos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminModules />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/usuarios"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/configuracoes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/atendimentos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminWaiterCalls />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/reservas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/fila"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminQueue />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/avaliacoes"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminReviews />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/pedidos"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/:slug/metricas"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout>
                  <AdminMetrics />
                </AdminLayout>
              </AuthGuard>
            }
          />

          {/* Public restaurant routes */}
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
