"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, PlayCircle, Clock, Users, CheckCircle, XCircle } from "lucide-react"
import { getCourses, incrementViews } from "@/lib/actions/courses"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

type QuizQuestion = {
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
}

export default function VideoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  const categories = ["all", "easy", "medium", "hard"]

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (error) {
      console.error("[v0] Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVideos = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleVideoClick = async (course) => {
    setSelectedVideo(course)
    setShowQuiz(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowResults(false)
    setQuizScore(0)

    try {
      await incrementViews(course.id)
      setCourses(courses.map((c) => (c.id === course.id ? { ...c, views: c.views + 1 } : c)))
    } catch (error) {
      console.error("[v0] Error updating views:", error)
    }
  }

  const getYouTubeThumbnail = (url) => {
    try {
      const urlObj = new URL(url)
      let videoId = ""

      if (urlObj.hostname.includes("youtube.com")) {
        videoId = urlObj.searchParams.get("v") || ""
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1)
      }

      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
    } catch {
      return null
    }
  }

  const getYouTubeEmbedUrl = (url) => {
    try {
      const urlObj = new URL(url)
      let videoId = ""

      if (urlObj.hostname.includes("youtube.com")) {
        videoId = urlObj.searchParams.get("v") || ""
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1)
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
    } catch (error) {
      console.error("[v0] Error parsing YouTube URL:", error)
      return ""
    }
  }

  const getThumbnailUrl = (video) => {
    if (video.thumbnail_url) {
      return video.thumbnail_url
    }
    const ytThumbnail = getYouTubeThumbnail(video.video_url)
    if (ytThumbnail) {
      return ytThumbnail
    }
    return "/placeholder.svg?height=200&width=400"
  }

  const handleStartQuiz = () => {
    setShowQuiz(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowResults(false)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (selectedVideo?.quiz_questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = () => {
    let score = 0
    selectedVideo?.quiz_questions?.forEach((q: QuizQuestion, index: number) => {
      if (selectedAnswers[index] === q.correct_answer) {
        score++
      }
    })
    setQuizScore(score)
    setShowResults(true)
  }

  const quizQuestions = selectedVideo?.quiz_questions || []
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const hasQuiz = quizQuestions.length > 0

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Video Library</h1>
          <p className="mt-2 text-lg text-muted-foreground">Explore our collection of educational videos</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary text-background hover:bg-primary/90"
                    : "border-primary text-primary hover:bg-primary/10"
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="cursor-pointer overflow-hidden border-border bg-card transition-transform hover:scale-105"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={getThumbnailUrl(video) || "/placeholder.svg"}
                      alt={video.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity hover:opacity-100">
                      <PlayCircle className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-foreground">{video.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{video.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{video.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{video.views} views</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No videos found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{selectedVideo?.description}</DialogDescription>
          </DialogHeader>

          {!showQuiz ? (
            <>
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                {selectedVideo?.video_url ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PlayCircle className="h-20 w-20 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{selectedVideo?.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{selectedVideo?.views} views</span>
                  </div>
                </div>
                {hasQuiz && (
                  <Button onClick={handleStartQuiz} className="bg-primary text-background hover:bg-primary/90">
                    Take Quiz ({quizQuestions.length} questions)
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {!showResults ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuiz(false)}
                      className="border-border text-foreground"
                    >
                      Back to Video
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-lg font-medium text-foreground">{currentQuestion?.question}</p>

                    <RadioGroup
                      value={selectedAnswers[currentQuestionIndex]?.toString()}
                      onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                    >
                      {currentQuestion?.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="cursor-pointer text-foreground">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="border-border text-foreground bg-transparent"
                    >
                      Previous
                    </Button>

                    {currentQuestionIndex === quizQuestions.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={selectedAnswers.length !== quizQuestions.length}
                        className="bg-primary text-background hover:bg-primary/90"
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={selectedAnswers[currentQuestionIndex] === undefined}
                        className="bg-primary text-background hover:bg-primary/90"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-foreground">Quiz Complete!</h3>
                    <p className="mt-2 text-lg text-muted-foreground">
                      Your Score: {quizScore} / {quizQuestions.length} (
                      {Math.round((quizScore / quizQuestions.length) * 100)}%)
                    </p>
                  </div>

                  <div className="space-y-4">
                    {quizQuestions.map((q: QuizQuestion, index: number) => {
                      const userAnswer = selectedAnswers[index]
                      const isCorrect = userAnswer === q.correct_answer

                      return (
                        <Alert
                          key={index}
                          className={isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}
                        >
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                Question {index + 1}: {q.question}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">Your answer: {q.options[userAnswer]}</p>
                              {!isCorrect && (
                                <p className="mt-1 text-sm text-green-600">
                                  Correct answer: {q.options[q.correct_answer]}
                                </p>
                              )}
                              {q.explanation && (
                                <AlertDescription className="mt-2 text-sm text-muted-foreground">
                                  {q.explanation}
                                </AlertDescription>
                              )}
                            </div>
                          </div>
                        </Alert>
                      )
                    })}
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResults(false)
                        setCurrentQuestionIndex(0)
                        setSelectedAnswers([])
                      }}
                      className="border-border text-foreground"
                    >
                      Retake Quiz
                    </Button>
                    <Button
                      onClick={() => setShowQuiz(false)}
                      className="bg-primary text-background hover:bg-primary/90"
                    >
                      Back to Video
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
