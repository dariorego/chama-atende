import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizePhone(p: string) {
  return (p ?? '').replace(/\D/g, '')
}

function isUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)
}
function s(v: unknown, max = 200): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t.length || t.length > max) return null
  return t
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  let payload: any
  try { payload = await req.json() } catch { return json(400, { error: 'Invalid JSON' }) }
  const action = payload?.action as string | undefined
  if (!action) return json(400, { error: 'Missing action' })

  try {
    switch (action) {
      // ---------- ORDERS ----------
      case 'get-order-status': {
        if (!isUuid(payload.orderId)) return json(400, { error: 'orderId required' })
        const { data, error } = await supabase
          .from('orders')
          .select(`id, order_number, table_number, customer_name, status, observations, total_amount,
            created_at, confirmed_at, preparing_at, ready_at, delivered_at, cancelled_at,
            order_line_items ( id, item_name, quantity, unit_price, observations,
              order_line_item_selections ( id, option_name, quantity, additional_price ) )`)
          .eq('id', payload.orderId).maybeSingle()
        if (error) return json(500, { error: error.message })
        return json(200, { data })
      }
      case 'get-queue-position-for-order': {
        if (!isUuid(payload.orderId) || !isUuid(payload.restaurantId)) return json(400, { error: 'orderId, restaurantId required' })
        const { data, error } = await supabase.from('orders')
          .select('id, created_at').eq('restaurant_id', payload.restaurantId)
          .in('status', ['pending','preparing']).order('created_at', { ascending: true })
        if (error) return json(500, { error: error.message })
        const idx = (data ?? []).findIndex((o: any) => o.id === payload.orderId)
        return json(200, { position: idx >= 0 ? idx + 1 : null, totalPending: data?.length ?? 0 })
      }

      // ---------- PRE_ORDERS ----------
      case 'get-preorder-status': {
        if (!isUuid(payload.orderId)) return json(400, { error: 'orderId required' })
        const { data, error } = await supabase.from('pre_orders')
          .select('*, items:pre_order_items(*)').eq('id', payload.orderId).maybeSingle()
        if (error) return json(500, { error: error.message })
        return json(200, { data })
      }

      // ---------- QUEUE ----------
      case 'get-queue-entry': {
        const code = s(payload.queueCode, 20)
        if (!code) return json(400, { error: 'queueCode required' })
        const { data, error } = await supabase.from('queue_entries').select('*')
          .eq('queue_code', code).order('created_at', { ascending: false }).limit(1).maybeSingle()
        if (error) return json(500, { error: error.message })
        return json(200, { data })
      }
      case 'get-queue-position': {
        const code = s(payload.queueCode, 20)
        if (!code) return json(400, { error: 'queueCode required' })
        const { data: entry } = await supabase.from('queue_entries').select('joined_at, status')
          .eq('queue_code', code).order('created_at', { ascending: false }).limit(1).maybeSingle()
        if (!entry || entry.status !== 'waiting') return json(200, { position: null })
        const { count } = await supabase.from('queue_entries')
          .select('*', { count: 'exact', head: true }).eq('status', 'waiting').lt('joined_at', entry.joined_at)
        return json(200, { position: (count ?? 0) + 1 })
      }
      case 'get-queue-stats': {
        // For generating next code + estimating wait
        const today = new Date(); today.setHours(0,0,0,0)
        const { data: latest } = await supabase.from('queue_entries').select('queue_code')
          .gte('created_at', today.toISOString()).order('created_at', { ascending: false }).limit(1)
        const { count: waitingCount } = await supabase.from('queue_entries')
          .select('*', { count: 'exact', head: true }).eq('status', 'waiting')
        const { data: recent } = await supabase.from('queue_entries')
          .select('joined_at, seated_at').eq('status', 'seated')
          .not('seated_at', 'is', null).order('seated_at', { ascending: false }).limit(10)
        return json(200, {
          lastCode: latest?.[0]?.queue_code ?? null,
          waitingCount: waitingCount ?? 0,
          recentSeated: recent ?? [],
        })
      }
      case 'cancel-queue-entry': {
        if (!isUuid(payload.id)) return json(400, { error: 'id required' })
        const { error } = await supabase.from('queue_entries')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('id', payload.id).eq('status', 'waiting')
        if (error) return json(500, { error: error.message })
        return json(200, { ok: true })
      }
      case 'search-queue-by-phone': {
        const rawPhone = s(payload.phone, 20)
        if (!rawPhone) return json(400, { error: 'phone required' })
        const cleanPhone = normalizePhone(rawPhone)
        if (cleanPhone.length < 8) return json(400, { error: 'phone too short' })
        const today = new Date(); today.setHours(0,0,0,0)
        const { data, error } = await supabase.from('queue_entries').select('*')
          .gte('created_at', today.toISOString())
          .ilike('phone', `%${cleanPhone}%`)
          .in('status', ['waiting','called'])
          .order('created_at', { ascending: false }).limit(1).maybeSingle()
        if (error) return json(500, { error: error.message })
        return json(200, { data })
      }

      // ---------- RESERVATIONS ----------
      case 'cancel-reservation': {
        if (!isUuid(payload.id)) return json(400, { error: 'id required' })
        const phone = normalizePhone(payload.phone ?? '')
        if (phone.length < 8) return json(400, { error: 'phone required' })
        const { data: r } = await supabase.from('reservations').select('id, phone').eq('id', payload.id).maybeSingle()
        if (!r) return json(404, { error: 'Not found' })
        if (normalizePhone(r.phone ?? '') !== phone) return json(403, { error: 'Forbidden' })
        const { error } = await supabase.from('reservations')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', payload.id)
        if (error) return json(500, { error: error.message })
        return json(200, { ok: true })
      }

      // ---------- TABLE SESSIONS / SERVICE CALLS ----------
      case 'get-table-session': {
        if (!isUuid(payload.tableId)) return json(400, { error: 'tableId required' })
        const { data, error } = await supabase.from('table_sessions').select('*')
          .eq('table_id', payload.tableId).eq('status', 'open')
          .order('opened_at', { ascending: false }).limit(1).maybeSingle()
        if (error) return json(500, { error: error.message })
        return json(200, { data })
      }
      case 'get-service-calls': {
        if (!isUuid(payload.tableId)) return json(400, { error: 'tableId required' })
        const { data, error } = await supabase.from('service_calls').select('*')
          .eq('table_id', payload.tableId)
          .in('status', ['pending','acknowledged','in_progress'])
          .order('called_at', { ascending: false })
        if (error) return json(500, { error: error.message })
        return json(200, { data: data ?? [] })
      }
      case 'cancel-service-call': {
        if (!isUuid(payload.callId) || !isUuid(payload.tableId)) return json(400, { error: 'callId, tableId required' })
        const { data: call } = await supabase.from('service_calls').select('table_id').eq('id', payload.callId).maybeSingle()
        if (!call || call.table_id !== payload.tableId) return json(403, { error: 'Forbidden' })
        const { error } = await supabase.from('service_calls').update({ status: 'cancelled' }).eq('id', payload.callId)
        if (error) return json(500, { error: error.message })
        return json(200, { ok: true })
      }

      default:
        return json(400, { error: `Unknown action: ${action}` })
    }
  } catch (e) {
    return json(500, { error: (e as Error).message })
  }
})