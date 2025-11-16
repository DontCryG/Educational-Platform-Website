-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'instructor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Anyone can create courses" ON courses;
DROP POLICY IF EXISTS "Anyone can update courses" ON courses;

-- New RLS policies for courses
-- Anyone can view approved courses
CREATE POLICY "Anyone can view approved courses" ON courses
  FOR SELECT USING (status = 'approved');

-- Instructors can view their own courses (any status)
CREATE POLICY "Instructors can view their own courses" ON courses
  FOR SELECT USING (auth.uid() = instructor_id);

-- Admins can view all courses
CREATE POLICY "Admins can view all courses" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can create courses (will be pending)
CREATE POLICY "Authenticated users can create courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);

-- Instructors can update their own pending courses
CREATE POLICY "Instructors can update their own pending courses" ON courses
  FOR UPDATE USING (
    auth.uid() = instructor_id AND status = 'pending'
  );

-- Admins can update any course (for approval/rejection)
CREATE POLICY "Admins can update any course" ON courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any course
CREATE POLICY "Admins can delete courses" ON courses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
