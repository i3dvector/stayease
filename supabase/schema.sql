-- StayEase Database Schema
-- Run this in your Supabase project → SQL Editor

-- =====================
-- 1. GUESTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  id_type text NOT NULL,
  id_number text,
  room text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  monthly_rent integer NOT NULL,
  advance_paid integer DEFAULT 0,
  status text DEFAULT 'checked-in' CHECK (status IN ('checked-in', 'checked-out')),
  address text,
  purpose text,
  created_at timestamptz DEFAULT now()
);

-- =====================
-- 2. USER ROLES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff'))
);

-- =====================
-- 3. ROW LEVEL SECURITY
-- =====================
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Authenticated users (both admin + staff) can read, insert, and update guests
CREATE POLICY "Authenticated users can manage guests"
  ON guests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Users can read their own role
CREATE POLICY "Users read own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Only admins can insert/update/delete user_roles
CREATE POLICY "Admins manage user_roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.id = auth.uid() AND ur.role = 'admin'
    )
  );

-- =====================
-- 4. SEED: Create admin user_roles entry
-- =====================
-- After creating your Supabase Auth account, find your user UUID in:
-- Authentication → Users → copy UUID
-- Then run:
--
-- INSERT INTO user_roles (id, email, role)
-- VALUES ('YOUR-UUID-HERE', 'harish@email.com', 'admin');
