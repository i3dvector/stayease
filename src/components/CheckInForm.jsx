import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useGuests } from '../hooks/useGuests'
import { totalRent, balanceDue, formatRupees } from '../utils/business'
import { useToast } from './ui/Toast'

const ROOMS = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6']
const ID_TYPES = ['Aadhar', 'Passport', 'Voter ID', 'Driving Licence', 'PAN']
const PURPOSES = ['Work', 'Travel', 'Study', 'Medical', 'Family', 'Other']

const EMPTY = {
  name: '', phone: '', purpose: '', id_type: 'Aadhar', id_number: '',
  room: '', monthly_rent: '', check_in: '', check_out: '',
  address: '', advance_paid: '',
}

export function CheckInForm({ open, onClose, editGuest = null, prefilledRoom = null }) {
  const { guests, addGuest, updateGuest } = useGuests()
  const { addToast } = useToast()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Prefill when editing or room pre-selected
  useEffect(() => {
    if (!open) return
    if (editGuest) {
      setForm({
        name: editGuest.name ?? '',
        phone: editGuest.phone ?? '',
        purpose: editGuest.purpose ?? '',
        id_type: editGuest.id_type ?? 'Aadhar',
        id_number: editGuest.id_number ?? '',
        room: editGuest.room ?? '',
        monthly_rent: editGuest.monthly_rent ?? '',
        check_in: editGuest.check_in ?? '',
        check_out: editGuest.check_out ?? '',
        address: editGuest.address ?? '',
        advance_paid: editGuest.advance_paid ?? '',
      })
    } else {
      setForm({ ...EMPTY, room: prefilledRoom ?? '' })
    }
    setErrors({})
  }, [open, editGuest, prefilledRoom])

  // Rooms occupied by OTHER active guests (exclude the one being edited)
  const occupiedRooms = guests
    .filter(g => g.status === 'checked-in' && g.id !== editGuest?.id)
    .map(g => g.room)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) errs.phone = 'Must be a 10-digit number'
    if (!form.id_type) errs.id_type = 'Required'
    if (!form.room) errs.room = 'Required'
    if (!form.monthly_rent || Number(form.monthly_rent) <= 0) errs.monthly_rent = 'Enter a valid amount'
    if (!form.check_in) errs.check_in = 'Required'
    if (!form.check_out) errs.check_out = 'Required'
    if (form.check_in && form.check_out && form.check_out <= form.check_in) {
      errs.check_out = 'Must be after check-in date'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      purpose: form.purpose || null,
      id_type: form.id_type,
      id_number: form.id_number.trim() || null,
      room: form.room,
      monthly_rent: Number(form.monthly_rent),
      check_in: form.check_in,
      check_out: form.check_out,
      address: form.address.trim() || null,
      advance_paid: Number(form.advance_paid) || 0,
    }

    try {
      if (editGuest) {
        await updateGuest(editGuest.id, payload)
        addToast(`${payload.name} updated`)
      } else {
        await addGuest({ ...payload, status: 'checked-in' })
        addToast(`${payload.name} checked in`)
      }
      onClose()
    } catch (err) {
      addToast(err.message ?? 'Failed to save guest', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Live rent preview
  const previewGuest = form.check_in && form.check_out && form.monthly_rent
    ? { check_in: form.check_in, check_out: form.check_out, monthly_rent: Number(form.monthly_rent), advance_paid: Number(form.advance_paid) || 0 }
    : null
  const rentTotal = previewGuest ? totalRent(previewGuest) : null
  const balance = previewGuest ? balanceDue(previewGuest) : null

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full md:max-w-2xl md:rounded-xl shadow-2xl max-h-screen md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {editGuest ? `Edit — ${editGuest.name}` : 'New Check-In'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *" error={errors.name}>
              <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls(errors.name)} placeholder="Arjun Sharma" />
            </Field>
            <Field label="Phone Number * (WhatsApp)" error={errors.phone}>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls(errors.phone)} placeholder="9876543210" maxLength={10} />
            </Field>
          </div>

          {/* Room + Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Room *" error={errors.room}>
              <select value={form.room} onChange={e => set('room', e.target.value)} className={inputCls(errors.room)}>
                <option value="">Select room</option>
                {ROOMS.map(r => (
                  <option key={r} value={r} disabled={occupiedRooms.includes(r)}>
                    {r}{occupiedRooms.includes(r) ? ' (Occupied)' : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Purpose of Stay">
              <select value={form.purpose} onChange={e => set('purpose', e.target.value)} className={inputCls()}>
                <option value="">Select (optional)</option>
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          {/* ID Type + ID Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ID Type *" error={errors.id_type}>
              <select value={form.id_type} onChange={e => set('id_type', e.target.value)} className={inputCls(errors.id_type)}>
                {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="ID Number">
              <input value={form.id_number} onChange={e => set('id_number', e.target.value)} className={inputCls()} placeholder="Document number" />
            </Field>
          </div>

          {/* Check-in + Check-out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Check-In Date *" error={errors.check_in}>
              <input type="date" value={form.check_in} onChange={e => set('check_in', e.target.value)} className={inputCls(errors.check_in)} />
            </Field>
            <Field label="Check-Out Date *" error={errors.check_out}>
              <input type="date" value={form.check_out} onChange={e => set('check_out', e.target.value)} className={inputCls(errors.check_out)} />
            </Field>
          </div>

          {/* Monthly Rent + Advance Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Monthly Rent (Rs.) *" error={errors.monthly_rent}>
              <input type="number" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} className={inputCls(errors.monthly_rent)} placeholder="8000" min="1" />
            </Field>
            <Field label="Advance Payment (Rs.)">
              <input type="number" value={form.advance_paid} onChange={e => set('advance_paid', e.target.value)} className={inputCls()} placeholder="0" min="0" />
            </Field>
          </div>

          {/* Rent Preview */}
          {rentTotal !== null && (
            <div className={`rounded-lg p-4 text-sm ${balance > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Total Rent</span>
                <span className="font-medium text-gray-900">{formatRupees(rentTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Advance Paid</span>
                <span className="font-medium text-gray-900">{formatRupees(Number(form.advance_paid) || 0)}</span>
              </div>
              <div className={`flex justify-between font-semibold mt-2 pt-2 border-t ${balance > 0 ? 'border-red-200 text-red-700' : 'border-emerald-200 text-emerald-700'}`}>
                <span>Balance Due</span>
                <span>{balance > 0 ? formatRupees(balance) : 'Settled'}</span>
              </div>
            </div>
          )}

          {/* Address */}
          <Field label="Permanent Address">
            <textarea
              value={form.address}
              onChange={e => set('address', e.target.value)}
              className={`${inputCls()} h-20 resize-none py-2`}
              placeholder="Home address (optional)"
            />
          </Field>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 h-10 text-sm font-medium text-white bg-[#065F46] hover:bg-[#047857] rounded transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : editGuest ? 'Save Changes' : 'Check In Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function inputCls(error) {
  return `w-full h-10 px-3 border ${error ? 'border-red-400' : 'border-gray-300'} rounded text-sm text-gray-900 focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-emerald-500/20 bg-white`
}
