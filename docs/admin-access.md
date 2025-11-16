# Admin Access Guide

## Overview
The Lotus Arcana admin dashboard uses a secure server-side authentication system for access to video moderation features.

## Security Architecture

- **Server-Side Verification**: Access key validation happens entirely on the server using Next.js Server Actions
- **HTTP-Only Cookies**: Authentication state is stored in secure, HTTP-only cookies that cannot be accessed by client-side JavaScript
- **No Client Exposure**: The admin key never exists in client-side code or browser-accessible environment variables

## Access Key Configuration

**Environment Variable**: `ADMIN_KEY` (server-only variable)

Set the admin access key as a server-only environment variable:

\`\`\`
ADMIN_KEY=your_secure_admin_key_here
\`\`\`

**Important**: This variable is server-only and will never be exposed to the browser.

**Default Key**: If no environment variable is set, the system defaults to `LOTUS_ADMIN_2024`

## How to Access Admin Dashboard

1. **Navigate to Admin**
   - Click the "Admin" button in the main navigation menu
   - Or visit directly: `/admin`

2. **Enter Access Key**
   - Enter the admin access key in the secure login form
   - The key is sent to the server for validation (never validated client-side)
   - Click "Access Admin Dashboard"

3. **Access Granted**
   - Upon successful server validation, a secure HTTP-only cookie is set
   - Your session will persist for 24 hours or until logout
   - The cookie cannot be accessed by JavaScript (XSS protection)

## Features Available

- **Video Moderation**: Approve or delete pending videos
- **Status Management**: View videos by status (Pending, Approved, Rejected)
- **Audit Trail**: All actions are logged for accountability
- **Secure Logout**: Clears authentication cookie and returns to login screen

## Security Features

✅ **Server-Side Validation**: All authentication logic runs on the server
✅ **HTTP-Only Cookies**: Session cookies cannot be accessed by JavaScript
✅ **No Client Exposure**: Admin key never sent to browser
✅ **Secure by Default**: Uses Next.js Server Actions for authentication
✅ **Session Management**: 24-hour secure sessions with logout capability

## Changing the Access Key

To change the admin access key:

**Using Environment Variable (Required for Production)**:
1. Go to your Vercel Project Settings → Environment Variables
2. Add or update `ADMIN_KEY` (server-only variable without any public prefix)
3. Set your desired secure key value
4. Redeploy the application
5. The new key will be validated server-side only

**Security Guidelines:**
- ✅ Use `ADMIN_KEY` for server-side validation
- ❌ Never use variables with `NEXT_PUBLIC_` prefix for sensitive data
- ❌ Never hardcode keys in client components
- ❌ Never store keys in browser storage or cookies accessible to JavaScript

## How It Works

1. **User enters access key** → Client component collects input
2. **Call server action** → `verifyAdminAccess()` runs on server
3. **Server validates key** → Compares with `process.env.ADMIN_KEY`
4. **Set secure cookie** → HTTP-only cookie for authentication
5. **Grant access** → User can access admin dashboard

## Troubleshooting

- **Invalid Key Error**: Double-check the access key with your administrator
- **Session Lost**: The cookie expired (24 hours) - re-enter the access key
- **Can't Access**: Ensure the `ADMIN_KEY` environment variable is set correctly
- **Deployment Error**: Verify you're using server-only environment variables
