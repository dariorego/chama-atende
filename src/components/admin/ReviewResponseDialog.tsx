import { useState } from "react";
import { Star, Send, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerReview } from "@/hooks/useAdminReviews";

interface ReviewResponseDialogProps {
  review: CustomerReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { id: string; response: string; publish: boolean; feature: boolean }) => void;
  isSubmitting?: boolean;
}

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

export function ReviewResponseDialog({
  review,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: ReviewResponseDialogProps) {
  const [response, setResponse] = useState(review?.admin_response || "");
  const [publishAfter, setPublishAfter] = useState(review?.status === 'pending');
  const [markFeatured, setMarkFeatured] = useState(false);

  const handleSubmit = () => {
    if (!review || !response.trim()) return;
    
    onSubmit({
      id: review.id,
      response: response.trim(),
      publish: publishAfter,
      feature: markFeatured,
    });
  };

  // Reset form when dialog opens with new review
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && review) {
      setResponse(review.admin_response || "");
      setPublishAfter(review.status === 'pending');
      setMarkFeatured(false);
    }
    onOpenChange(isOpen);
  };

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Responder Avaliação</DialogTitle>
          <DialogDescription>
            Escreva uma resposta para o cliente. A resposta será visível publicamente quando a avaliação for publicada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Review preview */}
          <div className="bg-surface rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{review.customer_name}</span>
              <OverallStars rating={review.overall_rating} />
            </div>
            {review.observations && (
              <p className="text-sm text-muted-foreground">"{review.observations}"</p>
            )}
          </div>

          {/* Response textarea */}
          <div className="space-y-2">
            <Label htmlFor="response">Sua resposta</Label>
            <Textarea
              id="response"
              placeholder="Obrigado por sua avaliação! Ficamos felizes em saber que..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[120px] bg-surface border-border"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {review.status === 'pending' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publish"
                  checked={publishAfter}
                  onCheckedChange={(checked) => setPublishAfter(checked === true)}
                />
                <Label htmlFor="publish" className="flex items-center gap-2 text-sm cursor-pointer">
                  <Check className="h-4 w-4 text-green-500" />
                  Publicar avaliação ao responder
                </Label>
              </div>
            )}

            {!review.is_featured && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="feature"
                  checked={markFeatured}
                  onCheckedChange={(checked) => setMarkFeatured(checked === true)}
                />
                <Label htmlFor="feature" className="flex items-center gap-2 text-sm cursor-pointer">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Marcar como destaque
                </Label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!response.trim() || isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Enviando..." : "Enviar Resposta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
