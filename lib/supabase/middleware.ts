import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Refresh the user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (request.nextUrl.pathname.startsWith("/create-course") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Check admin access
  if (request.nextUrl.pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}
