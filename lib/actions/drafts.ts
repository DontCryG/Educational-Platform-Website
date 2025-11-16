"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { revalidatePath } from "next/cache"

export type Draft = {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string | null
  category: string
  duration: string
  instructor_id: string | null
  created_at: string
  updated_at: string
  quiz_questions?: any[] // Added quiz_questions field
}

export async function saveDraft(draftData: {
  title: string
  description: string
  video_url: string
  thumbnail_url: string | null
  category: string
  duration: string
  quiz_questions?: any[] // Added quiz_questions parameter
}) {
  try {
    console.log("[v0] Saving to drafts table for admin approval...")
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("drafts")
      .insert([
        {
          title: draftData.title,
          description: draftData.description,
          video_url: draftData.video_url,
          thumbnail_url: draftData.thumbnail_url,
          category: draftData.category,
          duration: draftData.duration,
          instructor_id: null,
          quiz_questions: draftData.quiz_questions || [],
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error saving draft:", error)
      throw new Error("Failed to save draft")
    }

    console.log("[v0] Draft saved successfully, awaiting admin approval:", data)
    revalidatePath("/admin")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("[v0] Error in saveDraft:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save draft",
    }
  }
}

export async function getDrafts(): Promise<Draft[]> {
  try {
    console.log("[v0] Fetching drafts...")
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase.from("drafts").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching drafts:", error)
      return []
    }

    console.log("[v0] Fetched drafts:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("[v0] Error in getDrafts:", error)
    return []
  }
}

export async function approveDraft(draftId: string) {
  try {
    console.log("[v0] Approving draft:", draftId)
    const supabase = createServiceRoleClient()

    // Get the draft
    const { data: draft, error: fetchError } = await supabase.from("drafts").select("*").eq("id", draftId).single()

    if (fetchError || !draft) {
      console.error("[v0] Error fetching draft:", fetchError)
      throw new Error("Failed to fetch draft")
    }

    const { data: course, error: insertError } = await supabase
      .from("courses")
      .insert([
        {
          title: draft.title,
          description: draft.description,
          video_url: draft.video_url,
          thumbnail_url: draft.thumbnail_url,
          category: draft.category,
          duration: draft.duration,
          status: "approved",
          views: 0,
          instructor_id: draft.instructor_id,
          quiz_questions: draft.quiz_questions || [],
        },
      ])
      .select()

    if (insertError) {
      console.error("[v0] Error creating course:", insertError)
      throw new Error("Failed to create course")
    }

    // Delete from drafts
    const { error: deleteError } = await supabase.from("drafts").delete().eq("id", draftId)

    if (deleteError) {
      console.error("[v0] Error deleting draft:", deleteError)
      // Don't throw error here as course was already created
    }

    console.log("[v0] Draft approved successfully")
    revalidatePath("/admin")
    revalidatePath("/video")
    revalidatePath("/")

    return { success: true, data: course[0] }
  } catch (error) {
    console.error("[v0] Error in approveDraft:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve draft",
    }
  }
}

export async function rejectDraft(draftId: string) {
  try {
    console.log("[v0] Rejecting draft:", draftId)
    const supabase = createServiceRoleClient()

    const { error } = await supabase.from("drafts").delete().eq("id", draftId)

    if (error) {
      console.error("[v0] Error rejecting draft:", error)
      throw new Error("Failed to reject draft")
    }

    console.log("[v0] Draft rejected successfully")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in rejectDraft:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject draft",
    }
  }
}

// Get all approved courses (for public display)
export async function getApprovedCourses(): Promise<Draft[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching approved courses:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getApprovedCourses:", error)
    return []
  }
}

// Increment course views
export async function incrementCourseViews(courseId: string) {
  try {
    const supabase = await createServerClient()

    const { data: course } = await supabase.from("courses").select("views").eq("id", courseId).single()

    if (!course) return

    await supabase
      .from("courses")
      .update({ views: course.views + 1 })
      .eq("id", courseId)

    revalidatePath("/video")
  } catch (error) {
    console.error("[v0] Error incrementing views:", error)
  }
}
