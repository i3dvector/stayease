import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { totalRent } from '../utils/business'

export function useGuests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setGuests(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function addGuest(fields) {
    const { data, error } = await supabase
      .from('guests')
      .insert([fields])
      .select()
      .single()
    if (error) throw error
    setGuests(prev => [data, ...prev])
    return data
  }

  async function updateGuest(id, fields) {
    const { data, error } = await supabase
      .from('guests')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setGuests(prev => prev.map(g => g.id === id ? data : g))
    return data
  }

  async function checkOutGuest(id) {
    return updateGuest(id, { status: 'checked-out' })
  }

  async function settleBalance(guest) {
    const amount = totalRent(guest)
    return updateGuest(guest.id, { advance_paid: amount })
  }

  return { guests, loading, error, reload: load, addGuest, updateGuest, checkOutGuest, settleBalance }
}
