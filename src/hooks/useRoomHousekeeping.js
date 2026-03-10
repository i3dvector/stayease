import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ROOMS = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6']

export function useRoomHousekeeping() {
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase
      .from('room_housekeeping')
      .select('room, status')
    if (error) {
      console.error('useRoomHousekeeping load error:', error.message)
      const defaults = {}
      ROOMS.forEach(r => { defaults[r] = 'clean' })
      setStatuses(defaults)
    } else {
      const map = {}
      data.forEach(row => { map[row.room] = row.status })
      ROOMS.forEach(r => { if (!map[r]) map[r] = 'clean' })
      setStatuses(map)
    }
    setLoading(false)
  }

  async function updateStatus(room, status) {
    // Optimistic update
    setStatuses(prev => ({ ...prev, [room]: status }))
    const { error } = await supabase
      .from('room_housekeeping')
      .upsert({ room, status, updated_at: new Date().toISOString() }, { onConflict: 'room' })
    if (error) {
      console.error('updateStatus error:', error.message)
      load() // revert on failure
    }
  }

  return { statuses, loading, updateStatus }
}
