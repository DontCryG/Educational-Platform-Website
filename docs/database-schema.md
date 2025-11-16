# Database Schema Documentation

## Tables Overview

### 1. courses (Videos/Content Table)

**Purpose**: Stores all video course submissions with moderation status

**Columns**:
- `id` (UUID, PK): Unique identifier
- `title` (TEXT): Video title
- `description` (TEXT): Video description
- `video_url` (TEXT): URL to the video (YouTube, etc.)
- `thumbnail_url` (TEXT, nullable): Custom thumbnail URL
- `category` (TEXT): Course category (e.g., "Web Development", "Design")
- `duration` (TEXT): Video duration (e.g., "45 min")
- `views` (INTEGER): View count
- `status` (TEXT): Moderation status - 'pending', 'approved', 'rejected'
- `instructor_id` (UUID, nullable, FK): References auth.users(id)
- `created_at` (TIMESTAMP): Submission timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**RLS Policies**:
- `Anyone can view approved courses` - Public read access for approved content
- `Authenticated users can create courses` - Logged-in users can submit
- `Instructors can view their own courses` - Users see their submissions
- `Instructors can update their own pending courses` - Edit before approval
- `Admins can view all courses` - Admin dashboard access
- `Admins can update any course` - Change status, edit content
- `Admins can delete courses` - Remove inappropriate content

**Indexes**:
- Primary key on `id`
- Index on `status` for filtering
- Index on `created_at` for sorting
- Index on `instructor_id` for user queries

---

### 2. profiles (User Profiles Table)

**Purpose**: Extended user information and role management

**Columns**:
- `id` (UUID, PK, FK): References auth.users(id) with ON DELETE CASCADE
- `email` (TEXT): User email
- `role` (TEXT): User role - 'user', 'instructor', 'admin'
- `created_at` (TIMESTAMP): Account creation timestamp

**RLS Policies**:
- `Users can view their own profile` - Self-read access
- `Users can update their own profile` - Self-update access
- `Admins can view all profiles` - Admin management access

**Indexes**:
- Primary key on `id`
- Index on `role` for admin queries

---

### 3. admin_audit_logs (Audit Trail Table)

**Purpose**: Comprehensive logging of all administrative actions for security and compliance

**Columns**:
- `id` (UUID, PK): Unique log entry identifier
- `admin_id` (UUID, FK): References auth.users(id) - who performed the action
- `action` (TEXT): Action type - 'approve', 'delete', 'reject', 'update'
- `resource_type` (TEXT): Type of resource - 'video', 'user', 'course'
- `resource_id` (UUID): ID of the affected resource
- `timestamp` (TIMESTAMP): When the action occurred
- `metadata` (JSONB): Additional context:
  - `video_title`: Name of affected video
  - `previous_status`: Status before change
  - `new_status`: Status after change
  - `deletion_reason`: Why content was deleted
  - `ip_address`: Admin's IP (optional)
  - Custom fields as needed

**RLS Policies**:
- `Admins can view all audit logs` - Read access for compliance review
- `System can insert audit logs` - Automated logging via service role

**Indexes**:
- Primary key on `id`
- Index on `admin_id` for per-admin activity
- Index on `(resource_type, resource_id)` for resource history
- Index on `timestamp DESC` for recent activity queries

**Usage Examples**:
\`\`\`sql
-- Find all actions by a specific admin
SELECT * FROM admin_audit_logs 
WHERE admin_id = 'uuid-here' 
ORDER BY timestamp DESC;

-- Get history for a specific video
SELECT * FROM admin_audit_logs 
WHERE resource_type = 'video' 
  AND resource_id = 'video-uuid'
ORDER BY timestamp DESC;

-- Recent deletions in the last 30 days
SELECT * FROM admin_audit_logs 
WHERE action = 'delete' 
  AND timestamp > NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;
\`\`\`

---

## MongoDB Alternative Schema

For projects using MongoDB instead of PostgreSQL:

\`\`\`javascript
// videos collection
{
  _id: ObjectId,
  title: String,
  description: String,
  videoUrl: String,
  thumbnailUrl: String,
  category: String,
  duration: String,
  views: Number,
  status: String, // 'pending', 'approved', 'rejected'
  uploaderId: ObjectId, // ref: 'users'
  uploaderName: String,
  submittedAt: Date,
  updatedAt: Date,
  reportedReason: String, // optional
  metadata: {
    fileSize: Number,
    format: String,
    resolution: String
  }
}

// adminAuditLogs collection
{
  _id: ObjectId,
  adminId: ObjectId, // ref: 'users'
  adminEmail: String,
  action: String, // 'approve', 'delete', 'reject'
  resourceType: String, // 'video', 'user'
  resourceId: ObjectId,
  timestamp: Date,
  metadata: {
    videoTitle: String,
    previousStatus: String,
    newStatus: String,
    deletionReason: String,
    ipAddress: String
  }
}

// Indexes for MongoDB
db.videos.createIndex({ status: 1, submittedAt: -1 })
db.videos.createIndex({ uploaderId: 1 })
db.adminAuditLogs.createIndex({ adminId: 1, timestamp: -1 })
db.adminAuditLogs.createIndex({ resourceType: 1, resourceId: 1 })
\`\`\`

---

## Security Considerations

1. **Row Level Security (RLS)**: All tables use RLS to enforce access control at the database level
2. **Audit Logging**: All admin actions are automatically logged with full context
3. **Cascade Deletes**: User deletion removes all related records (profiles, courses)
4. **Role-Based Access**: Profiles table maintains user roles for authorization
5. **Immutable Logs**: Audit logs should never be updated or deleted (compliance requirement)

---

## Integration Flow

### Video Approval Flow:
1. User submits video → `courses.status = 'pending'`
2. Admin views in moderation queue
3. Admin clicks Approve → API checks admin role
4. Database updates `courses.status = 'approved'`
5. Audit log entry created in `admin_audit_logs`
6. Frontend updates UI, shows success toast

### Video Deletion Flow:
1. Admin clicks Delete → Confirmation modal appears
2. Admin confirms deletion → API checks admin role
3. API fetches video details for audit log
4. Database deletes record from `courses`
5. Storage service deletes media files (if applicable)
6. Audit log entry created with deletion context
7. Frontend removes video from list, shows success toast

---

## Migration Best Practices

1. **Always use transactions** for multi-step operations
2. **Test RLS policies** with different user roles
3. **Backup database** before running migrations
4. **Version control** all schema changes
5. **Document breaking changes** in migration comments
