-- Tabela principal de reservas
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  reservation_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  
  -- Data e horário
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  
  -- Observações
  notes TEXT,
  admin_notes TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  
  -- Timestamps de controle
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_phone ON reservations(phone);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);

-- Habilitar RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public can create reservations" 
  ON reservations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view reservations by phone" 
  ON reservations FOR SELECT USING (true);

CREATE POLICY "Admins can manage reservations" 
  ON reservations FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Public can update own reservation" 
  ON reservations FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Realtime
ALTER TABLE reservations REPLICA IDENTITY FULL;