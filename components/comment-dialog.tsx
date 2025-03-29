"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAnnotation, type Annotation } from "@/context/annotation-context"

interface CommentDialogProps {
  comment: Annotation
  isOpen: boolean
  onClose: () => void
}

export function CommentDialog({ comment, isOpen, onClose }: CommentDialogProps) {
  const [text, setText] = useState("")
  const { updateAnnotation, removeAnnotation } = useAnnotation()

  useEffect(() => {
    if (comment) {
      setText(comment.text || "")
    }
  }, [comment])

  const handleSave = () => {
    if (comment) {
      updateAnnotation({
        ...comment,
        text,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (comment) {
      removeAnnotation(comment.id)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Enter your comment here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDelete} className="mr-auto">
            Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

