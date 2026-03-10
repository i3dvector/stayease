# StayEase — UI/UX Design Specification
**Version 1.0 | For Harish Kumar's Guesthouse**

---

## 1. Design Philosophy

The core philosophy of the StayEase CRM is **Speed, Clarity, and Zero Clutter**. Harish and his staff operate in a fast-paced environment where they need to perform specific actions (check-ins, verifying payments, sending reminders) in seconds.

- **Utilitarian Elegance:** Function over form, but utilizing modern design patterns (subtle shadows, clean typography, whitespace) so the tool feels premium and trustworthy.
- **Glanceability:** The most critical information (Overdue payments, upcoming checkouts) must be immediately visible without scrolling or clicking.
- **High Contrast & Accessible:** Colors are used strictly semantically. Red means action required (unpaid/overdue), Green means safe (paid/settled).

---

## 2. Color Palette

The color system is minimal. We avoid loud colors except for semantic alerts.

### Primary Brand
- **Brand Green (Primary Action):** `#065F46` (Deep Emerald/Teal) - Represents financial stability, "Ease", and successful actions.
- **Brand Green Light (Hover/Active):** `#047857`
- **Brand Accent:** `#10B981` (Bright Emerald) - Used for successful badges and positive state highlights.

### Semantic & Status Colors
- **Success (Settled / Available):** 
  - Background: `#D1FAE5` (Faint Green)
  - Text/Icon: `#065F46` (Dark Green)
- **Warning (Leaving Soon / Partial Pay):**
  - Background: `#FEF3C7` (Faint Amber)
  - Text/Icon: `#92400E` (Dark Amber)
- **Danger/Urgent (Overdue / Unpaid):**
  - Background: `#FEE2E2` (Faint Red)
  - Text/Icon: `#991B1B` (Dark Red)

### Neutral Scale (Backgrounds & Text)
- **App Background:** `#F9FAFB` (Very light gray, almost white)
- **Card Background:** `#FFFFFF` (Pure white, ensuring high contrast with text)
- **Primary Text:** `#111827` (Near black for maximum readability)
- **Secondary Text:** `#6B7280` (Muted gray for labels and helper text)
- **Borders/Dividers:** `#E5E7EB` (Subtle light gray)

---

## 3. Typography

**Font Family:** `Inter`, sans-serif (Available free via Google Fonts)
Clean, professional, and highly readable on both desktop monitors and mobile screens.

**Type Scale:**
- **H1 (Page Titles):** 24px, Font Weight: 700 (Bold), Letter Spacing: -0.025em
- **H2 (Card Headers, Section Titles):** 18px, Font Weight: 600 (Semi-bold)
- **H3 (Table Headers, Labels):** 14px, Font Weight: 500 (Medium), Text Transform: Uppercase, Letter Spacing: 0.05em
- **Body Text (Primary Data):** 14px, Font Weight: 400 (Regular)
- **Small Detail Text:** 12px, Font Weight: 400 (Regular)

---

## 4. UI Components

### 4.1 Buttons
Buttons are pill-shaped or slightly rounded (`border-radius: 6px`) to feel friendly.

- **Primary Button (Check In, Settle Balance):** Solid Background (`Brand Green`), White Text. No outline.
- **Secondary Button (Edit, Download PDF):** Transparent Background, Gray Border (`#D1D5DB`), Gray Text. Hover state slightly darkens the background.
- **Action Icon Buttons (WhatsApp Reminder):** Used inside tables to save space. A simple "Speech Bubble" or "WhatsApp" icon, using the `Brand Accent` color.

### 4.2 Data Cards (Dashboard Summary & Room Status)
- **Styling:** White background (`#FFFFFF`), subtle border (`1px solid #E5E7EB`), soft drop shadow (`box-shadow: 0 1px 3px rgba(0,0,0,0.1)`).
- **Border Radius:** `8px`
- **Padding:** `20px` internally to let the data breathe.

### 4.3 Data Tables
Used for the Guest Registry and Pending Payments.

- **Layout:** Full width of its container. Left-aligned columns, except for numerical amounts (Rent, Balance Due) which should be Right-aligned for easy scanning.
- **Row Styling:** Alternate row coloring is NOT used. Instead, a clean `1px solid #E5E7EB` bottom border separates rows. Hovering over a row adds a faint gray background (`#F3F4F6`).
- **Badges within Tables:** 
  - Statuses like "Checked In" or "Checked Out" are displayed as rounded pills (e.g., `border-radius: 9999px`) using the semantic color backgrounds mentioned above.

### 4.4 Forms & Inputs
- **Inputs:** `40px` height. `1px solid #D1D5DB` border. `4px` border-radius. Padding left/right: `12px`.
- **Focus State:** When an input is actively typed in, the border changes to `Brand Green` (`#065F46`) and gains a subtle green focus ring (`box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2)`).
- **Labels:** Always placed *above* the input field (not inside as placeholders) for maximum accessibility, colored `Secondary Text`.

---

## 5. Layout System

### Global Structure
The app uses a **Sidebar Layout** which is standard for CRM dashboards.

- **Left Sidebar (Navigation):** Fixed width (e.g., `240px`). Dark or purely white. Contains logo at the top, and navigation links (Dashboard, Guest Registry, Room Status, Settings) stacked vertically.
- **Top Header (Context Area):** Displays the current page title on the left. On the right, it shows the logged-in User's name/Role and a "Log Out" button.
- **Main Content Area:** Takes up the remaining spatial width. Uses a maximum width (e.g., `1200px`) and is centered so it doesn't stretch awkwardly on ultrawide monitors.

### Responsive Strategy (Mobile Support)
Harish and staff may often check the CRM on their smartphones while walking the property.

- **Mobile View (< 768px):** 
  - The Left Sidebar collapses into a hamburger menu (top left).
  - Data Tables (which are notoriously bad on mobile) transform into a "Card List" view. Instead of reading left-to-right, each guest row becomes its own stacked card showing Name, Room, Balance, and Actions.
  - Summary Cards on the dashboard stack vertically instead of side-by-side.

---

## 6. Iconography

We will use a clean, outline-based icon set (e.g., **Lucide Icons** or **Heroicons**) to keep the app lightweight.

**Essential Icons Required:**
- `LayoutDashboard` (Dashboard nav)
- `Users` (Guest Registry nav)
- `DoorOpen` (Room Status nav)
- `Settings` (Settings nav)
- `MessageCircle` / `Send` (WhatsApp action)
- `FileText` / `Download` (PDF Slip action)
- `CheckCircle` (Mark Paid / Settle action)
- `LogOut` (Authentication)
- `AlertCircle` / `Bell` (Pending Payment/Urgent indicator)

---

## 7. Interaction Details

- **Loading States:** Because we are using Supabase directly from the frontend, data fetches will happen on component mount. We will use simple "Skeleton" loaders (shimmering gray rectangles) representing the data cards and table rows while data fetches, rather than a full-page spinning wheel.
- **Destructive Actions:** Actions like "Check Out" or revoking a staff member's access will instantly pop up a standard browser confirmation dialog to prevent accidental clicks. 
- **Success Feedback:** Clicking "Settle Balance" or "Send WA" will trigger a temporary toast notification (bottom right) saying "Balance Settled" or "Message Dispatched".

---
*Created per Harish Kumar's CRM Requirements (v1.0)*
