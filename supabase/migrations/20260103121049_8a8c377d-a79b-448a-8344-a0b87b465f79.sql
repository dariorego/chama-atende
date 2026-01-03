-- Tabela principal da fila de espera
CREATE TABLE public.queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  queue_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT,
  party_size INTEGER NOT NULL DEFAULT 2,
  notes TEXT,
  
  -- Status e timestamps
  status TEXT NOT NULL DEFAULT 'waiting' 
    CHECK (status IN ('waiting', 'called', 'seated', 'cancelled', 'no_show')),
  position INTEGER,
  estimated_wait_minutes INTEGER,
  
  -- Timestamps de controle
  joined_at TIMESTAMPTZ DEFAULT now(),
  called_at TIMESTAMPTZ,
  seated_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Notificações
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_queue_entries_joined_at ON queue_entries(joined_at DESC);
CREATE INDEX idx_queue_entries_queue_code ON queue_entries(queue_code);

-- Habilitar RLS
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public can create queue entries" 
  ON queue_entries FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view queue entries" 
  ON queue_entries FOR SELECT USING (true);

CREATE POLICY "Admins can manage queue entries" 
  ON queue_entries FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Public can update own queue entry" 
  ON queue_entries FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_queue_entries_updated_at
  BEFORE UPDATE ON queue_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Realtime
ALTER TABLE queue_entries REPLICA IDENTITY FULL;