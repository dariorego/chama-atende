import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappDashboard } from "@/components/admin/whatsapp/WhatsappDashboard";
import { WhatsappConnections } from "@/components/admin/whatsapp/WhatsappConnections";
import { WhatsappConversations } from "@/components/admin/whatsapp/WhatsappConversations";
import { WhatsappAiSettings } from "@/components/admin/whatsapp/WhatsappAiSettings";
import { WhatsappPrompts } from "@/components/admin/whatsapp/WhatsappPrompts";
import { WhatsappLogs } from "@/components/admin/whatsapp/WhatsappLogs";

export default function AdminWhatsApp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">WhatsApp AI</h1>
        <p className="text-sm text-muted-foreground">
          Conecte seu número, acompanhe as conversas e configure o comportamento do chatbot inteligente.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
          <TabsTrigger value="settings">Configuração da IA</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <WhatsappDashboard />
        </TabsContent>
        <TabsContent value="connections">
          <WhatsappConnections />
        </TabsContent>
        <TabsContent value="conversations">
          <WhatsappConversations />
        </TabsContent>
        <TabsContent value="settings">
          <WhatsappAiSettings />
        </TabsContent>
        <TabsContent value="prompts">
          <WhatsappPrompts />
        </TabsContent>
        <TabsContent value="logs">
          <WhatsappLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}