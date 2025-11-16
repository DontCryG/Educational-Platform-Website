-- Fix infinite recursion in profiles RLS policy
-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role = 'admin';
END;
$$;

-- Recreate admin policy using the function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Update courses policies to use the same function to avoid recursion
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Admins can update any course" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;

CREATE POLICY "Admins can view all courses" ON courses
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any course" ON courses
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete courses" ON courses
  FOR DELETE USING (public.is_admin(auth.uid()));
