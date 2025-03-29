"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useAnnotation, type Annotation } from "@/context/annotation-context"
import { SignatureCanvas } from "@/components/signature-canvas"
import { CommentDialog } from "@/components/comment-dialog"
import { v4 as uuidv4 } from "uuid"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnnotationOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>
  pageNumber: number
}

export function AnnotationOverlay({ containerRef, pageNumber }: AnnotationOverlayProps) {
  const { annotations, currentTool, currentColor, addAnnotation, updateAnnotation, removeAnnotation } = useAnnotation()

  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [signaturePosition, setSignaturePosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedComment, setSelectedComment] = useState<Annotation | null>(null)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Add these state variables
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)

  // Filter annotations for the current page
  const pageAnnotations = annotations.filter((a) => a.pageNumber === pageNumber)

  // Sync overlay size with container
  useEffect(() => {
    // Update the syncSize function to better match the container dimensions
    const syncSize = () => {
      if (!overlayRef.current || !containerRef.current) return

      // Reset the overlay position when syncing size
      overlayRef.current.style.top = "0"
      overlayRef.current.style.left = "0"

      if (!overlayRef.current || !containerRef.current) return

      const container = containerRef.current
      const iframe = container.querySelector("iframe")

      if (iframe) {
        // Wait for iframe to load
        const checkIframeSize = () => {
          const iframe = containerRef.current?.querySelector("iframe")
          if (!iframe || !overlayRef.current) return

          try {
            // Set the overlay to match the container size rather than the content size
            // This works better with page-fit mode
            overlayRef.current.style.width = `${containerRef.current.clientWidth}px`
            overlayRef.current.style.height = `${containerRef.current.clientHeight}px`

            // Ensure the overlay is positioned correctly
            overlayRef.current.style.position = "absolute"
            overlayRef.current.style.top = "0"
            overlayRef.current.style.left = "0"
            overlayRef.current.style.right = "0"
            overlayRef.current.style.bottom = "0"

            console.log(
              `Overlay size set to container dimensions: ${containerRef.current.clientWidth}px x ${containerRef.current.clientHeight}px`,
            )
          } catch (error) {
            console.error("Error setting overlay size:", error)
            // Set fallback size based on container
            if (containerRef.current && overlayRef.current) {
              overlayRef.current.style.width = `${containerRef.current.clientWidth}px`
              overlayRef.current.style.height = `${containerRef.current.clientHeight}px`
            }
          }
        }

        checkIframeSize()
      } else {
        // Fallback if iframe is not available
        overlayRef.current.style.width = `${container.clientWidth}px`
        overlayRef.current.style.height = `${container.clientHeight}px`
      }
    }

    syncSize()

    // Set up resize listener
    window.addEventListener("resize", syncSize)

    // Set up mutation observer to detect iframe content changes
    const observer = new MutationObserver(syncSize)
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    }

    // Re-sync when page number changes
    syncSize()

    return () => {
      window.removeEventListener("resize", syncSize)
      observer.disconnect()
    }
  }, [containerRef, pageNumber])

  // Replace handleOverlayClick with handleMouseDown
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get overlay position
    const rect = e.currentTarget.getBoundingClientRect()

    // Calculate position relative to the overlay
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Store container dimensions for proper scaling when exporting
    const containerWidth = overlayRef.current?.offsetWidth || 0
    const containerHeight = overlayRef.current?.offsetHeight || 0

    // For signature tool, show the signature canvas
    if (currentTool === "signature") {
      setSignaturePosition({ x, y })
      setShowSignatureCanvas(true)
      return
    }

    // For comment tool, open the comment dialog
    if (currentTool === "comment") {
      const newComment: Annotation = {
        id: uuidv4(),
        type: "comment",
        pageNumber,
        x,
        y,
        text: "",
        color: currentColor,
        containerWidth,
        containerHeight,
      }

      addAnnotation(newComment)
      setSelectedComment(newComment)
      setIsCommentDialogOpen(true)
      return
    }

    // For highlight or underline, start drawing
    if (currentTool === "highlight" || currentTool === "underline") {
      setIsDrawing(true)
      setStartPoint({ x, y })
      setCurrentPoint({ x, y })

      // Create a temporary annotation for visual feedback
      const tempAnnotation: Annotation = {
        id: "temp",
        type: currentTool,
        pageNumber,
        x,
        y,
        width: 0,
        height: currentTool === "highlight" ? 20 : 2,
        color: currentColor,
        containerWidth,
        containerHeight,
      }

      setTempAnnotation(tempAnnotation)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint) return

    // Get overlay position
    const rect = e.currentTarget.getBoundingClientRect()

    // Calculate position relative to the overlay
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentPoint({ x, y })

    // Update temporary annotation
    if (tempAnnotation && startPoint) {
      const minX = Math.min(startPoint.x, x)
      const maxX = Math.max(startPoint.x, x)
      const width = maxX - minX

      // For highlights, allow height adjustment
      if (tempAnnotation.type === "highlight") {
        const minY = Math.min(startPoint.y, y)
        const maxY = Math.max(startPoint.y, y)
        const height = maxY - minY

        setTempAnnotation({
          ...tempAnnotation,
          x: minX,
          y: minY,
          width: width,
          height: Math.max(20, height), // Minimum height of 20px
        })
      } else {
        // For underlines, keep the y position fixed at the start point
        setTempAnnotation({
          ...tempAnnotation,
          x: minX,
          y: startPoint.y,
          width: width,
        })
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !currentPoint) {
      setIsDrawing(false)
      setStartPoint(null)
      setCurrentPoint(null)
      setTempAnnotation(null)
      return
    }

    // Get overlay position
    const rect = e.currentTarget.getBoundingClientRect()

    // Calculate position relative to the overlay
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate dimensions
    const minX = Math.min(startPoint.x, x)
    const maxX = Math.max(startPoint.x, x)
    const width = maxX - minX

    // Only create annotation if there was an actual drag (width > 5px)
    if (width > 5) {
      // Store container dimensions for proper scaling when exporting
      const containerWidth = overlayRef.current?.offsetWidth || 0
      const containerHeight = overlayRef.current?.offsetHeight || 0

      if (currentTool === "highlight") {
        // For highlights, calculate height based on vertical drag
        const minY = Math.min(startPoint.y, y)
        const maxY = Math.max(startPoint.y, y)
        const height = Math.max(20, maxY - minY) // Minimum height of 20px

        const annotation: Annotation = {
          id: uuidv4(),
          type: currentTool,
          pageNumber,
          x: minX,
          y: minY,
          width,
          height,
          color: currentColor,
          containerWidth,
          containerHeight,
        }

        addAnnotation(annotation)
        console.log(`Added highlight annotation from (${minX}, ${minY}) with width ${width} and height ${height}`)
      } else {
        // For underlines, keep the y position fixed
        const annotation: Annotation = {
          id: uuidv4(),
          type: currentTool,
          pageNumber,
          x: minX,
          y: startPoint.y,
          width,
          height: 2,
          color: currentColor,
          containerWidth,
          containerHeight,
        }

        addAnnotation(annotation)
        console.log(`Added underline annotation from (${minX}, ${startPoint.y}) with width ${width}`)
      }
    }

    // Reset drawing state
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setTempAnnotation(null)
  }

  // Handle annotation click
  const handleAnnotationClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    if (currentTool === "none") {
      setSelectedAnnotation(id === selectedAnnotation ? null : id)
    }
  }

  // Handle annotation mouse down (for dragging)
  const handleAnnotationMouseDown = (e: React.MouseEvent, annotation: Annotation) => {
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
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
  }

  // Handle mouse move during drag
  const handleMouseMoveDrag = (e: MouseEvent) => {
    if (isDragging && selectedAnnotation) {
      const annotation = annotations.find((a) => a.id === selectedAnnotation)
      if (!annotation) return

      const overlay = overlayRef.current
      if (!overlay) return

      const rect = overlay.getBoundingClientRect()

      // Calculate new position, accounting for zoom and drag offset
      const newX = e.clientX - rect.left + (containerRef.current?.scrollLeft || 0) - dragOffset.x
      const newY = e.clientY - rect.top + (containerRef.current?.scrollTop || 0) - dragOffset.y

      // Update annotation position
      updateAnnotation({
        ...annotation,
        x: newX,
        y: newY,
      })
    }
  }

  // Handle mouse up after drag
  const handleMouseUpDrag = () => {
    setIsDragging(false)

    // Remove event listeners
    document.removeEventListener("mousemove", handleMouseMoveDrag)
    document.removeEventListener("mouseup", handleMouseUpDrag)
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

    const containerWidth = overlayRef.current?.offsetWidth || 0
    const containerHeight = overlayRef.current?.offsetHeight || 0

    const signature: Annotation = {
      id: uuidv4(),
      type: "signature",
      pageNumber,
      x: signaturePosition.x,
      y: signaturePosition.y,
      width: 200,
      height: 100,
      dataUrl,
      containerWidth,
      containerHeight,
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
        ref={overlayRef}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{
          zIndex: 10,
          cursor: currentTool === "highlight" || currentTool === "underline" ? "crosshair" : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Render temporary annotation during drawing */}
        {isDrawing && tempAnnotation && (
          <div
            className="absolute rounded-sm"
            style={{
              left: `${tempAnnotation.x}px`,
              top: `${tempAnnotation.y}px`,
              width: `${tempAnnotation.width || 0}px`,
              height: `${tempAnnotation.height || 0}px`,
              backgroundColor: tempAnnotation.type === "highlight" ? tempAnnotation.color || "#FFEB3B" : "transparent",
              borderBottom:
                tempAnnotation.type === "underline" ? `2px solid ${tempAnnotation.color || "#FFEB3B"}` : "none",
              opacity: tempAnnotation.type === "highlight" ? 0.5 : 1,
              pointerEvents: "none",
            }}
          />
        )}
        {/* Render annotations */}
        {pageAnnotations.map((annotation) => {
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
        <CommentDialog comment={selectedComment} isOpen={isCommentDialogOpen} onClose={handleCommentDialogClose} />
      )}
    </>
  )
}

