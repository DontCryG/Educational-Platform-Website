-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'web development',
  duration TEXT DEFAULT '45 min',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read courses
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert courses
CREATE POLICY "Anyone can create courses" ON courses
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to update courses
CREATE POLICY "Anyone can update courses" ON courses
  FOR UPDATE USING (true);
