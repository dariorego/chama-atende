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
import { useTenant } from "@/contexts/TenantContext";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  restaurantName?: string | null;
  slug?: string | null;
}

export const QRCodeDialog = ({ open, onOpenChange, table, restaurantName, slug }: QRCodeDialogProps) => {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const { tenant } = useTenant();

  if (!table) return null;

  const baseUrl = window.location.origin;
  const tableUrl = slug
    ? `${baseUrl}/${slug}/mesa/${table.id}`
    : `${baseUrl}/?mesa=${table.id}`;

  // Branding: puxa cores do tenant (fallback verde/creme como no modelo)
  const primaryColor = tenant?.theme_colors?.primary || "#a8c47a";
  const secondaryColor = tenant?.theme_colors?.secondary || "#fdf6c9";
  const primaryText = tenant?.theme_colors?.primary_foreground || "#2d4a1a";
  const logoUrl = tenant?.logo_url || "";
  const displayName = restaurantName || tenant?.name || "";
  const tableLabel = `MESA ${table.number.toString().padStart(2, "0")}`;

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
    if (!ctx) return;

    // Cartaz A6 vertical (proporção do modelo): 900x1272
    const W = 900;
    const H = 1272;
    const topH = Math.round(H * 0.55);

    canvas.width = W;
    canvas.height = H;

    // Fundo superior (cor primária)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, W, topH);
    // Fundo inferior (cor secundária)
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, topH, W, H - topH);

    // Título "MESA XX"
    ctx.fillStyle = primaryText;
    ctx.font = "bold 78px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tableLabel, W / 2, 130);

    // Card branco do QR
    const qrSize = 560;
    const qrX = (W - qrSize) / 2;
    const qrY = 210;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 48);

    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      const finalize = () => {
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qrcode-mesa-${table.number.toString().padStart(2, "0")}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      // Logo (ou nome) no rodapé
      if (logoUrl) {
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = () => {
          const maxW = W * 0.65;
          const maxH = (H - topH) * 0.7;
          const ratio = Math.min(maxW / logo.width, maxH / logo.height);
          const lw = logo.width * ratio;
          const lh = logo.height * ratio;
          ctx.drawImage(logo, (W - lw) / 2, topH + ((H - topH) - lh) / 2, lw, lh);
          finalize();
        };
        logo.onerror = () => {
          ctx.fillStyle = primaryText;
          ctx.font = "bold 64px system-ui, sans-serif";
          ctx.fillText(displayName, W / 2, topH + (H - topH) / 2);
          finalize();
        };
        logo.src = logoUrl;
      } else {
        ctx.fillStyle = primaryText;
        ctx.font = "bold 64px system-ui, sans-serif";
        ctx.fillText(displayName, W / 2, topH + (H - topH) / 2);
        finalize();
      }
    };
    qrImg.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
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
          <title>QR Code - ${displayName || tableLabel}</title>
          <style>
            @page { size: A6 portrait; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .poster {
              width: 100vw;
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .top {
              flex: 0 0 55%;
              background: ${primaryColor};
              color: ${primaryText};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              padding: 24px 20px 20px;
            }
            .top h1 {
              margin: 0 0 16px;
              font-size: 34px;
              font-weight: 800;
              letter-spacing: 1px;
            }
            .qr-box {
              background: #fff;
              padding: 14px;
              border-radius: 6px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.08);
            }
            .qr-box svg { display: block; width: 260px; height: 260px; }
            .bottom {
              flex: 1 1 45%;
              background: ${secondaryColor};
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
            }
            .bottom img { max-width: 70%; max-height: 80%; object-fit: contain; }
            .bottom .fallback {
              font-size: 32px;
              font-weight: 800;
              color: ${primaryText};
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="top">
              <h1>${tableLabel}</h1>
              <div class="qr-box">${svgData}</div>
            </div>
            <div class="bottom">
              ${logoUrl
                ? `<img src="${logoUrl}" alt="${displayName}" />`
                : `<div class="fallback">${displayName}</div>`}
            </div>
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
          <DialogTitle>QR Code - {tableLabel}</DialogTitle>
          <DialogDescription>
            {table.name || "Prévia do cartaz que será impresso"}
          </DialogDescription>
        </DialogHeader>

        {/* Prévia do cartaz no mesmo layout da impressão */}
        <div className="mx-auto w-full max-w-[280px] rounded-lg overflow-hidden shadow-md border">
          <div
            ref={qrRef}
            className="flex flex-col items-center pt-4 pb-5 px-4"
            style={{ backgroundColor: primaryColor, color: primaryText }}
          >
            <h3 className="text-xl font-extrabold tracking-wide mb-3">{tableLabel}</h3>
            <div className="bg-white p-3 rounded-sm shadow-sm">
              <QRCodeSVG value={tableUrl} size={180} level="H" includeMargin={false} />
            </div>
          </div>
          <div
            className="flex items-center justify-center py-6 px-4 min-h-[130px]"
            style={{ backgroundColor: secondaryColor }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={displayName} className="max-h-24 max-w-[70%] object-contain" />
            ) : (
              <span className="text-lg font-extrabold" style={{ color: primaryText }}>
                {displayName}
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center break-all px-4">
          {tableUrl}
        </p>

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
