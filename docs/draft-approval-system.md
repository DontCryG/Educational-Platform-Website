# Draft Approval System Documentation

## Overview

This system implements a secure video approval workflow where content creators submit videos as drafts, and admins review and approve them before publication.

## Database Schema

### Using Existing `courses` Table

The system uses the existing `courses` table with the `status` field to manage the draft approval workflow.

**Status Values:**
- `pending` - Course submitted by user, waiting for admin review
- `approved` - Course approved by admin, visible to public
- Rejected courses are deleted from the table

### Courses Table Structure

\`\`\`sql
Table: courses
Columns:
  - id: uuid (Primary Key)
  - title: text
  - description: text
  - video_url: text
  - thumbnail_url: text
  - category: text
  - duration: text
  - instructor_id: uuid
  - status: text (default: 'pending')
  - views: integer (default: 0)
  - created_at: timestamp with time zone
  - updated_at: timestamp with time zone
\`\`\`

## Workflow

### 1. Content Submission
- User fills out the course creation form
- Clicks "Publish Course" button
- Data is saved to `courses` table with `status="pending"` (NOT published)
- User redirected to homepage with success message

### 2. Admin Review
- Admin accesses `/admin` route with access key
- Views all pending courses from database (where `status="pending"`)
- Each draft displays:
  - Thumbnail
  - Title & description
  - Category & duration
  - Submission date

### 3. Admin Actions

#### Approve
1. Admin clicks "Approve" button
2. Server action `approveDraft()`:
   - Updates course `status` from "pending" to "approved"
3. Course is now publicly visible

#### Reject
1. Admin clicks "Reject" button
2. Server action `rejectDraft()`:
   - Deletes course from `courses` table
3. Draft is permanently removed

## Server Actions

All database operations are server-side only:

- `saveDraft()` - Save submission to courses table with status="pending"
- `getDrafts()` - Fetch all courses where status="pending"
- `approveDraft(id)` - Update course status to "approved"
- `rejectDraft(id)` - Delete course from table
- `getApprovedCourses()` - Fetch courses where status="approved" for public display

## Security

- All database queries use server actions
- No environment variables exposed to client
- Row Level Security (RLS) policies:
  - Authenticated users can insert courses
  - Only admins can update any course
  - Only admins can delete courses
  - Anyone can view approved courses
  - Instructors can view their own courses
- Admin access protected by key authentication with HTTP-only cookies

## File Structure

\`\`\`
lib/actions/
  └── drafts.ts          # Server actions for draft management

app/
  ├── create-course/
  │   └── page.tsx       # Form that saves to courses with status="pending"
  └── admin/
      └── page.tsx       # Admin review interface

lib/actions/
  └── admin-auth.ts      # Secure admin authentication
\`\`\`

## Usage

1. The `courses` table already exists with RLS policies
2. Set the admin access key (`ADMIN_KEY`) in environment variables
3. Users submit courses via `/create-course` (saved as pending)
4. Admins review at `/admin` and approve/reject
5. Approved courses (status="approved") appear in public video listings
