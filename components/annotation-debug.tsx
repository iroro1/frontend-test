"use client"

import { useState } from "react"
import { useAnnotation } from "@/context/annotation-context"
import { Button } from "@/components/ui/button"
import { Bug, ChevronDown, ChevronUp, Trash } from "lucide-react"

export function AnnotationDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const { annotations, currentTool, currentColor, removeAnnotation } = useAnnotation()

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
    {} as Record<number, any[]>,
  )

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" className="gap-1 bg-white shadow-md" onClick={() => setIsOpen(!isOpen)}>
        <Bug className="h-4 w-4" />
        Debug
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="mt-2 p-3 bg-white rounded-md border shadow-lg w-80 max-h-80 overflow-auto">
          <h4 className="font-medium mb-2">Current State</h4>
          <div className="text-xs space-y-1">
            <p>
              <strong>Tool:</strong> {currentTool}
            </p>
            <p>
              <strong>Color:</strong> {currentColor}
            </p>
            <p>
              <strong>Total Annotations:</strong> {annotations.length}
            </p>
          </div>

          {Object.keys(annotationsByPage).length > 0 && (
            <>
              <h4 className="font-medium mt-3 mb-2">Annotations by Page</h4>
              <div className="space-y-3">
                {Object.entries(annotationsByPage).map(([pageNumber, pageAnnotations]) => (
                  <div key={pageNumber} className="border-t pt-2">
                    <h5 className="font-medium text-xs mb-1">
                      Page {pageNumber} ({pageAnnotations.length})
                    </h5>
                    <div className="space-y-2">
                      {pageAnnotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="text-xs p-2 border rounded flex justify-between items-center"
                        >
                          <div>
                            <p>
                              <strong>Type:</strong> {annotation.type}
                            </p>
                            <p>
                              <strong>Position:</strong> x: {Math.round(annotation.x)}, y: {Math.round(annotation.y)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeAnnotation(annotation.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

