"use client"

import { useAnnotation, type Annotation } from "@/context/annotation-context"
import { Trash2, Highlighter, Underline, MessageSquare, Pen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface AnnotationSidebarProps {
  currentPage: number
}

export function AnnotationSidebar({ currentPage }: AnnotationSidebarProps) {
  const { annotations, removeAnnotation } = useAnnotation()

  // Group annotations by page
  const annotationsByPage = annotations.reduce(
    (acc, annotation) => {
      const pageNumber = annotation.pageNumber
      if (!acc[pageNumber]) {
        acc[pageNumber] = []
      }
      acc[pageNumber].push(annotation)
      return acc
    },
    {} as Record<number, Annotation[]>,
  )

  // Get icon for annotation type
  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case "highlight":
        return <Highlighter className="h-4 w-4" />
      case "underline":
        return <Underline className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "signature":
        return <Pen className="h-4 w-4" />
      default:
        return null
    }
  }

  // Get preview text for annotation
  const getAnnotationPreview = (annotation: Annotation) => {
    switch (annotation.type) {
      case "highlight":
        return "Highlighted text"
      case "underline":
        return "Underlined text"
      case "comment":
        return annotation.text || "Comment"
      case "signature":
        return "Signature"
      default:
        return "Annotation"
    }
  }

  return (
    <div className="flex flex-col h-full rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="font-medium mb-2">Annotations by Page</h3>

      {Object.keys(annotationsByPage).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No annotations yet</div>
      ) : (
        <ScrollArea className="flex-1">
          {Object.entries(annotationsByPage)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([pageNumber, pageAnnotations]) => (
              <div key={pageNumber} className="mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Page {pageNumber} {Number(pageNumber) === currentPage && "(Current)"}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {pageAnnotations.length} {pageAnnotations.length === 1 ? "annotation" : "annotations"}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="space-y-2">
                  {pageAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="flex items-center justify-between p-2 rounded-md border hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center w-6 h-6 rounded-full"
                          style={{ backgroundColor: annotation.color || "#FFEB3B" }}
                        >
                          {getAnnotationIcon(annotation.type)}
                        </div>
                        <div className="text-sm truncate max-w-[150px]">{getAnnotationPreview(annotation)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeAnnotation(annotation.id)}
                        title="Delete annotation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </ScrollArea>
      )}
    </div>
  )
}

