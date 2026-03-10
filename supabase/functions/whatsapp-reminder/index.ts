import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Environment variables set via: supabase secrets set META_ACCESS_TOKEN=... META_PHONE_NUMBER_ID=...
const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN')
const META_PHONE_NUMBER_ID = Deno.env.get('META_PHONE_NUMBER_ID')
const META_TEMPLATE_NAME = 'rent_reminder' // Must match approved template name in Meta Business Manager

interface ReminderPayload {
  to: string        // 10-digit Indian number e.g. "9876543210"
  guest_name: string
  room: string
  balance_due: string // formatted e.g. "Rs. 8,000"
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
    return new Response(
      JSON.stringify({ error: 'Meta API credentials not configured. Set META_ACCESS_TOKEN and META_PHONE_NUMBER_ID via Supabase secrets.' }),
      { status: 500 }
    )
  }

  let payload: ReminderPayload
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { to, guest_name, room, balance_due } = payload
  if (!to || !guest_name || !room || !balance_due) {
    return new Response(JSON.stringify({ error: 'Missing required fields: to, guest_name, room, balance_due' }), { status: 400 })
  }

  // Normalise to international format: 91XXXXXXXXXX
  const phone = to.replace(/\D/g, '')
  const internationalPhone = phone.startsWith('91') ? phone : `91${phone}`

  const body = {
    messaging_product: 'whatsapp',
    to: internationalPhone,
    type: 'template',
    template: {
      name: META_TEMPLATE_NAME,
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: guest_name },      // {{1}}
            { type: 'text', text: balance_due },      // {{2}}
            { type: 'text', text: room },             // {{3}}
          ],
        },
      ],
    },
  }

  const metaRes = await fetch(
    `https://graph.facebook.com/v20.0/${META_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  const metaData = await metaRes.json()

  if (!metaRes.ok) {
    console.error('Meta API error:', metaData)
    return new Response(
      JSON.stringify({ error: 'WhatsApp API error', details: metaData }),
      { status: metaRes.status }
    )
  }

  return new Response(JSON.stringify({ success: true, message_id: metaData?.messages?.[0]?.id }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
})
