"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { CheckCircle2, Clock, PlayCircle, User } from "lucide-react"
import type { Course } from "@/lib/actions/courses"

interface VideoModerationCardProps {
  video: Course
  onApprove: (videoId: string) => Promise<void>
  onDelete: (videoId: string) => Promise<void>
}

export function VideoModerationCard({ video, onApprove, onDelete }: VideoModerationCardProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onApprove(video.id)
    } finally {
      setIsApproving(false)
    }
  }

  const handleDelete = async (videoId: string) => {
    setIsDeleting(true)
    try {
      await onDelete(videoId)
    } finally {
      setIsDeleting(false)
    }
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
  }

  const thumbnail =
    video.thumbnail_url || getYouTubeThumbnail(video.video_url) || "/placeholder.svg?height=200&width=350"

  return (
    <Card className="overflow-hidden border-border bg-card transition-all hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img src={thumbnail || "/placeholder.svg"} alt={video.title} className="h-full w-full object-cover" />
        <div className="absolute right-2 top-2">
          <Badge variant={video.status === "pending" ? "secondary" : "default"} className="bg-black/60 text-white">
            {video.status}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 text-lg text-foreground">{video.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-muted-foreground">{video.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Metadata */}
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" />
            <span>{video.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <PlayCircle className="h-4 w-4 text-primary" />
            <span>{video.views} views</span>
          </div>
          <div className="col-span-2 flex items-center gap-1">
            <User className="h-4 w-4 text-primary" />
            <span className="truncate">ID: {video.instructor_id || "N/A"}</span>
          </div>
        </div>

        {/* Category Badge */}
        <div>
          <Badge variant="outline" className="border-primary/20 text-primary">
            {video.category}
          </Badge>
        </div>

        {/* Submission Date */}
        <div className="text-xs text-muted-foreground">
          Submitted:{" "}
          {new Date(video.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Action Buttons */}
        {video.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isApproving || isDeleting}
              className="flex-1 gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isApproving ? "Approving..." : "Approve"}
            </Button>
            <DeleteConfirmationModal
              videoId={video.id}
              videoTitle={video.title}
              onConfirm={handleDelete}
              isLoading={isDeleting || isApproving}
            />
          </div>
        ) : (
          <DeleteConfirmationModal
            videoId={video.id}
            videoTitle={video.title}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        )}
      </CardContent>
    </Card>
  )
}
