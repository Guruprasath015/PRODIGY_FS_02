/*
  # Employee Management System Schema

  ## Overview
  Creates the full schema for the Employee Management System.

  ## New Tables

  ### profiles
  - Stores admin/user profiles linked to Supabase auth users
  - `id` (uuid, FK to auth.users)
  - `username` (text, unique)
  - `email` (text)
  - `role` (text, default 'admin')
  - `created_at` (timestamptz)

  ### employees
  - Stores all employee records
  - `id` (uuid, PK)
  - `employee_id` (text, unique auto-generated like EMP-0001)
  - `full_name` (text)
  - `email` (text, unique)
  - `phone` (text)
  - `department` (text)
  - `designation` (text)
  - `salary` (numeric)
  - `joining_date` (date)
  - `address` (text)
  - `profile_image` (text, URL)
  - `status` (text, 'active' or 'inactive')
  - `created_by` (uuid, FK to auth.users)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Only authenticated users can access data
  - Profiles: users can read/update their own profile
  - Employees: authenticated users (admins) can fully manage employees

  ## Notes
  - A trigger auto-updates `updated_at` on employee record changes
  - Employee IDs are auto-generated as EMP-XXXX using a sequence
*/

-- Create sequence for employee ID generation
CREATE SEQUENCE IF NOT EXISTS employee_id_seq START 1;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL DEFAULT 'EMP-' || LPAD(nextval('employee_id_seq')::text, 4, '0'),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  department text NOT NULL,
  designation text NOT NULL,
  salary numeric NOT NULL CHECK (salary > 0),
  joining_date date NOT NULL,
  address text DEFAULT '',
  profile_image text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS employees_updated_at ON employees;
CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
