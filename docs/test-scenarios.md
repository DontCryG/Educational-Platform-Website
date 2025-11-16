# Test Scenarios & Acceptance Criteria

## Test Scenarios

### Scenario 1: Successful Video Approval

**Given**: Admin is logged in and viewing pending videos  
**When**: Admin clicks "Approve" on a pending video  
**Then**:
- Loading state shows on the approve button
- API request sent to `/api/admin/videos/{id}/approve`
- Database updates `status` to 'approved'
- Audit log entry created
- Video moves from "Pending" tab to "Approved" tab
- Success toast displayed: "Video Approved"
- Button returns to normal state

**Expected Payload**:
\`\`\`json
{
  "success": true,
  "message": "Video approved successfully",
  "video": {
    "id": "uuid-123",
    "title": "Introduction to React",
    "status": "approved",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

---

### Scenario 2: Successful Video Deletion

**Given**: Admin is viewing approved or rejected videos  
**When**: Admin clicks "Delete" button  
**Then**:
- Confirmation modal appears with video title
- Modal shows warning: "This action cannot be undone"

**When**: Admin clicks "Delete Permanently"  
**Then**:
- Loading state shows
- API request sent to `DELETE /api/admin/videos/{id}`
- Video record deleted from database
- Media files deleted from storage (if applicable)
- Audit log entry created
- Video removed from UI
- Success toast displayed: "Video Deleted"
- Modal closes

**Expected Payload**:
\`\`\`json
{
  "success": true,
  "message": "Video deleted successfully"
}
\`\`\`

---

### Scenario 3: Unauthorized Access Attempt

**Given**: User without admin role tries to access admin API  
**When**: Request sent to `/api/admin/videos`  
**Then**:
- API returns 403 Forbidden
- Error message: "Forbidden: Admin access required"
- User redirected to home page or access denied page

**Expected Payload**:
\`\`\`json
{
  "error": "Forbidden: Admin access required"
}
\`\`\`

---

### Scenario 4: Unauthenticated Access Attempt

**Given**: No valid JWT token in request  
**When**: Request sent to admin endpoints  
**Then**:
- API returns 401 Unauthorized
- Error message: "Unauthorized"
- User redirected to login page

**Expected Payload**:
\`\`\`json
{
  "error": "Unauthorized"
}
\`\`\`

---

### Scenario 5: Network Error During Approval

**Given**: Admin clicks "Approve" but network fails  
**When**: API request fails  
**Then**:
- Loading state shows during attempt
- After timeout, error toast displayed
- Button returns to normal state
- Video remains in original state (pending)
- User can retry the action

**Expected Behavior**:
- Toast message: "Failed to approve video. Please try again."
- No state change in UI
- No database update
- No audit log entry

---

### Scenario 6: Concurrent Admin Actions

**Given**: Two admins view the same pending video  
**When**: Admin A approves while Admin B deletes  
**Then**:
- First action to complete succeeds
- Second action may fail (404 Not Found if deleted first)
- Both actions logged in audit trail
- UI reflects final state after refresh

---

### Scenario 7: Video Not Found

**Given**: Admin tries to approve/delete non-existent video  
**When**: API request sent with invalid video ID  
**Then**:
- API returns 404 Not Found
- Error toast: "Video not found"
- No database changes
- No audit log entry

**Expected Payload**:
\`\`\`json
{
  "error": "Video not found"
}
\`\`\`

---

## Acceptance Criteria

### Functional Requirements

✅ **FR1**: Admin can view all pending videos with full metadata  
✅ **FR2**: Admin can approve pending videos with single click  
✅ **FR3**: Admin can delete videos from any status  
✅ **FR4**: Deletion requires explicit confirmation modal  
✅ **FR5**: All actions show loading states during processing  
✅ **FR6**: Success/error messages displayed via toast notifications  
✅ **FR7**: Videos filtered into tabs: Pending, Approved, Rejected  
✅ **FR8**: Each video shows: thumbnail, title, description, category, duration, views, uploader, submission date  

### Security Requirements

✅ **SR1**: All admin endpoints require valid JWT authentication  
✅ **SR2**: Admin role verified from profiles table before action  
✅ **SR3**: RLS policies prevent unauthorized database access  
✅ **SR4**: All admin actions logged in audit trail  
✅ **SR5**: Audit logs include: admin_id, action, timestamp, metadata  
✅ **SR6**: Audit logs immutable (no update/delete policies)  

### Performance Requirements

✅ **PR1**: Video list loads in < 2 seconds  
✅ **PR2**: Approve/delete actions complete in < 1 second  
✅ **PR3**: UI updates immediately (optimistic or actual)  
✅ **PR4**: Database indexes optimize common queries  

### UX Requirements

✅ **UX1**: Loading spinner shown during initial page load  
✅ **UX2**: Button loading states during approve/delete  
✅ **UX3**: Confirmation modal prevents accidental deletion  
✅ **UX4**: Toast notifications auto-dismiss after 5 seconds  
✅ **UX5**: Empty states shown when no videos in tab  
✅ **UX6**: Video thumbnails load from YouTube if no custom thumbnail  

### Error Handling Requirements

✅ **EH1**: 401 errors redirect to login  
✅ **EH2**: 403 errors show access denied message  
✅ **EH3**: 404 errors show "not found" message  
✅ **EH4**: 500 errors show "try again" message  
✅ **EH5**: Network errors allow retry  
✅ **EH6**: All errors logged to console with [v0] prefix  

### Audit & Compliance Requirements

✅ **AC1**: All approvals logged with previous/new status  
✅ **AC2**: All deletions logged with video metadata  
✅ **AC3**: Logs include admin_id for accountability  
✅ **AC4**: Logs queryable by date range, admin, action type  
✅ **AC5**: Logs preserved even after video deletion  

---

## Manual Testing Checklist

### Pre-Testing Setup
- [ ] Admin user created in profiles table
- [ ] At least 5 pending videos in database
- [ ] At least 2 approved videos in database
- [ ] Network throttling available in DevTools

### Test Execution
- [ ] Login as admin user
- [ ] Navigate to `/admin`
- [ ] Verify all tabs visible (Pending, Approved, Rejected)
- [ ] Verify video count badges match database
- [ ] Click on each video to verify thumbnail loads
- [ ] Approve a pending video and verify it moves to Approved tab
- [ ] Click Delete, cancel modal, verify no deletion
- [ ] Click Delete, confirm, verify video removed
- [ ] Check audit_logs table for both actions
- [ ] Logout and try accessing `/admin` → should redirect
- [ ] Login as non-admin, try API endpoint → should get 403
- [ ] Simulate network error, verify error toast
- [ ] Refresh page, verify state persists from database

### Regression Testing
- [ ] Other pages still work (home, about, video)
- [ ] Non-admin users can't access admin features
- [ ] Video view counts still increment correctly
- [ ] Search/filter functionality unaffected
