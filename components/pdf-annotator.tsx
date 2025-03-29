"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw, Save, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnnotationToolbar } from "@/components/annotation-toolbar"
import { AnnotationOverlay } from "@/components/annotation-overlay"
import { AnnotationSidebar } from "@/components/annotation-sidebar"
import { useAnnotation } from "@/context/annotation-context"
import { exportAnnotatedPdf } from "@/lib/pdf-export"

interface PDFAnnotatorProps {
  file: File
  onReset: () => void
}

export function PDFAnnotator({ file, onReset }: PDFAnnotatorProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { annotations } = useAnnotation()

  // Create an object URL for the PDF file
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)
      console.log("Creating object URL for file:", file.name)

      // Create a URL for the file
      const url = URL.createObjectURL(file)
      // Make sure the URL doesn't already have a hash
      const cleanUrl = url.split("#")[0]
      setObjectUrl(cleanUrl)
      console.log("Object URL created successfully:", cleanUrl)

      // Clean up the URL when the component unmounts
      return () => {
        if (cleanUrl) {
          URL.revokeObjectURL(cleanUrl)
          console.log("Object URL revoked")
        }
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
      }
    } catch (err) {
      console.error("Error creating object URL:", err)
      setError("Failed to load the PDF. Please try a different file.")
      setLoading(false)
    }
  }, [file])

  // Estimate total pages when PDF loads
  const handleIframeLoad = () => {
    setLoading(false)
    // Estimate total pages - this is a rough estimate
    // In a real app, you'd use a PDF.js library to get the exact count
    setTotalPages(Math.max(5, currentPage + 4))
    console.log("PDF loaded successfully")

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
      /* Force PDF.js to use page-fit mode */
      #viewer.pdfViewer {
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
      }
      .pdfViewer .page {
        max-width: 100% !important;
        max-height: 100% !important;
        transform-origin: top center !important;
      }
      /* Disable all scrolling */
      * {
        overflow: hidden !important;
        scrollbar-width: none !important;
      }
      *::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }
    `
        iframeDocument.head.appendChild(style)

        // Add script to force page-fit mode and disable scrolling
        const script = iframeDocument.createElement("script")
        script.textContent = `
      setTimeout(() => {
        if (window.PDFViewerApplication) {
          // Set page fit mode to show the entire page
          window.PDFViewerApplication.pdfViewer.currentScaleValue = 'page-fit';
          
          // Disable scrolling
          document.addEventListener('wheel', function(e) {
            e.preventDefault();
          }, { passive: false });
          
          document.addEventListener('touchmove', function(e) {
            e.preventDefault();
          }, { passive: false });
          
          // Disable keyboard navigation
          document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                e.key === 'PageUp' || e.key === 'PageDown' ||
                e.key === 'Home' || e.key === 'End') {
              e.preventDefault();
            }
          });
        }
      }, 100);
    `
        iframeDocument.body.appendChild(script)

        console.log("Scrolling disabled and page-fit mode enabled in iframe")
      }
    } catch (err) {
      console.error("Error configuring iframe:", err)
    }
  }

  // Handle iframe load error
  const handleIframeError = () => {
    console.error("Failed to load PDF in iframe")
    setError("Failed to display the PDF. Please try a different file.")
    setLoading(false)
  }

  // Handle page navigation
  const changePage = (delta: number) => {
    const newPage = currentPage + delta
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)

      // Update the iframe src to show the specific page
      if (iframeRef.current && objectUrl) {
        // Add a timestamp parameter to force iframe refresh
        const timestamp = new Date().getTime()

        // Create a completely new URL to force refresh
        const newSrc = `${objectUrl}#page=${newPage}&timestamp=${timestamp}`
        console.log(`Changing to page ${newPage} with src: ${newSrc}`)

        // Set the iframe src
        iframeRef.current.src = newSrc

        // Force a reload of the iframe
        setTimeout(() => {
          if (iframeRef.current) {
            const currentSrc = iframeRef.current.src
            iframeRef.current.src = ""
            iframeRef.current.src = currentSrc
          }
        }, 50)

        // Reset scroll position when page changes
        if (containerRef.current) {
          containerRef.current.scrollTop = 0
          containerRef.current.scrollLeft = 0
        }

        console.log(`Changed to page ${newPage}`)
      }
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

    try {
      console.log(`Generating preview with ${annotations.length} annotations`)
      const annotatedPdfBytes = await exportAnnotatedPdf(file, annotations)

      if (annotatedPdfBytes) {
        // Create a blob from the PDF bytes
        const blob = new Blob([annotatedPdfBytes], { type: "application/pdf" })

        // Create a URL for the blob
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setIsPreviewMode(true)
        console.log("Preview generated successfully")
      } else {
        setError("Failed to generate preview. Please try again.")
        console.error("Failed to generate preview - no bytes returned")
      }
    } catch (err) {
      console.error("Error generating preview:", err)
      setError("Failed to generate preview. Please try again.")
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  // Exit preview mode
  const handleExitPreview = () => {
    setIsPreviewMode(false)
  }

  // Export the PDF with annotations
  const handleExportPdf = async () => {
    setIsSaving(true)

    try {
      console.log(`Exporting PDF with ${annotations.length} annotations`)
      const annotatedPdfBytes = await exportAnnotatedPdf(file, annotations)

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
        console.log("PDF exported successfully")
      } else {
        setError("Failed to export the PDF. Please try again.")
        console.error("Failed to export PDF - no bytes returned")
      }
    } catch (err) {
      console.error("Error exporting PDF:", err)
      setError("Failed to export the PDF. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Disable keyboard navigation and scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only allow keyboard navigation through our custom handlers
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "PageDown" ||
        e.key === "PageUp" ||
        e.key === "Home" ||
        e.key === "End"
      ) {
        e.preventDefault()

        if (e.key === "ArrowRight" || e.key === "PageDown") {
          changePage(1)
        } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
          changePage(-1)
        }
      }
    }

    // Prevent scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("wheel", handleWheel)
    }
  }, [currentPage, totalPages]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr_250px] gap-6">
      <AnnotationToolbar />
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

        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          ref={containerRef}
          className="relative h-[calc(100vh-150px)] w-full overflow-hidden"
          onWheel={(e) => e.preventDefault()}
        >
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

          {isPreviewMode && previewUrl ? (
            <iframe
              src={previewUrl ? `${previewUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0` : ""}
              className="w-full h-full border-0"
              title="PDF Preview"
              style={{ border: "none", background: "white" }}
              scrolling="no"
            />
          ) : (
            <div className="relative w-full h-full">
              <iframe
                ref={iframeRef}
                src={
                  objectUrl
                    ? `${objectUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitV&timestamp=${new Date().getTime()}`
                    : ""
                }
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="PDF Editor"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "white",
                }}
                scrolling="no"
              />

              {/* Annotation overlay */}
              <AnnotationOverlay containerRef={containerRef} pageNumber={currentPage} />
            </div>
          )}
        </div>
      </div>
      <AnnotationSidebar currentPage={currentPage} />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 z-50 border border-primary">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => changePage(-1)} disabled={currentPage <= 1 || loading}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(1)}
            disabled={currentPage >= totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

