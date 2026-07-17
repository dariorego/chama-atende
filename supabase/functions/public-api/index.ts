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
function num(v: unknown, min = 0, max = 100000): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return n
}
function intN(v: unknown, min = 1, max = 100): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isInteger(n) || n < min || n > max) return null
  return n
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
      case 'create-order': {
        if (!isUuid(payload.restaurantId)) return json(400, { error: 'restaurantId required' })
        const customer_name = payload.customerName ? s(payload.customerName, 100) : null
        const table_number = s(payload.tableNumber, 20)
        if (!table_number) return json(400, { error: 'tableNumber required' })
        const observations = payload.observations ? s(payload.observations, 1000) : null
        const { data, error } = await supabase.from('orders').insert({
          restaurant_id: payload.restaurantId,
          customer_name,
          table_number,
          observations,
          status: 'pending',
        }).select('id, order_number').single()
        if (error) return json(500, { error: error.message })
        return json(200, { data })
      }
      case 'create-preorder': {
        // Strictly whitelist fields; never trust client-supplied status,
        // admin_response, timestamps, or prices.
        const body = payload.preOrder
        const items = payload.items
        if (!body || !Array.isArray(items) || items.length === 0) {
          return json(400, { error: 'preOrder and non-empty items required' })
        }
        if (!isUuid(body.restaurant_id)) return json(400, { error: 'restaurant_id required' })
        const customer_name = s(body.customer_name, 100)
        if (!customer_name) return json(400, { error: 'customer_name required' })
        const customer_phone = normalizePhone(body.customer_phone ?? '')
        if (customer_phone.length < 8 || customer_phone.length > 20) {
          return json(400, { error: 'customer_phone required' })
        }
        const pickup_date = s(body.pickup_date, 20)
        const pickup_time = s(body.pickup_time, 20)
        if (!pickup_date || !pickup_time) return json(400, { error: 'pickup_date and pickup_time required' })
        const paymentMethodRaw = typeof body.payment_method === 'string' ? body.payment_method : ''
        const payment_method = ['pix', 'card'].includes(paymentMethodRaw) ? paymentMethodRaw : null
        const observations = body.observations != null ? s(body.observations, 1000) : null

        // Server-side price lookup: fetch authoritative prices for all products
        const productIds: string[] = []
        for (const it of items) {
          if (!isUuid(it?.product_id)) return json(400, { error: 'invalid item product_id' })
          if (!intN(it?.quantity, 1, 100)) return json(400, { error: 'invalid item quantity' })
          productIds.push(it.product_id)
        }
        const { data: products, error: pErr } = await supabase
          .from('menu_products')
          .select('id, name, price, promotional_price, restaurant_id, is_active, is_orderable')
          .in('id', productIds)
          .eq('restaurant_id', body.restaurant_id)
        if (pErr) return json(500, { error: pErr.message })
        const priceMap = new Map<string, { name: string; price: number }>()
        for (const p of products ?? []) {
          if (!p.is_active || !p.is_orderable) continue
          const unit = Number(p.promotional_price ?? p.price ?? 0)
          priceMap.set(p.id, { name: p.name, price: unit })
        }

        const safeItems: Array<{ product_id: string; product_name: string; quantity: number; unit_price: number; observations: string | null }> = []
        let total_amount = 0
        for (const it of items) {
          const info = priceMap.get(it.product_id)
          if (!info) return json(400, { error: 'Product not available' })
          const quantity = intN(it.quantity, 1, 100)!
          const obs = it?.observations != null ? s(it.observations, 500) : null
          safeItems.push({
            product_id: it.product_id,
            product_name: info.name,
            quantity,
            unit_price: info.price,
            observations: obs,
          })
          total_amount += info.price * quantity
        }

        const insertPayload = {
          restaurant_id: body.restaurant_id,
          customer_name,
          customer_phone,
          pickup_date,
          pickup_time,
          payment_method,
          observations,
          total_amount,
          status: 'pending' as const,
        }
        const { data: created, error } = await supabase
          .from('pre_orders')
          .insert(insertPayload)
          .select('id, order_number')
          .single()
        if (error) return json(500, { error: error.message })

        const withOrder = safeItems.map((it) => ({ ...it, pre_order_id: created.id }))
        const { error: iErr } = await supabase.from('pre_order_items').insert(withOrder)
        if (iErr) return json(500, { error: iErr.message })

        return json(200, { data: created })
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

      // ---------- ORDER LINE ITEMS (server-side pricing) ----------
      case 'create-order-line-item': {
        if (!isUuid(payload.orderId)) return json(400, { error: 'orderId required' })
        if (!isUuid(payload.orderItemId)) return json(400, { error: 'orderItemId required' })
        const quantity = intN(payload.quantity, 1, 100) ?? 1
        const observations = payload.observations != null ? s(payload.observations, 500) : null

        // Load order + item and cross-check restaurant scope. Only recent orders.
        const { data: order, error: oErr } = await supabase
          .from('orders')
          .select('id, restaurant_id, created_at')
          .eq('id', payload.orderId)
          .maybeSingle()
        if (oErr) return json(500, { error: oErr.message })
        if (!order) return json(404, { error: 'Order not found' })
        const ageMs = Date.now() - new Date(order.created_at ?? Date.now()).getTime()
        if (ageMs > 24 * 60 * 60 * 1000) return json(403, { error: 'Order too old' })

        const { data: item, error: iErr } = await supabase
          .from('order_items')
          .select('id, name, price, restaurant_id, is_active')
          .eq('id', payload.orderItemId)
          .maybeSingle()
        if (iErr) return json(500, { error: iErr.message })
        if (!item || !item.is_active) return json(400, { error: 'Item not available' })
        if (item.restaurant_id !== order.restaurant_id) return json(400, { error: 'Item does not belong to order restaurant' })

        const unit_price = Number(item.price ?? 0)

        // Handle client-supplied selections: look up authoritative additional_price
        const selectionsIn = Array.isArray(payload.selections) ? payload.selections : []
        const optionIds: string[] = []
        for (const sel of selectionsIn) {
          if (!isUuid(sel?.optionId)) return json(400, { error: 'invalid selection optionId' })
          if (!intN(sel?.quantity, 1, 100)) return json(400, { error: 'invalid selection quantity' })
          optionIds.push(sel.optionId)
        }

        let optionMap = new Map<string, { name: string; additional_price: number }>()
        if (optionIds.length > 0) {
          const { data: options, error: opErr } = await supabase
            .from('order_combination_options')
            .select('id, name, additional_price, is_active, group_id, order_combination_groups!inner(restaurant_id, is_active)')
            .in('id', optionIds)
          if (opErr) return json(500, { error: opErr.message })
          for (const op of options ?? []) {
            const grp = (op as any).order_combination_groups
            if (!op.is_active || !grp?.is_active) continue
            if (grp.restaurant_id !== order.restaurant_id) continue
            optionMap.set(op.id, { name: op.name, additional_price: Number(op.additional_price ?? 0) })
          }
          for (const sel of selectionsIn) {
            if (!optionMap.has(sel.optionId)) return json(400, { error: 'Invalid selection option' })
          }
        }

        const { data: lineItem, error: liErr } = await supabase
          .from('order_line_items')
          .insert({
            order_id: order.id,
            order_item_id: item.id,
            item_name: item.name,
            quantity,
            unit_price,
            observations,
          })
          .select('id')
          .single()
        if (liErr) return json(500, { error: liErr.message })

        if (selectionsIn.length > 0) {
          const rows = selectionsIn.map((sel: any) => {
            const info = optionMap.get(sel.optionId)!
            return {
              line_item_id: lineItem.id,
              combination_option_id: sel.optionId,
              option_name: info.name,
              quantity: intN(sel.quantity, 1, 100) ?? 1,
              additional_price: info.additional_price,
            }
          })
          const { error: selErr } = await supabase.from('order_line_item_selections').insert(rows)
          if (selErr) return json(500, { error: selErr.message })
        }

        return json(200, { data: { id: lineItem.id } })
      }

      // ---------- QUEUE ----------
      case 'get-queue-entry': {
        const code = s(payload.queueCode, 20)
        if (!code) return json(400, { error: 'queueCode required' })
        const providedPhone = payload.phone != null ? normalizePhone(payload.phone) : ''
        const { data, error } = await supabase.from('queue_entries')
          .select('id, queue_code, restaurant_id, status, position, estimated_wait_minutes, party_size, joined_at, called_at, seated_at, cancelled_at, customer_name, phone, notes')
          .eq('queue_code', code)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (error) return json(500, { error: error.message })
        if (!data) return json(200, { data: null })
        const storedPhone = normalizePhone(data.phone ?? '')
        const ownerMatch = storedPhone.length > 0 && storedPhone === providedPhone
        if (ownerMatch) {
          return json(200, { data })
        }
        // Non-owner: return only non-identifying fields so lookups by code
        // can still show status/position but never leak name/phone/notes.
        const { customer_name: _n, phone: _p, notes: _o, ...safe } = data as any
        return json(200, { data: safe })
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
        const providedPhone = normalizePhone(payload.phone ?? '')
        if (providedPhone.length < 8) return json(400, { error: 'phone required' })
        const { data: entry, error: fetchErr } = await supabase.from('queue_entries')
          .select('id, phone, status').eq('id', payload.id).maybeSingle()
        if (fetchErr) return json(500, { error: fetchErr.message })
        if (!entry) return json(404, { error: 'Not found' })
        if (normalizePhone(entry.phone ?? '') !== providedPhone) return json(403, { error: 'Forbidden' })
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
        // Exact match on normalized phone only — never a substring match.
        const { data, error } = await supabase.from('queue_entries').select('*')
          .gte('created_at', today.toISOString())
          .eq('phone', cleanPhone)
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
        // Return session existence + basic fields WITHOUT the session_token,
        // so a client cannot obtain the token just by knowing tableId.
        const { data, error } = await supabase.from('table_sessions')
          .select('id, table_id, status, opened_at, bill_requested_at, closed_at, customer_count')
          .eq('table_id', payload.tableId).eq('status', 'open')
          .order('opened_at', { ascending: false }).limit(1).maybeSingle()
        if (error) return json(500, { error: error.message })
        return json(200, { data })
      }
      case 'open-table-session': {
        // Create OR return existing open session. Only returns the session_token
        // when a NEW session is created — subsequent callers see no token.
        if (!isUuid(payload.tableId)) return json(400, { error: 'tableId required' })
        // Verify table exists and is active
        const { data: table, error: tErr } = await supabase.from('tables')
          .select('id, restaurant_id, is_active').eq('id', payload.tableId).maybeSingle()
        if (tErr) return json(500, { error: tErr.message })
        if (!table || !table.is_active) return json(404, { error: 'Table not found' })

        const { data: existing } = await supabase.from('table_sessions')
          .select('id, table_id, status, opened_at, customer_count')
          .eq('table_id', payload.tableId).eq('status', 'open')
          .order('opened_at', { ascending: false }).limit(1).maybeSingle()
        if (existing) return json(200, { data: existing, sessionToken: null })

        const { data: created, error: cErr } = await supabase.from('table_sessions')
          .insert({ table_id: payload.tableId, restaurant_id: table.restaurant_id, status: 'open' })
          .select('id, table_id, status, opened_at, customer_count, session_token')
          .single()
        if (cErr) return json(500, { error: cErr.message })
        const { session_token, ...safe } = created as any
        return json(200, { data: safe, sessionToken: session_token })
      }
      case 'get-service-calls': {
        if (!isUuid(payload.tableId)) return json(400, { error: 'tableId required' })
        if (!isUuid(payload.sessionToken)) return json(403, { error: 'sessionToken required' })
        const { data: session } = await supabase.from('table_sessions')
          .select('id').eq('table_id', payload.tableId)
          .eq('session_token', payload.sessionToken).maybeSingle()
        if (!session) return json(403, { error: 'Forbidden' })
        const { data, error } = await supabase.from('service_calls').select('*')
          .eq('table_session_id', session.id)
          .in('status', ['pending','acknowledged','in_progress'])
          .order('called_at', { ascending: false })
        if (error) return json(500, { error: error.message })
        return json(200, { data: data ?? [] })
      }
      case 'cancel-service-call': {
        if (!isUuid(payload.callId) || !isUuid(payload.tableId)) return json(400, { error: 'callId, tableId required' })
        if (!isUuid(payload.sessionToken)) return json(403, { error: 'sessionToken required' })
        const { data: session } = await supabase.from('table_sessions')
          .select('id').eq('table_id', payload.tableId)
          .eq('session_token', payload.sessionToken).maybeSingle()
        if (!session) return json(403, { error: 'Forbidden' })
        const { data: call } = await supabase.from('service_calls')
          .select('id, table_id, table_session_id').eq('id', payload.callId).maybeSingle()
        if (!call || call.table_id !== payload.tableId || call.table_session_id !== session.id) {
          return json(403, { error: 'Forbidden' })
        }
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