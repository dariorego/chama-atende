import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch {
        // If Supabase is temporarily unreachable, avoid infinite loading
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      toast.success('Login realizado com sucesso!');
      return { data, error: null };
    } catch (err) {
      const error = err as Error;
      toast.error('Erro ao fazer login');
      return { error };
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { data, error: null };
    } catch (err) {
      const error = err as Error;
      toast.error('Erro ao criar conta');
      return { error };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao sair');
        return { error };
      }
      toast.success('Logout realizado com sucesso');
      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast.error('Erro ao sair');
      return { error };
    }
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    login,
    signup,
    logout,
  };
}
