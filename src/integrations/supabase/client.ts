import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// URL e chave pública vêm das variáveis de ambiente (.env),
// permitindo apontar para Supabase Cloud ou self-hosted sem alterar código.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
// This is the public anon key (safe to use in the frontend)
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Configuração do Supabase ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});