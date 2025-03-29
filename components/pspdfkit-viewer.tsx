"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PSPDFKitViewerProps {
  file: File
  onReset: () => void
}

export default function PSPDFKitViewer({ file, onReset }: PSPDFKitViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instance, setInstance] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let PSPDFKit: any
    let pdfInstance: any

    const loadPSPDFKit = async () => {
      try {
        setLoading(true)
        setError(null)

        // Import PSPDFKit dynamically
        PSPDFKit = await import("pspdfkit")

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)

        // Load the PDF document
        pdfInstance = await PSPDFKit.load({
          container: containerRef.current!,
          document: url,
          baseUrl: "/pspdfkit", // Path to the PSPDFKit assets on your server
          licenseKey: "YOUR_LICENSE_KEY", // Replace with your license key
          toolbarItems: [
            // Viewing
            { type: "zoom-out" },
            { type: "zoom-in" },
            { type: "zoom-mode" },
            { type: "spacer" },

            // Annotation tools
            { type: "highlighter" },
            { type: "ink" },
            { type: "text" },
            { type: "note" },
            { type: "stamp" },
            { type: "image" },
            { type: "signature" },
            { type: "spacer" },

            // Shapes
            { type: "rectangle" },
            { type: "ellipse" },
            { type: "line" },
            { type: "arrow" },
            { type: "polygon" },
            { type: "polyline" },
            { type: "spacer" },

            // Document editing
            { type: "document-editor" },
            { type: "document-crop" },
            { type: "spacer" },

            // Misc
            { type: "pan" },
            { type: "print" },
            { type: "search" },
          ],
          // Enable all annotation features
          enableAnnotationToolbar: true,
          // Enable commenting
          enableComments: true,
          // Enable form filling
          enableFormFilling: true,
          // Enable text selection
          enableTextSelection: true,
        })

        setInstance(pdfInstance)
        setLoading(false)
      } catch (err) {
        console.error("Error loading PSPDFKit:", err)
        setError("Failed to load the PDF viewer. Please try again or use a different file.")
        setLoading(false)
      }
    }

    loadPSPDFKit()

    // Clean up
    return () => {
      if (pdfInstance) {
        pdfInstance.unload()
      }
    }
  }, [file])

  const handleSaveAnnotations = async () => {
    if (!instance) return

    try {
      setSaving(true)

      // Get the PDF document with annotations
      const arrayBuffer = await instance.exportPDF()

      // Create a blob from the array buffer
      const blob = new Blob([arrayBuffer], { type: "application/pdf" })

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

      setSaving(false)
    } catch (err) {
      console.error("Error saving annotations:", err)
      setError("Failed to save annotations. Please try again.")
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] rounded-lg border bg-white shadow-sm">
      <div className="flex w-full items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset} className="gap-2" size="sm">
            <RefreshCcw className="h-4 w-4" />
            Upload Different PDF
          </Button>
          <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveAnnotations}
          className="gap-1 ml-2"
          disabled={saving || loading || !instance}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Save Annotated PDF
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <span className="text-sm font-medium">Loading PDF viewer...</span>
          </div>
        </div>
      )}

      <div ref={containerRef} className="flex-1 w-full" style={{ height: "calc(100vh - 200px)" }} />
    </div>
  )
}

