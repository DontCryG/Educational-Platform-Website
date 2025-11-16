"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmationModalProps {
  videoId: string
  videoTitle: string
  onConfirm: (videoId: string) => Promise<void>
  isLoading?: boolean
}

export function DeleteConfirmationModal({
  videoId,
  videoTitle,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    await onConfirm(videoId)
    setOpen(false)
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={isLoading} className="gap-2">
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the video{" "}
              <span className="font-semibold text-foreground">"{videoTitle}"</span> from the database and remove all
              associated media files from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
