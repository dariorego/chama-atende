-- Tabela de avaliações de clientes
CREATE TABLE public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do cliente
  customer_name text NOT NULL,
  phone text,
  
  -- Ratings (1-5)
  ambiente_rating integer CHECK (ambiente_rating >= 1 AND ambiente_rating <= 5),
  atendimento_rating integer CHECK (atendimento_rating >= 1 AND atendimento_rating <= 5),
  comida_rating integer CHECK (comida_rating >= 1 AND comida_rating <= 5),
  overall_rating numeric(2,1) GENERATED ALWAYS AS (
    ROUND((COALESCE(ambiente_rating, 0) + COALESCE(atendimento_rating, 0) + COALESCE(comida_rating, 0))::numeric / 
    NULLIF(
      CASE WHEN ambiente_rating IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN atendimento_rating IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN comida_rating IS NOT NULL THEN 1 ELSE 0 END, 0
    ), 1)
  ) STORED,
  
  -- Conteúdo
  observations text,
  
  -- Resposta do admin
  admin_response text,
  responded_at timestamp with time zone,
  responded_by uuid,
  
  -- Status e controle
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'archived')),
  is_featured boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX idx_customer_reviews_restaurant ON public.customer_reviews(restaurant_id);
CREATE INDEX idx_customer_reviews_status ON public.customer_reviews(status);
CREATE INDEX idx_customer_reviews_created ON public.customer_reviews(created_at DESC);
CREATE INDEX idx_customer_reviews_overall ON public.customer_reviews(overall_rating DESC);

-- Trigger para updated_at
CREATE TRIGGER update_customer_reviews_updated_at
  BEFORE UPDATE ON public.customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Política: Público pode criar avaliações
CREATE POLICY "Public can create reviews"
  ON public.customer_reviews FOR INSERT
  WITH CHECK (true);

-- Política: Público pode ver avaliações publicadas
CREATE POLICY "Public can view published reviews"
  ON public.customer_reviews FOR SELECT
  USING (status = 'published');

-- Política: Admins podem gerenciar todas as avaliações
CREATE POLICY "Admins can manage all reviews"
  ON public.customer_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'manager')
    )
  );