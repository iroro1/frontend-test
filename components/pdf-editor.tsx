"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Loader2, RefreshCcw, Save, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAnnotation } from "@/context/annotation-context"
import { v4 as uuidv4 } from "uuid"
import { SignatureCanvas } from "@/components/signature-canvas"
import { CommentDialog } from "@/components/comment-dialog"
import { PDFDocument } from "pdf-lib"

interface PDFEditorProps {
  file: File
  onReset: () => void
}

export default function PDFEditor({ file, onReset }: PDFEditorProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [signaturePosition, setSignaturePosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedComment, setSelectedComment] = useState<any>(null)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [clickCoordinates, setClickCoordinates] = useState<{ x: number; y: number } | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const {
    currentTool,
    currentColor,
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    clearAnnotations,
  } = useAnnotation()

  // Load the PDF file
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true)
        setError(null)

        // Read the file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()

        // Save the PDF bytes for later use
        setPdfBytes(new Uint8Array(arrayBuffer))

        // Create a URL for the PDF
        const blob = new Blob([arrayBuffer], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        setObjectUrl(url)

        // Try to determine total pages
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          setTotalPages(pdfDoc.getPageCount())
        } catch (err) {
          console.error("Error getting page count:", err)
          setTotalPages(1) // Default to 1 if we can't determine
        }

        setLoading(false)
      } catch (err) {
        console.error("Error loading PDF:", err)
        setError("Failed to load the PDF. Please try a different file.")
        setLoading(false)
      }
    }

    loadPdf()

    // Clean up
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [file])

  // Handle iframe load
  const handleIframeLoad = () => {
    setLoading(false)

    // Disable scrolling in the iframe and make PDF fit the container
    try {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        const iframeDocument = iframeRef.current.contentDocument
        const style = iframeDocument.createElement("style")
        style.textContent = `
          html, body {
            overflow: hidden !important;
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
          }
          /* Make PDF fit the container */
          .pdfViewer .page {
            margin: 0 auto !important;
            border: none !important;
          }
        `
        iframeDocument.head.appendChild(style)
        console.log("Scrolling disabled in iframe")
      }
    } catch (err) {
      console.error("Error disabling scroll:", err)
    }
  }

  // Handle iframe error
  const handleIframeError = () => {
    console.error("Failed to load PDF in iframe")
    setError("Failed to display the PDF. Please try a different file.")
  }

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool === "none" || isPreviewMode) return

    // Get overlay position
    const rect = e.currentTarget.getBoundingClientRect()

    // Calculate position relative to the overlay, accounting for scroll
    const x = e.clientX - rect.left + containerRef.current!.scrollLeft
    const y = e.clientY - rect.top + containerRef.current!.scrollTop

    setClickCoordinates({ x, y })

    console.log(`Clicked at x: ${x}, y: ${y} with tool: ${currentTool}`)
    console.log(`Container scroll: left=${containerRef.current?.scrollLeft}, top=${containerRef.current?.scrollTop}`)
    console.log(`Container dimensions: width=${rect.width}, height=${rect.height}`)
    console.log(
      `Scroll dimensions: width=${containerRef.current?.scrollWidth}, height=${containerRef.current?.scrollHeight}`,
    )

    // For signature tool, show the signature canvas
    if (currentTool === "signature") {
      setSignaturePosition({ x, y })
      setShowSignatureCanvas(true)
      return
    }

    // For comment tool, open the comment dialog
    if (currentTool === "comment") {
      // Get container dimensions for proper scaling
      const container = {
        width: rect.width,
        height: rect.height,
        scrollWidth: containerRef.current?.scrollWidth || rect.width,
        scrollHeight: containerRef.current?.scrollHeight || rect.height,
      }

      const newComment = {
        id: uuidv4(),
        type: "comment",
        pageNumber: currentPage,
        x,
        y,
        text: "",
        color: currentColor,
        container: container,
      }

      addAnnotation(newComment)
      setSelectedComment(newComment)
      setIsCommentDialogOpen(true)
      return
    }

    // For highlight or underline
    if (currentTool === "highlight" || currentTool === "underline") {
      const width = 100 // Default width
      const height = currentTool === "highlight" ? 20 : 3 // Default height

      // Get container dimensions for proper scaling
      const container = {
        width: rect.width,
        height: rect.height,
        scrollWidth: containerRef.current?.scrollWidth || rect.width,
        scrollHeight: containerRef.current?.scrollHeight || rect.height,
      }

      const annotation = {
        id: uuidv4(),
        type: currentTool,
        pageNumber: currentPage,
        x,
        y,
        width,
        height,
        color: currentColor,
        container: container,
      }

      addAnnotation(annotation)
      console.log(`Added ${currentTool} annotation:`, annotation)
    }
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
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
  }

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && selectedAnnotation) {
      const annotation = annotations.find((a) => a.id === selectedAnnotation)
      if (!annotation) return

      const overlay = overlayRef.current
      if (!overlay) return

      const rect = overlay.getBoundingClientRect()

      // Calculate new position, accounting for scroll and drag offset
      const newX = e.clientX - rect.left + containerRef.current!.scrollLeft - dragOffset.x
      const newY = e.clientY - rect.top + containerRef.current!.scrollTop - dragOffset.y

      // Update annotation position
      updateAnnotation({
        ...annotation,
        x: newX,
        y: newY,
      })
    }
  }

  // Handle mouse up after drag
  const handleMouseUp = () => {
    setIsDragging(false)

    // Remove event listeners
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // Handle delete annotation
  const handleDeleteAnnotation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeAnnotation(id)
    setSelectedAnnotation(null)
  }

  // Handle signature save
  const handleSignatureSave = (dataUrl: string) => {
    if (!signaturePosition || !overlayRef.current) return

    const rect = overlayRef.current.getBoundingClientRect()

    const signature = {
      id: uuidv4(),
      type: "signature",
      pageNumber: currentPage,
      x: signaturePosition.x,
      y: signaturePosition.y,
      width: 200,
      height: 100,
      dataUrl,
      container: {
        width: rect.width,
        height: rect.height,
        scrollWidth: containerRef.current?.scrollWidth || rect.width,
        scrollHeight: containerRef.current?.scrollHeight || rect.height,
      },
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

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    setSelectedAnnotation(null)

    // Update the iframe src to show the specific page
    if (iframeRef.current && objectUrl) {
      iframeRef.current.src = `${objectUrl}#page=${newPage}`
    }

    // Reset scroll position when page changes
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
      containerRef.current.scrollLeft = 0
    }
  }

  // Generate annotated PDF
  const generateAnnotatedPdf = async () => {
    if (!pdfBytes) return null

    try {
      // Load the PDF with pdf-lib for modification
      const pdfDoc = await PDFDocument.load(pdfBytes)

      // Get all pages
      const pages = pdfDoc.getPages()

      // Group annotations by page
      const annotationsByPage = annotations.reduce(
        (acc, annotation) => {
          const pageIndex = annotation.pageNumber - 1
          if (!acc[pageIndex]) {
            acc[pageIndex] = []
          }
          acc[pageIndex].push(annotation)
          return acc
        },
        {} as Record<number, any[]>,
      )

      // Process annotations for each page
      for (const [pageIndexStr, pageAnnotations] of Object.entries(annotationsByPage)) {
        const pageIndex = Number.parseInt(pageIndexStr)
        const page = pages[pageIndex]

        if (!page) continue

        // Get page dimensions
        const { width: pageWidth, height: pageHeight } = page.getSize()

        // Process each annotation
        for (const annotation of pageAnnotations) {
          try {
            // Get container dimensions from annotation
            const container = annotation.container || { width: 800, height: 600, scrollWidth: 800, scrollHeight: 600 }

            // Calculate scaling factors based on page dimensions and container
            const scaleX = pageWidth / container.scrollWidth
            const scaleY = pageHeight / container.scrollHeight

            // Calculate PDF coordinates (flip Y coordinate since PDF origin is bottom-left)
            const pdfX = annotation.x * scaleX
            const pdfY = pageHeight - annotation.y * scaleY

            // Convert color from hex to RGB
            const color = annotation.color || "#FFEB3B"
            const r = Number.parseInt(color.slice(1, 3), 16) / 255
            const g = Number.parseInt(color.slice(3, 5), 16) / 255
            const b = Number.parseInt(color.slice(5, 7), 16) / 255

            if (annotation.type === "highlight") {
              const width = (annotation.width || 100) * scaleX
              const height = (annotation.height || 20) * scaleY

              // Draw highlight rectangle
              page.drawRectangle({
                x: pdfX,
                y: pdfY - height, // Adjust for height
                width: width,
                height: height,
                color: { r, g, b },
                opacity: 0.3,
              })
            } else if (annotation.type === "underline") {
              const width = (annotation.width || 100) * scaleX

              // Draw underline
              page.drawLine({
                start: { x: pdfX, y: pdfY },
                end: { x: pdfX + width, y: pdfY },
                thickness: 2,
                color: { r, g, b },
              })
            } else if (annotation.type === "comment") {
              // Draw comment circle
              page.drawCircle({
                x: pdfX,
                y: pdfY,
                size: 10 * scaleX,
                color: { r, g, b },
              })

              // Add text
              if (annotation.text) {
                const font = await pdfDoc.embedFont("Helvetica")
                page.drawText(annotation.text, {
                  x: pdfX + 15 * scaleX,
                  y: pdfY,
                  size: 10 * scaleX,
                  font,
                  color: { r: 0, g: 0, b: 0 },
                  maxWidth: 200 * scaleX,
                })
              }
            } else if (annotation.type === "signature" && annotation.dataUrl) {
              try {
                // Convert data URL to bytes
                const base64Data = annotation.dataUrl.split(",")[1]
                if (!base64Data) continue

                const signatureImageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

                // Embed the image in the PDF
                const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

                const width = (annotation.width || 200) * scaleX
                const height = (annotation.height || 100) * scaleY

                // Draw the signature image
                page.drawImage(signatureImage, {
                  x: pdfX,
                  y: pdfY - height, // Adjust for height
                  width: width,
                  height: height,
                })
              } catch (signatureError) {
                console.error("Error embedding signature:", signatureError)
              }
            }
          } catch (annotationError) {
            console.error("Error processing annotation:", annotationError)
          }
        }
      }

      // Save the PDF
      return await pdfDoc.save()
    } catch (error) {
      console.error("Error generating annotated PDF:", error)
      return null
    }
  }

  // Generate preview
  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true)

    // Clean up previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    const annotatedPdfBytes = await generateAnnotatedPdf()

    if (annotatedPdfBytes) {
      // Create a blob from the PDF bytes
      const blob = new Blob([annotatedPdfBytes], { type: "application/pdf" })

      // Create a URL for the blob
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setIsPreviewMode(true)
    } else {
      alert("Failed to generate preview. Please try again.")
    }

    setIsGeneratingPreview(false)
  }

  // Exit preview mode
  const handleExitPreview = () => {
    setIsPreviewMode(false)
  }

  // Export the PDF with annotations
  const handleExportPdf = async () => {
    setIsSaving(true)

    const annotatedPdfBytes = await generateAnnotatedPdf()

    if (annotatedPdfBytes) {
      // Create a blob from the PDF bytes
      const blob = new Blob([annotatedPdfBytes], { type: "application/pdf" })

      // Create a URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a link element
      const link = document.createElement("a")
      link.href = url
      link.download = `annotated-${file.name}`

      // Append the link to the body
      document.body.appendChild(link)

      // Click the link
      link.click()

      // Remove the link
      document.body.removeChild(link)

      // Revoke the URL
      URL.revokeObjectURL(url)
    } else {
      alert("Failed to export the PDF. Please try again.")
    }

    setIsSaving(false)
  }

  // Render annotations
  const renderAnnotations = () => {
    if (isPreviewMode) return null

    // Only show annotations for the current page
    const pageAnnotations = annotations.filter((a) => a.pageNumber === currentPage)

    return pageAnnotations.map((annotation) => {
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
            title={annotation.text || "Highlight"}
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
              height: "3px",
              backgroundColor: annotation.color || "#FFEB3B",
              pointerEvents: "auto",
              cursor: currentTool === "none" ? "move" : "default",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              zIndex: isSelected ? 60 : 50,
            }}
            title={annotation.text || "Underline"}
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
            title={annotation.text || "Comment"}
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
            title="Signature"
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
    })
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="flex w-full items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset} className="gap-2" size="sm">
            <RefreshCcw className="h-4 w-4" />
            Upload Different PDF
          </Button>
          <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewMode ? (
            <Button variant="outline" size="sm" onClick={handleExitPreview}>
              Exit Preview
            </Button>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mr-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePreview}
                className="gap-1 ml-2"
                disabled={isGeneratingPreview || loading || annotations.length === 0}
              >
                {isGeneratingPreview ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="gap-1 ml-2"
            disabled={isSaving || loading || annotations.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="relative h-[calc(100vh-200px)] w-full overflow-hidden">
        {(loading || isSaving || isGeneratingPreview) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm font-medium">
                {loading ? "Loading PDF..." : isGeneratingPreview ? "Generating Preview..." : "Saving PDF..."}
              </span>
            </div>
          </div>
        )}

        {error ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <div className="text-red-500">{error}</div>
            <Button onClick={onReset} variant="outline">
              Go Back to Upload
            </Button>
          </div>
        ) : isPreviewMode && previewUrl ? (
          <iframe src={previewUrl} className="w-full h-full border-0" title="PDF Preview" />
        ) : (
          <div className="relative w-full h-full">
            <iframe
              ref={iframeRef}
              src={objectUrl ? `${objectUrl}#page=${currentPage}` : ""}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="PDF Editor"
              style={{ pointerEvents: currentTool === "none" ? "auto" : "none" }}
            />

            {/* Transparent overlay for capturing clicks */}
            <div
              ref={overlayRef}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              onClick={handleOverlayClick}
              style={{
                backgroundColor: currentTool !== "none" ? "rgba(0,0,0,0.01)" : "transparent",
                pointerEvents: currentTool !== "none" ? "auto" : "none",
              }}
            >
              {/* Render annotations */}
              {renderAnnotations()}

              {/* Show click indicator for debugging */}
              {clickCoordinates && (
                <div
                  className="absolute w-6 h-6 rounded-full border-2 border-red-500 animate-ping"
                  style={{
                    left: `${clickCoordinates.x}px`,
                    top: `${clickCoordinates.y}px`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 100,
                  }}
                />
              )}
            </div>
          </div>
        )}

        {showSignatureCanvas && signaturePosition && (
          <SignatureCanvas
            position={signaturePosition}
            onSave={handleSignatureSave}
            onCancel={handleSignatureCancel}
            color={currentColor}
          />
        )}
      </div>

      {isCommentDialogOpen && selectedComment && (
        <CommentDialog comment={selectedComment} isOpen={isCommentDialogOpen} onClose={handleCommentDialogClose} />
      )}

      {/* Tool indicator */}
      {currentTool !== "none" && !isPreviewMode && (
        <div className="fixed bottom-4 left-4 bg-white rounded-full shadow-lg px-4 py-2 z-50 border border-primary">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentColor }} />
            <span className="font-medium capitalize">{currentTool} Tool Active</span>
          </div>
        </div>
      )}

      {/* Selection mode indicator */}
      {currentTool === "none" && !isPreviewMode && (
        <div className="fixed bottom-4 left-4 bg-white rounded-full shadow-lg px-4 py-2 z-50 border border-primary">
          <div className="flex items-center gap-2">
            <span className="font-medium">Selection Mode: Click and drag annotations to move them</span>
          </div>
        </div>
      )}
    </div>
  )
}

