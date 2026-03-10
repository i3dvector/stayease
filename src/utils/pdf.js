import { jsPDF } from 'jspdf'
import { balanceDue, formatDate, formatRupees, stayDuration, totalRent } from './business'

export function generateSlip(guest) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210
  const margin = 20

  // Header bar
  doc.setFillColor(6, 95, 70) // #065F46
  doc.rect(0, 0, pageW, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('StayEase Guesthouse', margin, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Check-In Receipt', margin, 21)

  // Receipt meta (right side of header)
  const receiptNo = `SE-${guest.id.slice(0, 8).toUpperCase()}`
  const issueDate = formatDate(new Date().toISOString())
  doc.setFontSize(9)
  doc.text(`Receipt: ${receiptNo}`, pageW - margin, 13, { align: 'right' })
  doc.text(`Issued: ${issueDate}`, pageW - margin, 21, { align: 'right' })

  // Guest name + room banner
  doc.setTextColor(17, 24, 39)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(guest.name, margin, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(107, 114, 128)
  doc.text(`${guest.room}  ·  ${guest.purpose ?? 'N/A'}`, margin, 50)

  // Divider
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, 55, pageW - margin, 55)

  // Two-column details grid
  const col1x = margin
  const col2x = pageW / 2 + 5
  let y = 65
  const rowH = 12

  const fields = [
    ['Phone', guest.phone],
    ['ID Type', guest.id_type],
    ['ID Number', guest.id_number ?? '—'],
    ['Check-In', formatDate(guest.check_in)],
    ['Check-Out', formatDate(guest.check_out)],
    ['Duration', stayDuration(guest)],
    ['Address', guest.address ?? '—'],
    ['Purpose', guest.purpose ?? '—'],
  ]

  fields.forEach(([label, value], i) => {
    const x = i % 2 === 0 ? col1x : col2x
    if (i % 2 === 0 && i > 0) y += rowH

    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    doc.text(label.toUpperCase(), x, y)
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    // Wrap long values
    const maxW = pageW / 2 - margin - 5
    const lines = doc.splitTextToSize(value, maxW)
    doc.text(lines, x, y + 5)
  })

  y += rowH + 8

  // Payment status box
  const balance = balanceDue(guest)
  const settled = balance <= 0
  const boxColor = settled ? [209, 250, 229] : [254, 226, 226]
  const textColor = settled ? [6, 95, 70] : [153, 27, 27]

  doc.setFillColor(...boxColor)
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...textColor)
  const statusText = settled ? 'PAYMENT SETTLED' : `BALANCE DUE: ${formatRupees(balance)}`
  doc.text(statusText, pageW / 2, y + 9, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const rentLine = `Monthly Rent: ${formatRupees(guest.monthly_rent)}  ·  Total: ${formatRupees(totalRent(guest))}  ·  Advance Paid: ${formatRupees(guest.advance_paid)}`
  doc.text(rentLine, pageW / 2, y + 17, { align: 'center' })

  // Footer
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, 270, pageW - margin, 270)
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('StayEase Guesthouse, Chennai, Tamil Nadu', pageW / 2, 277, { align: 'center' })
  doc.text('This is a computer-generated receipt.', pageW / 2, 283, { align: 'center' })

  doc.save(`StayEase-${guest.name.replace(/\s+/g, '-')}-${receiptNo}.pdf`)
}
