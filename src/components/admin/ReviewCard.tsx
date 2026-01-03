import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, Phone, MessageSquare, Check, Archive, Sparkles, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerReview } from "@/hooks/useAdminReviews";

interface ReviewCardProps {
  review: CustomerReview;
  onRespond: (review: CustomerReview) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onDelete: (id: string) => void;
}

const StarDisplay = ({ rating, label }: { rating: number | null; label: string }) => {
  if (rating === null) return null;
  
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const OverallStars = ({ rating }: { rating: number | null }) => {
  if (rating === null) return null;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 font-semibold text-sm">{rating.toFixed(1)}</span>
    </div>
  );
};

const getStatusBadge = (status: string, is_featured: boolean) => {
  if (is_featured) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
        <Sparkles className="w-3 h-3 mr-1" />
        Destaque
      </Badge>
    );
  }
  
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">Pendente</Badge>;
    case 'published':
      return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Publicada</Badge>;
    case 'archived':
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Arquivada</Badge>;
    default:
      return null;
  }
};

export function ReviewCard({ 
  review, 
  onRespond, 
  onPublish, 
  onArchive, 
  onToggleFeatured,
  onDelete 
}: ReviewCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <>
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <OverallStars rating={review.overall_rating} />
                <span className="text-muted-foreground text-sm">•</span>
                <span className="font-medium">{review.customer_name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(review.status, review.is_featured)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRespond(review)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Responder
                  </DropdownMenuItem>
                  {review.status !== 'published' && (
                    <DropdownMenuItem onClick={() => onPublish(review.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Publicar
                    </DropdownMenuItem>
                  )}
                  {review.status !== 'archived' && (
                    <DropdownMenuItem onClick={() => onArchive(review.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onToggleFeatured(review.id, !review.is_featured)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {review.is_featured ? "Remover destaque" : "Destacar"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Individual ratings */}
          <div className="flex flex-wrap gap-4">
            <StarDisplay rating={review.ambiente_rating} label="Ambiente" />
            <StarDisplay rating={review.atendimento_rating} label="Atendimento" />
            <StarDisplay rating={review.comida_rating} label="Comida" />
          </div>

          {/* Observations */}
          {review.observations && (
            <p className="text-sm text-foreground/90 bg-surface rounded-lg p-3">
              "{review.observations}"
            </p>
          )}

          {/* Admin response */}
          {review.admin_response && (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">Resposta do restaurante:</p>
              <p className="text-sm text-foreground/90">{review.admin_response}</p>
            </div>
          )}

          {/* Footer with contact */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {review.phone ? (
              <a 
                href={`tel:${review.phone}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {review.phone}
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">Sem telefone</span>
            )}

            <div className="flex gap-2">
              {review.status === 'pending' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onArchive(review.id)}>
                    <Archive className="h-4 w-4 mr-1" />
                    Arquivar
                  </Button>
                  <Button size="sm" onClick={() => onPublish(review.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Publicar
                  </Button>
                </>
              )}
              {review.status !== 'pending' && !review.admin_response && (
                <Button size="sm" variant="outline" onClick={() => onRespond(review)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Responder
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A avaliação de {review.customer_name} será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(review.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
