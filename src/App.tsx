import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/" element={<HubPage />} />
          <Route path="/cardapio" element={<MenuPage />} />
          <Route path="/solicitar-atendimento" element={<WaiterCallPage />} />
          <Route path="/reservas" element={<ReservationsPage />} />
          <Route path="/fila" element={<QueuePage />} />
          <Route path="/pedido-cozinha" element={<KitchenOrderPage />} />
          <Route path="/pedido-cozinha/:baseId" element={<CustomizeOrderPage />} />
          <Route path="/pedido-cozinha/:baseId/revisao" element={<OrderReviewPage />} />
          <Route path="/pedido-cozinha/:baseId/status" element={<OrderStatusPage />} />
          <Route path="/avaliacao" element={<CustomerReviewPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
