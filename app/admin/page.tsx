"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShieldCheck, Lock, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Draft } from "@/lib/actions/drafts"
import { getDrafts, approveDraft, rejectDraft } from "@/lib/actions/drafts"
import { getAllCourses, deleteCourse, type Course } from "@/lib/actions/courses"
import { verifyAdminAccess, checkAdminAuth, logoutAdmin } from "@/lib/actions/admin-auth"

export default function AdminPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessKey, setAccessKey] = useState("")
  const [authError, setAuthError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await checkAdminAuth()
      setIsAuthenticated(isAuth)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrafts()
      fetchCourses()
    }
  }, [isAuthenticated])

  const fetchDrafts = async () => {
    try {
      setIsLoading(true)
      const data = await getDrafts()
      setDrafts(data)
    } catch (error) {
      console.error("[v0] Error fetching drafts:", error)
      toast({
        title: "Error",
        description: "Failed to load drafts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      console.log("[v0] Starting to fetch courses...")
      const data = await getAllCourses()
      console.log("[v0] Received courses data:", data.length)
      const approved = data.filter((course) => course.status === "approved")
      console.log("[v0] Filtered approved courses:", approved.length)
      setCourses(approved)
    } catch (error) {
      console.error("[v0] Error fetching courses:", error)
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (draftId: string) => {
    try {
      setProcessingId(draftId)
      const result = await approveDraft(draftId)

      if (!result.success) {
        throw new Error(result.error)
      }

      setDrafts((prev) => prev.filter((d) => d.id !== draftId))

      await Promise.all([fetchDrafts(), fetchCourses()])

      toast({
        title: "Draft Approved",
        description: "The video has been approved and moved to the videos collection.",
      })
    } catch (error) {
      console.error("[v0] Error approving draft:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve draft",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (draftId: string) => {
    try {
      setProcessingId(draftId)
      const result = await rejectDraft(draftId)

      if (!result.success) {
        throw new Error(result.error)
      }

      setDrafts((prev) => prev.filter((d) => d.id !== draftId))

      await fetchDrafts()

      toast({
        title: "Draft Rejected",
        description: "The draft has been deleted.",
      })
    } catch (error) {
      console.error("[v0] Error rejecting draft:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject draft",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      setProcessingId(courseId)
      console.log("[v0] About to delete course:", courseId)
      const result = await deleteCourse(courseId)

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log("[v0] Calling fetchCourses after delete...")
      await fetchCourses()
      console.log("[v0] fetchCourses completed")

      toast({
        title: "Course Deleted",
        description: "The course has been permanently deleted.",
      })
    } catch (error) {
      console.error("[v0] Error deleting course:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete course",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setAuthError("")

    try {
      const result = await verifyAdminAccess(accessKey)

      if (result.success) {
        setIsAuthenticated(true)
        setAccessKey("")
        toast({
          title: "Access Granted",
          description: result.message,
        })
      } else {
        setAuthError(result.message)
        toast({
          title: "Access Denied",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error verifying access:", error)
      setAuthError("An error occurred. Please try again.")
      toast({
        title: "Error",
        description: "Failed to verify access. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleLogout = async () => {
    await logoutAdmin()
    setIsAuthenticated(false)
    setAccessKey("")
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin dashboard.",
    })
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Access</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your access key to continue</p>
          </div>

          <form onSubmit={handleKeySubmit} className="space-y-6 rounded-lg border border-border bg-card p-8 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key</Label>
              <Input
                id="accessKey"
                type="password"
                placeholder="Enter admin access key"
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value)
                  setAuthError("")
                }}
                className="h-12"
                autoFocus
                disabled={isVerifying}
              />
              {authError && <p className="text-sm text-destructive">{authError}</p>}
            </div>

            <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Admin Dashboard"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">Only authorized personnel can access this area</p>
          </form>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage courses and review submissions</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="drafts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="drafts">Pending Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="courses">Approved Courses ({courses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Pending Drafts</h2>
              <p className="text-sm text-muted-foreground">Approve to publish or reject to delete</p>
            </div>

            {drafts.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">No pending drafts to review.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="flex flex-col overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={draft.thumbnail_url || "/placeholder.svg?height=200&width=400"}
                        alt={draft.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-2">{draft.title}</h3>
                        <Badge variant="secondary" className="shrink-0">
                          {draft.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{draft.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {draft.duration}</span>
                        <span>
                          {new Date(draft.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 border-t border-border p-4">
                      <Button
                        onClick={() => handleApprove(draft.id)}
                        disabled={processingId === draft.id}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      >
                        {processingId === draft.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(draft.id)}
                        disabled={processingId === draft.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processingId === draft.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Approved Courses</h2>
              <p className="text-sm text-muted-foreground">Manage and delete published courses</p>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">No approved courses yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="flex flex-col overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg?height=200&width=400"}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-2">{course.title}</h3>
                        <Badge variant="secondary" className="shrink-0">
                          {course.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {course.duration}</span>
                        <span>Views: {course.views}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(course.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-border p-4">
                      <Button
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={processingId === course.id}
                        variant="destructive"
                        className="w-full"
                      >
                        {processingId === course.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Course
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
