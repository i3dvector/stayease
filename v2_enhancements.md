# StayEase CRM — V2 Enhancements (PMS Inspired)
**Architecture & Implementation Details**

This document outlines four high-impact UI/UX features inspired by enterprise Property Management Systems (PMS) like Mews and Cloudbeds. These features should be added to the StayEase React app to elevate it from a basic register to a professional guesthouse management tool.

---

## 1. The "Tape Chart" (Visual Room Timeline)

**The Concept:**
A visual Gantt-chart timeline. Instead of just seeing who is in a room *today*, the Tape Chart plots room reservations across time (X-axis = Dates, Y-axis = Rooms). This makes it easy to spot gaps where a room is empty and available for booking next week.

**Implementation Details:**
- **UI Component:** We need a scrolling grid. 
  - Left column: Fixed column listing `Room 1` to `Room 6`.
  - Top row: A calendar strip scrolling horizontally, showing the next 14 or 30 days.
  - Grid area: Blocks representing stays spanning across the dates.
- **Dependencies:** Avoid heavy charting libraries if possible; use CSS Grid (`display: grid`) or a lightweight timeline component (e.g., `react-calendar-timeline`).
- **Interactions:**
  - Clicking an empty grid block automatically initiates a "Quick Check-in" pre-filling that Room and Date.
  - Clicking an existing block opens a modal with the Guest Details.

---

## 2. Housekeeping Statuses 🧹

**The Concept:**
A room is rarely "Available" the exact second a guest checks out. It must be cleaned first. The system needs to track the physical state of the room independently from the reservation state.

**Database Changes:**
We need to update the `rooms` table (or add a separate tracking logic) to include a `housekeeping_status`.
- Enum states: `Clean`, `Dirty`, `Inspecting`, `Out of Order`.

**UI Implementation:**
- On the **Room Status Board**, instead of just "Occupied/Available", each room block displays a colored dot or badge indicating cleanliness.
  - 🔴 Dirty (Needs Cleaning)
  - 🟡 Inspecting (Cleaned, waiting for manager check)
  - 🟢 Clean (Ready to sell)
- Add a quick-toggle menu on the Room Card to let staff flip the status in one click without navigating to an edit form.

---

## 3. Global "Quick Check-In" ⚡

**The Concept:**
Speed is crucial at the front desk. Staff shouldn't have to navigate to a specific "Registry" page to check someone in. There should be a highly visible, persistent "New Arrival" action accessible from anywhere.

**UI Implementation:**
- Add a persistent "+" button or a "Quick Check-In" action in the **Top Navigation Bar** or fixed to the bottom-right corner as a Floating Action Button (FAB) on mobile screens.
- When clicked, it opens a modal overlay instantly from whatever page the user is currently on.
- Include a "Smart Default": The Check-In date defaults to *Today*, and the Checkout date defaults to *1 Month from Today* (standard PG terms).

---

## 4. Rich Guest Profiles (CRM Aspect) 📖

**The Concept:**
Currently, StayEase treats every stay as a separate entity. The business needs a way to track returning guests, view lifetime revenue, and store ID documents securely so recurring guests don't have to provide paperwork twice.

**Database Changes:**
We must decouple the `guests` table into two relational tables:
1. `profiles`: `id`, `name`, `phone`, `id_type`, `id_number`, `created_at`.
2. `stays` (formerly `guests`): `id`, `profile_id` (foreign key), `room`, `check_in`, `check_out`, `daily_rent`, `advance_paid`, `status`.

**UI Implementation:**
- **Guest Profile Page:** Clicking a guest's name anywhere in the app should open their detailed profile.
- **Lifetime Stats:** Show "Total Days Stayed", "Total Revenue Generated", and a list of "Past Stays".
- **ID Upload:** Implement a file upload component using Supabase Storage. Allow Harish to snap a photo of the guest's Aadhar card via a mobile browser and attach it securely to the `profile`.

---
*Ready to be integrated into the StayEase codebase.*
