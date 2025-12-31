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
          
          {/* Dynamic routes by restaurant slug */}
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
