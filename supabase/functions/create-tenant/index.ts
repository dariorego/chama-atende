import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateTenantRequest {
  name: string;
  slug: string;
  subtitle?: string | null;
  plan: 'starter' | 'professional' | 'enterprise';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // User client for auth verification
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Sessão inválida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateTenantRequest = await req.json();
    const { name, slug, subtitle, plan } = body;

    // Validate required fields
    if (!name || !slug || !plan) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nome, slug e plano são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Slug inválido. Use apenas letras minúsculas, números e hífens.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if slug is already taken
    const { data: existingRestaurant } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingRestaurant) {
      return new Response(
        JSON.stringify({ success: false, error: 'Este slug já está em uso' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine max_users based on plan
    const maxUsersMap = {
      starter: 3,
      professional: 10,
      enterprise: 999,
    };

    // Create the restaurant
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .insert({
        name,
        slug,
        subtitle: subtitle || null,
        plan,
        owner_id: user.id,
        max_users: maxUsersMap[plan],
        is_active: true,
        status: 'closed',
        features: {
          api: plan === 'enterprise',
          analytics: plan !== 'starter',
          customDomain: plan === 'enterprise',
        },
      })
      .select()
      .single();

    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar restaurante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign owner role to user for this tenant
    const { error: roleError } = await supabaseAdmin
      .from('tenant_user_roles')
      .insert({
        user_id: user.id,
        restaurant_id: restaurant.id,
        role: 'owner',
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Rollback: delete the restaurant
      await supabaseAdmin.from('restaurants').delete().eq('id', restaurant.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao configurar permissões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also give user the admin app_role if they don't have it
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!existingRole) {
      await supabaseAdmin.from('user_roles').insert({
        user_id: user.id,
        role: 'admin',
      });
    }

    // Create default modules for the restaurant
    const defaultModules = [
      'digital_menu',
      'waiter_call',
      'reservations',
      'queue_management',
      'kitchen_orders',
      'customer_reviews',
      'pre_orders',
    ];

    const modulesToInsert = defaultModules.map((moduleName) => ({
      restaurant_id: restaurant.id,
      module_name: moduleName,
      is_active: moduleName === 'digital_menu', // Only digital menu active by default
      settings: {},
    }));

    await supabaseAdmin.from('restaurant_modules').insert(modulesToInsert);

    console.log(`Restaurant ${slug} created successfully for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        restaurant: {
          id: restaurant.id,
          slug: restaurant.slug,
          name: restaurant.name,
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
