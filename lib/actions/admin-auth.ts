"use server"

import { cookies } from "next/headers"

/**
 * Server-side admin authentication
 * Verifies the access key securely on the server without exposing it to the client
 */
export async function verifyAdminAccess(accessKey: string): Promise<{ success: boolean; message: string }> {
  // Get the admin key from server-side environment variable (NOT NEXT_PUBLIC_)
  const serverAdminKey = process.env.ADMIN_KEY || "LOTUS_ADMIN_2024"

  if (accessKey === serverAdminKey) {
    // Set a secure HTTP-only cookie for authentication
    const cookieStore = await cookies()
    cookieStore.set("admin_authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return {
      success: true,
      message: "Access granted. Welcome to the admin dashboard.",
    }
  }

  return {
    success: false,
    message: "Invalid access key. Please try again.",
  }
}

/**
 * Check if user is authenticated as admin
 */
export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("admin_authenticated")
  return authCookie?.value === "true"
}

/**
 * Logout admin user
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("admin_authenticated")
}
