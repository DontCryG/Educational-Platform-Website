"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, PlayCircle, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { saveDraft } from "@/lib/actions/drafts"

type QuizQuestion = {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export default function CreateCoursePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: null as File | null,
    category: "easy",
    duration: "",
  })

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [showQuizSection, setShowQuizSection] = useState(false)

  const getYouTubeVideoId = (url: string) => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v") || ""
      } else if (urlObj.hostname.includes("youtu.be")) {
        return urlObj.pathname.slice(1)
      }
      return ""
    } catch {
      return ""
    }
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const thumbnailUrl = formData.thumbnail
        ? URL.createObjectURL(formData.thumbnail)
        : getYouTubeThumbnail(formData.videoUrl)

      const result = await saveDraft({
        title: formData.title,
        description: formData.description,
        video_url: formData.videoUrl,
        category: formData.category,
        thumbnail_url: thumbnailUrl,
        duration: formData.duration,
        quiz_questions: quizQuestions,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Course Submitted!",
        description: "Your course has been sent to admin for review.",
      })

      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        thumbnail: null,
        category: "easy",
        duration: "",
      })
      setQuizQuestions([])
      setShowQuizSection(false)

      router.push("/")
    } catch (error) {
      console.error("[v0] Error submitting course:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, thumbnail: e.target.files[0] })
    }
  }

  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: 0,
        explanation: "",
      },
    ])
  }

  const updateQuizQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...quizQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setQuizQuestions(updated)
  }

  const updateQuizOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...quizQuestions]
    updated[questionIndex].options[optionIndex] = value
    setQuizQuestions(updated)
  }

  const removeQuizQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Create New Course</h1>
          <p className="mt-2 text-lg text-muted-foreground">Share your knowledge with learners around the world</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Course Details</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Fill in the information about your course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">
                      Course Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Introduction to React"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn in this course..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={5}
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-foreground">
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      type="text"
                      placeholder="e.g., 45 min, 1h 30min"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl" className="text-foreground">
                      Video URL
                    </Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      required
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-foreground">
                      Category
                    </Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground">Quiz Questions (Optional)</Label>
                        <p className="text-xs text-muted-foreground">
                          Add quiz questions for students to answer after watching the video
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQuizSection(!showQuizSection)}
                        className="border-primary text-primary"
                      >
                        {showQuizSection ? "Hide Quiz" : "Add Quiz"}
                      </Button>
                    </div>

                    {showQuizSection && (
                      <div className="space-y-4 pt-4">
                        {quizQuestions.map((q, qIndex) => (
                          <Card key={qIndex} className="border-border">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm">Question {qIndex + 1}</CardTitle>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuizQuestion(qIndex)}
                                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-xs">Question Text</Label>
                                <Input
                                  placeholder="Enter your question..."
                                  value={q.question}
                                  onChange={(e) => updateQuizQuestion(qIndex, "question", e.target.value)}
                                  required
                                  className="border-border bg-background"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Answer Options</Label>
                                {q.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${qIndex}`}
                                      checked={q.correct_answer === oIndex}
                                      onChange={() => updateQuizQuestion(qIndex, "correct_answer", oIndex)}
                                      className="h-4 w-4 text-primary"
                                    />
                                    <Input
                                      placeholder={`Option ${oIndex + 1}`}
                                      value={option}
                                      onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                                      required
                                      className="border-border bg-background"
                                    />
                                  </div>
                                ))}
                                <p className="text-xs text-muted-foreground">Select the correct answer</p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Explanation (Optional)</Label>
                                <Textarea
                                  placeholder="Explain why this is the correct answer..."
                                  value={q.explanation}
                                  onChange={(e) => updateQuizQuestion(qIndex, "explanation", e.target.value)}
                                  rows={2}
                                  className="border-border bg-background"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={addQuizQuestion}
                          className="w-full border-dashed border-primary text-primary hover:bg-primary/10 bg-transparent"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Question
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-background hover:bg-primary/90"
                  >
                    {isLoading ? "Submitting..." : "Publish Course"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Preview</CardTitle>
                <CardDescription className="text-muted-foreground">How your course will appear</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                    {formData.thumbnail ? (
                      <img
                        src={URL.createObjectURL(formData.thumbnail) || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                    ) : formData.videoUrl ? (
                      <img
                        src={getYouTubeThumbnail(formData.videoUrl) || "/placeholder.svg?height=200&width=400"}
                        alt="Video thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{formData.title || "Course Title"}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {formData.description || "Course description will appear here..."}
                    </p>
                    {formData.duration && (
                      <p className="mt-2 text-xs text-muted-foreground">Duration: {formData.duration}</p>
                    )}
                    {quizQuestions.length > 0 && (
                      <p className="mt-1 text-xs text-primary">
                        {quizQuestions.length} Quiz Question{quizQuestions.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
