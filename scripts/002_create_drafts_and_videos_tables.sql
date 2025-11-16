-- Create drafts table for pending video submissions
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table for approved content
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  duration TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  instructor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on drafts table
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert drafts (no auth required for now)
CREATE POLICY "Anyone can create drafts"
  ON drafts
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all drafts
CREATE POLICY "Admins can view all drafts"
  ON drafts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete drafts
CREATE POLICY "Admins can delete drafts"
  ON drafts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Enable RLS on videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view videos
CREATE POLICY "Anyone can view videos"
  ON videos
  FOR SELECT
  USING (true);

-- Policy: Admins can insert videos
CREATE POLICY "Admins can insert videos"
  ON videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update videos
CREATE POLICY "Admins can update videos"
  ON videos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete videos
CREATE POLICY "Admins can delete videos"
  ON videos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON drafts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
