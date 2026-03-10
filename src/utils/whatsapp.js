import { supabase } from '../lib/supabase'
import { balanceDue, formatRupees } from './business'

/**
 * Send WhatsApp rent reminder via Supabase Edge Function.
 * The Edge Function calls the Meta WhatsApp Cloud API.
 */
export async function sendWhatsAppReminder(guest) {
  const balance = balanceDue(guest)

  const { data, error } = await supabase.functions.invoke('whatsapp-reminder', {
    body: {
      to: guest.phone,
      guest_name: guest.name,
      room: guest.room,
      balance_due: formatRupees(balance),
    },
  })

  if (error) throw error
  return data
}
