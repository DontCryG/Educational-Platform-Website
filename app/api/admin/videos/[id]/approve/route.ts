import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id: videoId } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { data: video, error: updateError } = await supabase
      .from("courses")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Update error:", updateError)
      return NextResponse.json({ error: "Failed to approve video" }, { status: 500 })
    }

    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action: "approve",
      resource_type: "video",
      resource_id: videoId,
      timestamp: new Date().toISOString(),
      metadata: {
        video_title: video.title,
        previous_status: "pending",
        new_status: "approved",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Video approved successfully",
      video,
    })
  } catch (error) {
    console.error("[v0] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
