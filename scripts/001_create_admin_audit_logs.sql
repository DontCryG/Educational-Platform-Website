-- Create admin audit logs table for tracking all admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'approve', 'delete', 'reject', etc.
  resource_type TEXT NOT NULL, -- 'video', 'user', etc.
  resource_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB, -- Additional context: reason, previous_status, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON admin_audit_logs(timestamp DESC);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs"
  ON admin_audit_logs
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE admin_audit_logs IS 'Tracks all administrative actions for security and compliance';
COMMENT ON COLUMN admin_audit_logs.action IS 'Type of action performed (approve, delete, reject, etc.)';
COMMENT ON COLUMN admin_audit_logs.metadata IS 'JSON object containing additional context about the action';
