"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { revalidatePath } from "next/cache"

export type Course = {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string | null
  category: string
  duration: string
  views: number
  status: string
  instructor_id: string | null
  created_at: string
}

export async function getCourses(): Promise<Course[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching courses:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getCourses:", error)
    return []
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    console.log("[v0] Fetching approved courses...")
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching all courses:", error)
      return []
    }

    console.log("[v0] Fetched courses:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("[v0] Error in getAllCourses:", error)
    return []
  }
}

export async function createCourse(courseData: {
  title: string
  description: string
  video_url: string
  thumbnail_url: string | null
  category: string
  duration: string
}) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title: courseData.title,
          description: courseData.description,
          video_url: courseData.video_url,
          category: courseData.category,
          thumbnail_url: courseData.thumbnail_url,
          duration: courseData.duration,
          instructor_id: null, // No user, so instructor_id is null
          status: "approved", // Automatically approve courses
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error creating course:", error)
      throw new Error("Failed to create course")
    }

    revalidatePath("/video")
    revalidatePath("/")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("[v0] Error in createCourse:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create course" }
  }
}

export async function approveCourse(courseId: string) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("courses").update({ status: "approved" }).eq("id", courseId)

    if (error) {
      console.error("[v0] Error approving course:", error)
      throw new Error("Failed to approve course")
    }

    revalidatePath("/admin")
    revalidatePath("/video")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in approveCourse:", error)
    return { success: false, error: "Failed to approve course" }
  }
}

export async function rejectCourse(courseId: string) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("courses").update({ status: "rejected" }).eq("id", courseId)

    if (error) {
      console.error("[v0] Error rejecting course:", error)
      throw new Error("Failed to reject course")
    }

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in rejectCourse:", error)
    return { success: false, error: "Failed to reject course" }
  }
}

export async function deleteCourse(courseId: string) {
  try {
    console.log("[v0] Deleting course:", courseId)
    const supabase = createServiceRoleClient()

    const { error } = await supabase.from("courses").delete().eq("id", courseId)

    if (error) {
      console.error("[v0] Error deleting course:", error)
      throw new Error("Failed to delete course")
    }

    console.log("[v0] Course deleted successfully")
    revalidatePath("/admin")
    revalidatePath("/video")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in deleteCourse:", error)
    return { success: false, error: "Failed to delete course" }
  }
}

export async function incrementViews(courseId: string) {
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
