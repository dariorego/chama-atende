export const STATUS_LABEL: Record<string, string> = {
  disconnected: "Desconectado",
  qr: "Aguardando QR Code",
  connecting: "Conectando",
  connected: "Conectado",
  error: "Erro",
};

export function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "connected") return "default";
  if (status === "error") return "destructive";
  if (status === "qr" || status === "connecting") return "secondary";
  return "outline";
}