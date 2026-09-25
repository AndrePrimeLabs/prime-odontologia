-- Row Level Security for the users table.
-- NOTE: the admin check uses a SECURITY DEFINER helper to avoid the classic
-- "infinite recursion detected in policy for relation users" error that occurs
-- when a policy on `users` queries `users` directly.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Bypasses RLS (SECURITY DEFINER) so it can be safely called from a users policy.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- Users can read their own profile; admins can read all.
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING ((SELECT auth.uid()) = id OR public.is_admin());

-- Users can update their own profile.
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
