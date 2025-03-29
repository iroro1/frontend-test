"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAnnotation } from "@/context/annotation-context"
import { SignatureCanvas } from "@/components/signature-canvas"
import { CommentDialog } from "@/components/comment-dialog"
import { v4 as uuidv4 } from "uuid"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnnotationLayerProps {
  pageNumber: number
  viewport?: any
  container: HTMLDivElement | null
}

export function AnnotationLayer({ pageNumber, viewport, container }: AnnotationLayerProps) {
  const { 
    annotations, 
    currentTool, 
    currentColor, 
    addAnnotation, 
    updateAnnotation, 
    removeAnnotation 
  } = useAnnotation()
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null)
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [signaturePosition, setSignaturePosition] = useState<{ x: number, y: number } | null>(null)
  const [selectedComment, setSelectedComment] = useState<any>(null)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const layerRef = useRef<HTMLDivElement>(null)

  // Filter annotations for the current page
  const pageAnnotations = annotations.filter(a => a.pageNumber === pageNumber)

  // Set up the layer dimensions based on the viewport
  useEffect(() => {
    if (!layerRef.current || !viewport) return
    
    layerRef.current.style.width = `${viewport.width}px`
    layerRef.current.style.height = `${viewport.height}px`
  }, [viewport])

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool === "none") return
    
    // Get coordinates relative to the layer
    const rect = layerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (currentTool === "signature") {
      setSignaturePosition({ x, y })
      setShowSignatureCanvas(true)
      return
    }
    
    if (currentTool === "comment") {
      const newComment = {
        id: uuidv4(),
        type: "comment",
        pageNumber,
        x,
        y,
        color: currentColor,
        text: "",
      }
      
      addAnnotation(newComment)
      setSelectedComment(newComment)
      setIsCommentDialogOpen(true)
      return
    }
    
    // For highlight and underline, we need to track drawing
    if (currentTool === "highlight" || currentTool === "underline") {
      setIsDrawing(true)
      setStartPoint({ x, y })
    }
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return
    
    const rect = layerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // For now, we'll create a temporary annotation
    // In a full implementation, you'd update a visual indicator
  }

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return
    \
    const rect = layerRef.current?.getBoun  => {
    if (!isDrawing || !startPoint) return
    
    const rect = layerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Create the annotation
    const width = Math.abs(startPoint.x - x)
    const height = currentTool === "highlight" ? 20 : 2
    
    // Create the annotation
    const annotation = {
      id: uuidv4(),
      type: currentTool,
      pageNumber,
      x: Math.min(startPoint.x, x),
      y: currentTool === "underline" ? startPoint.y : Math.min(startPoint.y, y),
      width,
      height,
      color: currentColor,
    }
    
    addAnnotation(annotation)
    
    // Reset drawing state
    setIsDrawing(false)
    setStartPoint(null)
  }

  // Handle annotation click
  const handleAnnotationClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    
    if (currentTool === "none") {
      setSelectedAnnotation(id === selectedAnnotation ? null : id)
    }
  }

  // Handle annotation mouse down (for dragging)
  const handleAnnotationMouseDown = (e: React.MouseEvent, annotation: any) => {
    e.stopPropagation()
    
    if (currentTool === "none") {
      setSelectedAnnotation(annotation.id)
      setIsDragging(true)
      
      // Calculate offset from mouse position to annotation top-left corner
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      
      // Add event listeners for mouse move and mouse up
      document.addEventListener("mousemove", handleDocumentMouseMove)
      document.addEventListener("mouseup", handleDocumentMouseUp)
    }
  }

  // Handle document mouse move (for dragging)
  const handleDocumentMouseMove = (e: MouseEvent) => {
    if (!isDragging || !selectedAnnotation) return
    
    const annotation = annotations.find(a => a.id === selectedAnnotation)
    if (!annotation) return
    
    const rect = layerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    // Calculate new position, accounting for drag offset
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y
    
    // Update annotation position
    updateAnnotation({
      ...annotation,
      x: newX,
      y: newY,
    })
  }

  // Handle document mouse up (for dragging)
  const handleDocumentMouseUp = () => {
    setIsDragging(false)
    
    // Remove event listeners
    document.removeEventListener("mousemove", handleDocumentMouseMove)
    document.removeEventListener("mouseup", handleDocumentMouseUp)
  }

  // Handle delete annotation
  const handleDeleteAnnotation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeAnnotation(id)
    setSelectedAnnotation(null)
  }

  // Handle signature save
  const handleSignatureSave = (dataUrl: string) => {
    if (!signaturePosition) return
    
    const signature = {
      id: uuidv4(),
      type: "signature",
      pageNumber,
      x: signaturePosition.x,
      y: signaturePosition.y,
      width: 200,
      height: 100,
      dataUrl,
    }
    
    addAnnotation(signature)
    setShowSignatureCanvas(false)
    setSignaturePosition(null)
  }

  // Handle signature cancel
  const handleSignatureCancel = () => {
    setShowSignatureCanvas(false)
    setSignaturePosition(null)
  }

  // Handle comment dialog close
  const handleCommentDialogClose = () => {
    setIsCommentDialogOpen(false)
    setSelectedComment(null)
  }

  return (
    <>
      <div 
        ref={layerRef}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{
          cursor: currentTool !== "none" ? "crosshair" : "default",
          zIndex: 10
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Render annotations */}
        {pageAnnotations.map(annotation => {
          const isSelected = selectedAnnotation === annotation.id
          
          if (annotation.type === "highlight") {
            return (
              <div
                key={annotation.id}
                className={`absolute rounded-sm ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y}px`,
                  width: `${annotation.width || 100}px`,
                  height: `${annotation.height || 20}px`,
                  backgroundColor: annotation.color || "#FFEB3B",
                  opacity: 0.5,
                  pointerEvents: "auto",
                  cursor: currentTool === "none" ? "move" : "default",
                  border: "1px solid rgba(0,0,0,0.2)",
                  zIndex: isSelected ? 60 : 50,
                }}
                onClick={(e) => handleAnnotationClick(e, annotation.id)}
                onMouseDown={(e) => handleAnnotationMouseDown(e, annotation)}
              >
                {isSelected && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 h-6 w-6"
                    onClick={(e) => handleDeleteAnnotation(e, annotation.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          }
          
          if (annotation.type === "underline") {
            return (
              <div
                key={annotation.id}
                className={`absolute ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y}px`,
                  width: `${annotation.width || 100}px`,
                  height: "2px",
                  backgroundColor: annotation.color || "#FFEB3B",
                  pointerEvents: "auto",
                  cursor: currentTool === "none" ? "move" : "default",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  zIndex: isSelected ? 60 : 50,
                }}
                onClick={(e) => handleAnnotationClick(e, annotation.id)}
                onMouseDown={(e) => handleAnnotationMouseDown(e, annotation)}
              >
                {isSelected && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-6 -right-3 h-6 w-6"
                    onClick={(e) => handleDeleteAnnotation(e, annotation.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          }
          
          if (annotation.type === "comment") {
            return (
              <div
                key={annotation.id}
                className={`absolute rounded-full flex items-center justify-center text-white ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y}px`,
                  width: "24px",
                  height: "24px",
                  backgroundColor: annotation.color || "#FFEB3B",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "auto",
                  cursor: currentTool === "none" ? "move" : "default",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  border: "2px solid white",
                  zIndex: isSelected ? 60 : 50,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (currentTool === "none") {
                    setSelectedAnnotation(annotation.id)
                    setSelectedComment(annotation)
                    setIsCommentDialogOpen(true)
                  }
                }}
                onMouseDown={(e) => handleAnnotationMouseDown(e, annotation)}
              >
                C
                {isSelected && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 h-6 w-6"
                    onClick={(e) => handleDeleteAnnotation(e, annotation.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          }
          
          if (annotation.type === "signature" && annotation.dataUrl) {
            return (
              <div
                key={annotation.id}
                className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y}px`,
                  pointerEvents: "auto",
                  cursor: currentTool === "none" ? "move" : "default",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  background: "rgba(255,255,255,0.5)",
                  padding: "2px",
                  border: "1px dashed rgba(0,0,0,0.3)",
                  zIndex: isSelected ? 60 : 50,
                }}
                onClick={(e) => handleAnnotationClick(e, annotation.id)}
                onMouseDown={(e) => handleAnnotationMouseDown(e, annotation)}
              >
                <img
                  src={annotation.dataUrl || "/placeholder.svg"}
                  alt="Signature"
                  style={{
                    width: `${annotation.width || 200}px`,
                    height: `${annotation.height || 100}px`,
                    objectFit: "contain",
                  }}
                />
                {isSelected && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 h-6 w-6"
                    onClick={(e) => handleDeleteAnnotation(e, annotation.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          }
          
          return null
        })}
      </div>

      {/* Signature Canvas */}
      {showSignatureCanvas && signaturePosition && (
        <SignatureCanvas
          position={signaturePosition}
          onSave={handleSignatureSave}
          onCancel={handleSignatureCancel}
          color={currentColor}
        />
      )}

      {/* Comment Dialog */}
      {isCommentDialogOpen && selectedComment && (
        <CommentDialog 
          comment={selectedComment} 
          isOpen={isCommentDialogOpen} 
          onClose={handleCommentDialogClose} 
        />
      )}
    </>
  )
}

