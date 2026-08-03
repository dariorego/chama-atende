import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Backend self-hosted (EasyPanel). Fixado no código porque o .env do projeto
// é regravado automaticamente pela plataforma. URL e anon key são públicas.
const SELF_HOSTED_URL = 'https://supabase.chamaatende.com.br';
const SELF_HOSTED_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg1NjMyNzk1LCJleHAiOjE5NDMzMTI3OTV9.Vyem5K430vnpHZrzZtF-Dey3WoZs7ZiIsDQruwTPbL8';

const SUPABASE_URL = SELF_HOSTED_URL;
const SUPABASE_PUBLISHABLE_KEY = SELF_HOSTED_ANON_KEY;

export const SUPABASE_PROJECT_URL = SUPABASE_URL;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});