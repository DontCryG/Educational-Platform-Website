"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle, Users, BookOpen, Award } from "lucide-react"
import { getCourses } from "@/lib/actions/courses"

type Course = {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string | null
  category: string
  duration: string
  views: number
  created_at: string
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await getCourses()
      setCourses(data.slice(0, 3))
    }

    fetchCourses()
    const interval = setInterval(fetchCourses, 5000)

    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      icon: BookOpen,
      title: "Explore Instantly",
      description: "Access a library of paranormal mysteries on any device. No login required—just jump straight into the unknown",
    },
    {
      icon: PlayCircle,
      title: "Watch & Recall",
      description: "Immerse yourself in the stories, then challenge your memory with quizzes to review every eerie detail you just watched",
    },
    {
      icon: Award,
      title: "Share Your Scare",
      description: "Upload your own media or create quizzes. All content is verified by admins to ensure a safe and high-quality community",
    },
  ]

  const getYouTubeThumbnail = (url: string) => {
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

  const getThumbnailUrl = (course: Course) => {
    if (course.thumbnail_url) {
      return course.thumbnail_url
    }
    const ytThumbnail = getYouTubeThumbnail(course.video_url)
    if (ytThumbnail) {
      return ytThumbnail
    }
    return "/placeholder.svg?height=400&width=600"
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-card px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Unlock{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                the Unknown
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Read memories from stories and legends you just experienced, create quizzes and stories instantly, all of
              which can be checked on both mobile and computer.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full bg-primary text-background hover:bg-primary/90 sm:w-auto">
                <Link href="/video">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-primary text-primary hover:bg-primary/10 sm:w-auto bg-transparent"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses && courses.length > 0 && (
        <section className="border-b border-border bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Top Haunted Tales</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Watch the most viewed mysteries and challenge your memory with our community's top quizzes
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden border-border bg-card transition-transform hover:scale-105"
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={getThumbnailUrl(course) || "/placeholder.svg?height=400&width=600"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                      }}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-foreground">{course.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <PlayCircle className="h-4 w-4 text-primary" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{course.views} views</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-primary text-background hover:bg-primary/90">
                      <Link href="/video">View Course</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-card px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How to Join the Mystery</h2>
            <p className="mt-4 text-lg text-muted-foreground">Experience the paranormal in 3 simple steps</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                    <Icon className="h-8 w-8 text-background" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
