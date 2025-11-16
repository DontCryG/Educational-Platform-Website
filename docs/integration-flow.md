# Integration Flow Diagram

## Admin Video Moderation System - Complete Flow

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS VIDEO                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  courses table │
                    │ status='pending'│
                    └────────┬───────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD LOADS                          │
│  GET /api/admin/videos → Fetches all videos (pending/approved)     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
     ┌──────────────────┐      ┌──────────────────┐
     │  APPROVE VIDEO   │      │   DELETE VIDEO   │
     └────────┬─────────┘      └────────┬─────────┘
              │                         │
              │                         ▼
              │              ┌───────────────────────┐
              │              │ Confirmation Modal    │
              │              │ "Are you sure?"       │
              │              └──────────┬────────────┘
              │                         │
              │                         ▼
              │              ┌───────────────────────┐
              │              │ User Confirms Delete  │
              │              └──────────┬────────────┘
              │                         │
              ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                  │
│  - POST /api/admin/videos/{id}/approve                             │
│  - DELETE /api/admin/videos/{id}                                   │
│                                                                     │
│  Authentication Flow:                                               │
│  1. Extract JWT from request headers/cookies                       │
│  2. Verify user is authenticated (supabase.auth.getUser())         │
│  3. Check user role in profiles table                              │
│  4. If role !== 'admin' → 403 Forbidden                           │
│  5. If role === 'admin' → Proceed                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
     ┌──────────────────┐      ┌──────────────────┐
     │  UPDATE STATUS   │      │  DELETE RECORD   │
     │                  │      │                  │
     │ UPDATE courses   │      │ 1. Fetch video   │
     │ SET status =     │      │    details       │
     │   'approved'     │      │ 2. DELETE from   │
     │ WHERE id = X     │      │    courses       │
     │                  │      │ 3. Delete media  │
     │                  │      │    from storage  │
     └────────┬─────────┘      └────────┬─────────┘
              │                         │
              ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       AUDIT LOGGING                                 │
│                                                                     │
│  INSERT INTO admin_audit_logs (                                     │
│    admin_id: current_user_id,                                      │
│    action: 'approve' | 'delete',                                   │
│    resource_type: 'video',                                         │
│    resource_id: video_id,                                          │
│    timestamp: NOW(),                                               │
│    metadata: {                                                     │
│      video_title: "...",                                           │
│      previous_status: "pending",                                   │
│      new_status: "approved",                                       │
│      deletion_reason: "..."                                        │
│    }                                                               │
│  )                                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RESPONSE TO CLIENT                             │
│  { success: true, message: "...", video: {...} }                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND UPDATE                                │
│  - Update local state (remove/update video in list)                │
│  - Show toast notification                                          │
│  - Refresh UI (optional revalidation)                              │
└─────────────────────────────────────────────────────────────────────┘
\`\`\`

## Error Handling Flow

\`\`\`
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Authentication? │───No──> 401 Unauthorized
└──────┬──────────┘
       │ Yes
       ▼
┌─────────────────┐
│  Admin Role?    │───No──> 403 Forbidden
└──────┬──────────┘
       │ Yes
       ▼
┌─────────────────┐
│ Resource Exists?│───No──> 404 Not Found
└──────┬──────────┘
       │ Yes
       ▼
┌─────────────────┐
│ Database Error? │───Yes──> 500 Internal Server Error
└──────┬──────────┘
       │ No
       ▼
┌─────────────────┐
│  200 Success    │
└─────────────────┘
\`\`\`

## Security Checkpoints

1. **JWT Validation**: Every API request verifies the JWT token
2. **Role Verification**: Profiles table checked for admin role
3. **RLS Policies**: Database-level security ensures data isolation
4. **Audit Logging**: All actions tracked for compliance
5. **CSRF Protection**: Next.js built-in CSRF protection for API routes
6. **Rate Limiting**: (Recommended) Add rate limiting for admin endpoints

## Frontend State Management

\`\`\`
┌──────────────────┐
│  Initial State   │
│  isLoading: true │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Fetch Videos    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update courses[] │
│ isLoading: false │
└────────┬─────────┘
         │
    ┌────┴────┐
    │  User   │
    │ Action  │
    └────┬────┘
         │
         ▼
┌──────────────────┐
│ Optimistic Update│ (optional)
│ Show loading     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  API Call        │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Success │ │ Error  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│Update  │ │Revert  │
│State   │ │Changes │
│Show    │ │Show    │
│Toast   │ │Error   │
└────────┘ └────────┘
