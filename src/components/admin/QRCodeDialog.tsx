import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table } from "@/hooks/useAdminTables";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
}

export const QRCodeDialog = ({ open, onOpenChange, table }: QRCodeDialogProps) => {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  if (!table) return null;

  const baseUrl = window.location.origin;
  const tableUrl = `${baseUrl}/atendimento/${table.id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(tableUrl);
      toast({
        title: "URL copiada!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qrcode-mesa-${table.number.toString().padStart(2, "0")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - Mesa ${table.number.toString().padStart(2, "0")}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 8px;
            }
            p {
              color: #666;
              margin-bottom: 24px;
            }
            .qr-code {
              margin: 24px 0;
            }
            .url {
              font-size: 12px;
              color: #999;
              word-break: break-all;
              max-width: 300px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Mesa ${table.number.toString().padStart(2, "0")}</h1>
            ${table.name ? `<p>${table.name}</p>` : ""}
            <div class="qr-code">${svgData}</div>
            <p>Escaneie para chamar o atendente</p>
            <p class="url">${tableUrl}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - Mesa {table.number.toString().padStart(2, "0")}</DialogTitle>
          <DialogDescription>
            {table.name || "Escaneie para acessar a página de atendimento"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div ref={qrRef} className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={tableUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center break-all max-w-full px-4">
            {tableUrl}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCopyUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar URL
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PNG
          </Button>
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
