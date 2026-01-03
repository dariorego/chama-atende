import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CustomerReview {
  id: string;
  restaurant_id: string;
  customer_name: string;
  phone: string | null;
  ambiente_rating: number | null;
  atendimento_rating: number | null;
  comida_rating: number | null;
  overall_rating: number | null;
  observations: string | null;
  admin_response: string | null;
  responded_at: string | null;
  responded_by: string | null;
  status: 'pending' | 'published' | 'archived';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  published: number;
  archived: number;
  featured: number;
  averageOverall: number;
  averageAmbiente: number;
  averageAtendimento: number;
  averageComida: number;
}

export interface SubmitReviewData {
  restaurant_id: string;
  customer_name: string;
  phone?: string | null;
  ambiente_rating?: number | null;
  atendimento_rating?: number | null;
  comida_rating?: number | null;
  observations?: string | null;
}

// Hook principal para listar avaliações
export function useAdminReviews(status?: string) {
  return useQuery({
    queryKey: ['admin-reviews', status],
    queryFn: async () => {
      let query = supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        if (status === 'featured') {
          query = query.eq('is_featured', true);
        } else {
          query = query.eq('status', status);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CustomerReview[];
    },
  });
}

// Hook para estatísticas de avaliações
export function useReviewStats() {
  return useQuery({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('status, is_featured, overall_rating, ambiente_rating, atendimento_rating, comida_rating');

      if (error) throw error;

      const reviews = data || [];
      const total = reviews.length;
      const pending = reviews.filter(r => r.status === 'pending').length;
      const published = reviews.filter(r => r.status === 'published').length;
      const archived = reviews.filter(r => r.status === 'archived').length;
      const featured = reviews.filter(r => r.is_featured).length;

      // Calculate averages only from reviews with ratings
      const withOverall = reviews.filter(r => r.overall_rating != null);
      const withAmbiente = reviews.filter(r => r.ambiente_rating != null);
      const withAtendimento = reviews.filter(r => r.atendimento_rating != null);
      const withComida = reviews.filter(r => r.comida_rating != null);

      const averageOverall = withOverall.length > 0
        ? withOverall.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / withOverall.length
        : 0;
      const averageAmbiente = withAmbiente.length > 0
        ? withAmbiente.reduce((sum, r) => sum + (r.ambiente_rating || 0), 0) / withAmbiente.length
        : 0;
      const averageAtendimento = withAtendimento.length > 0
        ? withAtendimento.reduce((sum, r) => sum + (r.atendimento_rating || 0), 0) / withAtendimento.length
        : 0;
      const averageComida = withComida.length > 0
        ? withComida.reduce((sum, r) => sum + (r.comida_rating || 0), 0) / withComida.length
        : 0;

      return {
        total,
        pending,
        published,
        archived,
        featured,
        averageOverall: Math.round(averageOverall * 10) / 10,
        averageAmbiente: Math.round(averageAmbiente * 10) / 10,
        averageAtendimento: Math.round(averageAtendimento * 10) / 10,
        averageComida: Math.round(averageComida * 10) / 10,
      } as ReviewStats;
    },
  });
}

// Hook para submeter avaliação (cliente)
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitReviewData) => {
      const { error } = await supabase
        .from('customer_reviews')
        .insert({
          restaurant_id: data.restaurant_id,
          customer_name: data.customer_name,
          phone: data.phone || null,
          ambiente_rating: data.ambiente_rating || null,
          atendimento_rating: data.atendimento_rating || null,
          comida_rating: data.comida_rating || null,
          observations: data.observations || null,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    },
  });
}

// Hook para atualizar status da avaliação
export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'published' | 'archived' }) => {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success("Status atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });
}

// Hook para destacar/remover destaque
export function useToggleFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ is_featured })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success(variables.is_featured ? "Avaliação destacada!" : "Destaque removido!");
    },
    onError: () => {
      toast.error("Erro ao atualizar destaque");
    },
  });
}

// Hook para responder avaliação
export function useRespondToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      response, 
      publish = false,
      feature = false 
    }: { 
      id: string; 
      response: string;
      publish?: boolean;
      feature?: boolean;
    }) => {
      const updates: Record<string, unknown> = {
        admin_response: response,
        responded_at: new Date().toISOString(),
      };

      if (publish) {
        updates.status = 'published';
      }

      if (feature) {
        updates.is_featured = true;
      }

      const { error } = await supabase
        .from('customer_reviews')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success("Resposta enviada!");
    },
    onError: () => {
      toast.error("Erro ao enviar resposta");
    },
  });
}

// Hook para deletar avaliação
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success("Avaliação excluída!");
    },
    onError: () => {
      toast.error("Erro ao excluir avaliação");
    },
  });
}
