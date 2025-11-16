import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { data: video } = await supabase.from("courses").select("*").eq("id", videoId).single()

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const { error: deleteError } = await supabase.from("courses").delete().eq("id", videoId)

    if (deleteError) {
      console.error("[v0] Delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
    }

    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action: "delete",
      resource_type: "video",
      resource_id: videoId,
      timestamp: new Date().toISOString(),
      metadata: {
        video_title: video.title,
        video_status: video.status,
        video_category: video.category,
        deletion_reason: "Manual deletion by admin",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
