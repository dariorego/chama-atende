-- Tabela de Mesas
CREATE TABLE public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  name TEXT,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'inactive')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Atendentes
CREATE TABLE public.waiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Sessões de Atendimento
CREATE TABLE public.table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  waiter_id UUID REFERENCES public.waiters(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'bill_requested', 'closed')),
  opened_at TIMESTAMPTZ DEFAULT now(),
  bill_requested_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  customer_count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Chamadas de Atendimento
CREATE TABLE public.service_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_session_id UUID REFERENCES public.table_sessions(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('waiter', 'bill', 'help')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
  waiter_id UUID REFERENCES public.waiters(id) ON DELETE SET NULL,
  called_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  response_time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tables
CREATE POLICY "Public read access for active tables" ON public.tables
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tables" ON public.tables
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- RLS Policies for waiters
CREATE POLICY "Public read access for active waiters" ON public.waiters
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage waiters" ON public.waiters
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- RLS Policies for table_sessions
CREATE POLICY "Public read access for table sessions" ON public.table_sessions
  FOR SELECT USING (true);

CREATE POLICY "Public can create table sessions" ON public.table_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update table sessions" ON public.table_sessions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage table sessions" ON public.table_sessions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- RLS Policies for service_calls
CREATE POLICY "Public read access for service calls" ON public.service_calls
  FOR SELECT USING (true);

CREATE POLICY "Public can create service calls" ON public.service_calls
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update service calls" ON public.service_calls
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage service calls" ON public.service_calls
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Triggers for updated_at
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waiters_updated_at
  BEFORE UPDATE ON public.waiters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_table_sessions_updated_at
  BEFORE UPDATE ON public.table_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_calls_updated_at
  BEFORE UPDATE ON public.service_calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_calls;