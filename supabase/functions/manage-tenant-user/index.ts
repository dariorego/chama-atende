import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Action = 'create' | 'update' | 'remove';

interface Body {
  action: Action;
  restaurant_id: string;
  user_id?: string;
  email?: string;
  password?: string;
  full_name?: string;
  role?: 'admin' | 'manager' | 'staff';
  modules?: string[];
  is_active?: boolean;
}

const ALLOWED_ROLES = ['admin', 'manager', 'staff'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ success: false, error: 'Não autorizado' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return json({ success: false, error: 'Sessão inválida' }, 401);

    const body: Body = await req.json();
    const { action, restaurant_id } = body;

    if (!action || !restaurant_id) {
      return json({ success: false, error: 'action e restaurant_id são obrigatórios' }, 400);
    }

    // Somente owner/admin do estabelecimento pode gerenciar usuários
    const { data: callerRole } = await supabaseAdmin
      .from('tenant_user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurant_id)
      .maybeSingle();

    if (!callerRole || !['owner', 'admin'].includes(callerRole.role)) {
      return json({ success: false, error: 'Você não tem permissão para gerenciar usuários' }, 403);
    }

    const modules = Array.isArray(body.modules) ? body.modules.filter((m) => typeof m === 'string').slice(0, 50) : [];
    const role = body.role && ALLOWED_ROLES.includes(body.role) ? body.role : 'staff';

    const syncModules = async (targetUserId: string) => {
      await supabaseAdmin
        .from('tenant_user_modules')
        .delete()
        .eq('user_id', targetUserId)
        .eq('restaurant_id', restaurant_id);

      if (role !== 'admin' && modules.length > 0) {
        const rows = modules.map((module_name) => ({
          user_id: targetUserId,
          restaurant_id,
          module_name,
        }));
        const { error } = await supabaseAdmin.from('tenant_user_modules').insert(rows);
        if (error) throw error;
      }
    };

    if (action === 'create') {
      const email = (body.email ?? '').trim().toLowerCase();
      const password = body.password ?? '';
      const fullName = (body.full_name ?? '').trim();

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return json({ success: false, error: 'E-mail inválido' }, 400);
      }
      if (password.length < 8) {
        return json({ success: false, error: 'A senha deve ter ao menos 8 caracteres' }, 400);
      }
      if (!fullName) {
        return json({ success: false, error: 'Nome é obrigatório' }, 400);
      }

      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError || !created?.user) {
        return json({ success: false, error: createError?.message ?? 'Erro ao criar usuário' }, 400);
      }

      const newUserId = created.user.id;

      await supabaseAdmin
        .from('profiles')
        .upsert({ id: newUserId, email, full_name: fullName, restaurant_id, is_active: true });

      const { error: roleError } = await supabaseAdmin
        .from('tenant_user_roles')
        .insert({ user_id: newUserId, restaurant_id, role });
      if (roleError) return json({ success: false, error: roleError.message }, 400);

      await syncModules(newUserId);

      return json({ success: true, user_id: newUserId });
    }

    if (action === 'update') {
      const targetUserId = body.user_id;
      if (!targetUserId) return json({ success: false, error: 'user_id é obrigatório' }, 400);

      const { data: targetRole } = await supabaseAdmin
        .from('tenant_user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .eq('restaurant_id', restaurant_id)
        .maybeSingle();

      if (!targetRole) return json({ success: false, error: 'Usuário não pertence a este estabelecimento' }, 404);
      if (targetRole.role === 'owner') {
        return json({ success: false, error: 'Não é possível alterar o proprietário' }, 403);
      }

      if (typeof body.full_name === 'string' || typeof body.is_active === 'boolean') {
        const update: Record<string, unknown> = {};
        if (typeof body.full_name === 'string') update.full_name = body.full_name.trim();
        if (typeof body.is_active === 'boolean') update.is_active = body.is_active;
        await supabaseAdmin.from('profiles').update(update).eq('id', targetUserId);
      }

      if (body.password) {
        if (body.password.length < 8) {
          return json({ success: false, error: 'A senha deve ter ao menos 8 caracteres' }, 400);
        }
        const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          password: body.password,
        });
        if (error) return json({ success: false, error: error.message }, 400);
      }

      await supabaseAdmin
        .from('tenant_user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('restaurant_id', restaurant_id);

      const { error: roleError } = await supabaseAdmin
        .from('tenant_user_roles')
        .insert({ user_id: targetUserId, restaurant_id, role });
      if (roleError) return json({ success: false, error: roleError.message }, 400);

      await syncModules(targetUserId);

      return json({ success: true });
    }

    if (action === 'remove') {
      const targetUserId = body.user_id;
      if (!targetUserId) return json({ success: false, error: 'user_id é obrigatório' }, 400);
      if (targetUserId === user.id) {
        return json({ success: false, error: 'Você não pode remover seu próprio acesso' }, 400);
      }

      const { data: targetRole } = await supabaseAdmin
        .from('tenant_user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .eq('restaurant_id', restaurant_id)
        .maybeSingle();

      if (targetRole?.role === 'owner') {
        return json({ success: false, error: 'Não é possível remover o proprietário' }, 403);
      }

      await supabaseAdmin
        .from('tenant_user_modules')
        .delete()
        .eq('user_id', targetUserId)
        .eq('restaurant_id', restaurant_id);

      await supabaseAdmin
        .from('tenant_user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('restaurant_id', restaurant_id);

      return json({ success: true });
    }

    return json({ success: false, error: 'Ação inválida' }, 400);
  } catch (error) {
    console.error('manage-tenant-user error:', error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});