import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ClientLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
}

export function ClientLayout({ children, title, showBack = false, backTo }: ClientLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans-editorial">
      {/* Header */}
      {(showBack || title) && (
        <header className="sticky top-0 z-50 bg-cream/85 backdrop-blur-xl border-b border-emerald-deep/10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4 max-w-2xl">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0 text-emerald-deep hover:bg-emerald-deep/5"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {title && (
              <h1 className="editorial-title text-2xl text-emerald-deep truncate">{title}</h1>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {children}
      </main>
    </div>
  );
}
