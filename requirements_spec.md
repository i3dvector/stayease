# StayEase — Guesthouse CRM
## Full Product Specification
**Version 1.0 | Chennai, Tamil Nadu, India**
**Last Updated: March 2026**
**Owner: Harish Kumar**

---

## 1. Overview

StayEase is a lightweight, browser-based CRM built specifically for small guesthouse and paying-guest (PG) accommodation operators in India. It is designed for Harish Kumar's guesthouse in Chennai, Tamil Nadu, where the primary need is to replace manual paper-based check-in registers, handwritten rent receipts, and informal WhatsApp reminders with a single organised digital system — at zero recurring cost.

The app is a single-page React application hosted on Vercel (free tier). Guest data is stored in a Supabase PostgreSQL database hosted on AWS Singapore — the closest AWS region to Chennai, ensuring low latency. There is no custom backend server. The React frontend communicates directly with Supabase via the official `@supabase/supabase-js` SDK.

---

## 2. The Problem It Solves

Guesthouses in Chennai typically operate with a mix of paper registers, WhatsApp reminders, and mental notes. StayEase directly addresses three recurring pain points:

**1. Slow, error-prone check-in paperwork.**
When a new guest arrives, the owner manually fills a register with name, phone number, government ID details, room number, and rent agreement. This is time-consuming, illegible, and unsearchable.

**2. Missed or awkward rent reminders.**
Owners rely on memory or informal WhatsApp messages. This is inconsistent and leads to delayed payments and uncomfortable conversations.

**3. No central searchable guest record.**
If a guest's details need to be retrieved — for police verification, a dispute, or simply finding a phone number — there is no searchable record. Everything lives in a physical register or scattered chat threads.

---

## 3. Target Users

| User | Role | Access |
|---|---|---|
| Harish Kumar (Owner) | Admin | Full access — all features including User Management and Settings |
| Employee / Helper | Staff | Manage guests, check in/out, and click 'Mark Paid'. Cannot delete records, access settings, or manage users. |

Guests do **not** interact with the system. It is an internal management tool only. There is no guest-facing portal or online booking in v1.

---

## 4. Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React (JSX), inline styles | Free |
| Hosting | Vercel | Free |
| Database | Supabase (PostgreSQL) | Free tier |
| DB Region | AWS ap-southeast-1 (Singapore) | Included |
| Auth & RBAC | Supabase Auth (Email/Pass) | Free (50k MAU) |
| PDF Generation | jsPDF (CDN) | Free |
| WhatsApp Reminders | Official WhatsApp Cloud API | Free tier (1000 msgs/mo) |
| Serverless / API | Supabase Edge Functions | Free tier (500k inv/mo) |

**No managing a traditional backend server.** The React frontend handles login via Supabase Auth, requests data via PostgREST with Row Level Security (RLS) automatically applied based on the logged-in user's role, and triggers an Edge Function for WhatsApp.

---

## 5. Database Schema (Supabase / PostgreSQL)

### Table: `guests`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Auto-generated |
| name | text | NOT NULL | Guest's full name |
| phone | text | NOT NULL | 10-digit Indian mobile (Used for WhatsApp) |
| id_type | text | NOT NULL | Aadhar / Passport / Voter ID / Driving Licence / PAN |
| id_number | text | NULLABLE | Document number |
| room | text | NOT NULL | e.g. "Room 1" through "Room 6" |
| check_in | date | NOT NULL | Arrival date |
| check_out | date | NOT NULL | Expected departure date |
| daily_rent | integer | NOT NULL | Daily room rate in Indian Rupees |
| advance_paid | integer | DEFAULT 0 | Amount received upfront |
| status | text | DEFAULT 'checked-in' | 'checked-in' or 'checked-out' |
| address | text | NULLABLE | Permanent home address |
| purpose | text | NULLABLE | Work / Travel / Study / Medical / Family / Other |
| created_at | timestamptz | DEFAULT now() | Auto-generated timestamp |

### Table: `rooms` (optional, recommended for v2)

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | "Room 1" through "Room 6" |
| floor | integer | Optional floor number |
| monthly_rate | integer | Default rent for this room |
| notes | text | e.g. "AC room", "attached bathroom" |

### Table: `user_roles` (For Employees)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PRIMARY KEY, references `auth.users` |
| email | text | Employee's login email |
| role | text | 'admin' or 'staff' |

*Note: Supabase Row Level Security (RLS) policies will use this table to block 'staff' from deleting records or viewing the Settings/Users pages.*

---

## 6. Application Architecture

```
┌─────────────────────────────────┐
│   React Frontend (Vercel)       │
│   stayease.vercel.app           │
│                                 │
│  ┌──────────────────────────┐   │
│  │  @supabase/supabase-js   │   │
│  └────────────┬─────────────┘   │
└───────────────┼─────────────────┘
                │ HTTPS REST API
┌───────────────▼─────────────────┐
│   Supabase (AWS Singapore)      │
│                                 │
│  ┌─────────────────────────┐    │
│  │  PostgREST (Auto API)   │    │
│  ├─────────────────────────┤    │
│  │  PostgreSQL Database    │    │
│  ├─────────────────────────┤    │
│  │  Supabase Auth (Users)  │    │
│  ├─────────────────────────┤    │
│  │  Edge Functions         ├───► Meta WhatsApp API
│  │  (Serverless API calls) │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

## 7. Features & Screens

### 7.1 Dashboard

The landing screen. Gives Harish an at-a-glance view every morning.

**Stats row (4 cards):**
- Occupied Rooms (X / 6)
- Available Rooms
- Pending Payments count
- Total Revenue Collected (Rs.)

**Urgent Alerts panel:**
- Automatically surfaces guests whose payment is overdue OR whose checkout is within 3 days
- One-click actions: Send WhatsApp Reminder, Mark Paid

**Current Guests table:**
- Name, Room, Check-Out date, Daily Rent, Balance Due
- Quick actions: Download PDF Slip, Send WhatsApp Reminder

---

### 7.2 Guest Registry

Full searchable, filterable table of all guests — current and past.

**Search:** by name, room number, or phone number (live search)

**Filter:** All | Active (checked-in) | Checked Out

**Table columns:** Name, Phone, Room, Check-Out, Daily Rent, Balance Due, Status badge, Actions

**Row actions:**
- Edit — opens pre-filled Check-In form
- 📄 PDF — generates and downloads check-in slip
- 💬 Send WA — triggers background official WhatsApp rent reminder
- Settle Balance — one click updates `advance_paid` to match the total calculated rent
- Check Out — changes status to checked-out

---

### 7.3 Room Status Board

Visual grid of all 6 rooms.

**Occupied room card shows:**
- Guest name
- Checkout date
- Balance Due amount
- Buttons: Download Slip, Settle Balance

**Available room card shows:**
- "Available" label
- "+ Check In" button (pre-fills the room in the form)

---

### 7.4 Check-In Form

Structured form for registering a new guest. Also used for editing existing records.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | Text | Yes | |
| Phone Number | Text | Yes | 10-digit mobile (WhatsApp required) |
| Purpose of Stay | Select | No | Work / Travel / Study / Medical / Family / Other |
| ID Type | Select | Yes | Aadhar / Passport / Voter ID / Driving Licence / PAN |
| ID Number | Text | No | Document number |
| Room | Select | Yes | Occupied rooms shown as disabled |
| Daily Rent (Rs.) | Number | Yes | Total automatically calculated in UI |
| Check-In Date | Date | Yes | |
| Check-Out Date | Date | Yes | |
| Permanent Address | Text | No | |
| Advance Payment (Rs.) | Number | No | Enter amount received upfront |

**Validation:**
- Name, Phone, Check-In Date, Check-Out Date are required
- Room selector disables already-occupied rooms to prevent double-booking
- Shows error toast if required fields are missing

---

### 7.5 PDF Check-In Slip Generator

Triggered by the "📄 Slip" button on any guest. Generates and downloads a formatted PDF instantly.

**PDF contents:**
- StayEase Guesthouse header (dark bar)
- Unique Receipt number + issue date
- Guest full name, room, purpose of stay
- All guest details in two-column grid: Phone, ID Type, ID Number, Check-In, Check-Out, Address, Purpose
- Payment status box: "PAYMENT RECEIVED" (green) or "PAYMENT PENDING" (red) with rent amount in Rs.
- Duration of stay in days
- Footer with guesthouse name

**Technical:** Uses jsPDF loaded dynamically from Cloudflare CDN. Works offline after first load. No server required.

---

### 7.6 Automated WhatsApp Rent Reminders

Triggered by the "💬" button on any unpaid active guest or automatically by a daily CRON job.

**Official WhatsApp Cloud API Integration:**
Instead of opening a native browser window, the frontend calls a secure **Supabase Edge Function**. This serverless function securely holds your Meta API credentials and makes a POST request to the official WhatsApp Cloud API to dispatch an approved "Message Template".

**Message Template (Requires Meta Approval):**
`"Hello {{1}}, this is a friendly reminder from StayEase Guesthouse. Your rent of Rs. {{2}} for {{3}} is currently due. Please complete the payment at your earliest convenience."`

**Why this is best for automated scaling:**
- 100% automated background sending.
- Meta provides 1,000 free utility/service conversations per month, which easily covers a 6-room guesthouse's needs.
- Supabase Edge Functions provide a secure backend environment without needing to host a 24/7 Node/Express server.

---

### 7.7 Reminders Panel

Dedicated screen for payment and checkout management.

**Section 1 — Pending Payments:**
- Lists all unpaid active guests
- Shows phone, days until checkout
- Color-coded urgency: red (≤3 days), orange (≤7 days), grey (more time)
- Actions: Send WhatsApp Reminder, Mark Paid

**Section 2 — Upcoming Checkouts (next 7 days):**
- Lists all guests checking out within 7 days
- Shows countdown (Today!, X days)
- Actions: Download Slip, Check Out

---

### 7.8 Settings & Staff Admin Panel (Admin Only)

**Employee Management:**
- Table of all staff users securely managed via Supabase Auth.
- Form to invite new employees (sends a password setup link to their email).
- Ability to quickly revoke access / disable an employee account.

**Supabase Configuration:**
- Project URL input
- Anon Public Key input
- Edge Function URL
- Save button (persists to localStorage)

**Data Management:**
- Total guest records count
- Export Backup (downloads JSON file, date-stamped)
- Reset to defaults button (with confirmation dialog)

---

## 8. Key Business Logic

### Total Rent & Balance Calculation
```javascript
const daysStayed = Math.max(1, Math.ceil((checkOutDate - checkInDate) / 86400000));
const totalRent = daily_rent * daysStayed;
const balanceDue = totalRent - advance_paid;
```

### Overdue Detection
A guest is flagged as urgent if:
- `status === 'checked-in'` AND
- `balanceDue > 0` AND
- `daysUntil(checkOut) <= 3`

### Room Availability
A room is occupied if any guest record has:
- `status === 'checked-in'` AND
- `room === roomName`

### Revenue Calculation
Total revenue = sum of `advance_paid` across all guest records (plus any balances settled later).

### Days Until Checkout
```
daysUntil = ceil((checkOutDate - today) / 86400000)
```
Negative value = overdue.

---

## 9. Supabase vs localStorage (Migration Note)

The original v1 prototype used `localStorage`. The production app uses Supabase.

**What changes:**

| Operation | localStorage (old) | Supabase (new) |
|---|---|---|
| Load all guests | `JSON.parse(localStorage.getItem(...))` | `await supabase.from('guests').select('*')` |
| Add guest | `localStorage.setItem(...)` | `await supabase.from('guests').insert({...})` |
| Update guest | Re-save full array | `await supabase.from('guests').update({...}).eq('id', id)` |
| Delete / checkout | Re-save full array | `await supabase.from('guests').update({status:'checked-out'}).eq('id', id)` |

The UI is **identical**. Only the data layer changes (~15 lines of code).

**Why Supabase over Firebase:**
- Guest data is structured and relational (dates, statuses, filters) — better fit for PostgreSQL than Firestore's NoSQL model
- Supabase generates a REST API automatically from the table schema
- Singapore AWS region = lowest latency from Chennai
- Open source — no vendor lock-in risk

**Why Supabase over Railway + Node:**
- Railway requires writing and maintaining a full Express API server
- Unnecessary complexity for a single-operator tool
- Supabase provides the same result with zero backend code

---

## 10. Free Tier Sustainability

| Service | Free Limit | StayEase Usage | Verdict |
|---|---|---|---|
| Vercel | Unlimited deployments | 1 deployment | ✅ Free forever |
| Supabase | 500MB DB, 50k MAU | <5MB, 1 user | ✅ Free forever |
| Supabase Edge Functions | 500K invocations/mo | <50/mo | ✅ Free forever |
| Official WhatsApp API | 1,000 msgs/mo free tier | ~10–20/mo | ✅ Free forever |
| jsPDF | Open source CDN | On-demand | ✅ Free forever |

**Note:** Supabase free projects pause after 1 week of inactivity. Daily use by Harish prevents this naturally. Meta WhatsApp API requires initial business verification.

---

## 11. Constraints & Assumptions (v1)

- Single operator, single device type not required — works on any browser (laptop, phone, tablet)
- Supports exactly 6 rooms — configurable by editing the `ROOMS` array in code
- All monetary values in Indian Rupees (Rs.)
- Date formatting: DD MMM YYYY (Indian standard, e.g. "09 Mar 2026")
- Government ID collection aligns with standard Indian guesthouse compliance
- No photograph or document upload for guest ID in v1
- Multi-user authentication utilizes Supabase Auth (Email/Password). Row Level Security ensures Staff cannot perform Admin operations via the API.

---

## 12. Planned Future Enhancements (v2+)

| Feature | Priority | Notes |
|---|---|---|
| Audit Logging | High | Track which staff member collected rent or checked in a guest (`created_by`, `updated_by` tracking). |
| Monthly rent cycle tracking | High | Auto-reset `paid` flag on 1st of each month |
| Police verification form (Form C) | Medium | Tamil Nadu legal compliance for guesthouses |
| SMS reminders | Medium | Via Fast2SMS (India-specific, very affordable) |
| Guest ID photograph upload | Medium | Supabase Storage — free 1GB |
| Multi-property support | Low | For scaling to manage multiple guesthouses |
| Utility bill tracking per room | Low | Electricity, water split per guest |
| Google Sheets sync | Low | For Harish's accountant who prefers spreadsheets |
| Android PWA | Low | Installable on Harish's phone as a home screen app |

---

## 13. Deployment Guide (One-Time Setup)

### Supabase Setup (~20 min)
1. Create account at supabase.com
2. New project → name: "StayEase" → region: Singapore
3. Table Editor → create `guests` and `user_roles` tables per schema in Section 5
4. Authentication → Enable Email Auth. Set up Row Level Security (RLS) policies linking `guests` table to `user_roles` to restrict 'admin' and 'staff' capabilities.
5. Edge Functions → Deploy `whatsapp-reminders` function using Supabase CLI
6. Settings → API → copy Project URL, anon key, and Function URL

### Meta WhatsApp Business Setup (~30 min)
1. Register on Meta for Developers
2. Create an App → WhatsApp Business API
3. Add a verified test phone number and create the `rent_reminder` message template
4. Copy access token and phone number ID to Supabase Edge Function environment variables

### Vercel Deployment (~10 min)
1. Push React code to GitHub repository
2. Go to vercel.com → Import repository
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy → get URL like `stayease.vercel.app`

**Total setup time: ~30 minutes. Recurring cost: Rs. 0.**

---

*Document maintained by: Development Team*
*For questions contact: Harish Kumar, Chennai*
*Next review: When v2 features are scoped*
