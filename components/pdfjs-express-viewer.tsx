"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw, Bug } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PDFJSExpressViewerProps {
  file: File
  onReset: () => void
}

export default function PDFJSExpressViewer({ file, onReset }: PDFJSExpressViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instance, setInstance] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [showDebug, setShowDebug] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let WebViewer: any
    let viewer: any

    const loadPDFJSExpress = async () => {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo("Starting to load PDF.js Express...\n")

        // Check if container exists
        if (!containerRef.current) {
          throw new Error("Container reference is not available")
        }
        setDebugInfo((prev) => prev + "Container reference is available\n")

        // Create a URL for the file
        const fileUrl = URL.createObjectURL(file)
        setDebugInfo((prev) => prev + `Created URL for file: ${file.name}\n`)

        // Import WebViewer dynamically
        try {
          setDebugInfo((prev) => prev + "Importing WebViewer...\n")
          // Try using the CommonJS import
          const PDFJSExpress = await import("@pdftron/pdfjs-express")
          WebViewer = PDFJSExpress.default
          setDebugInfo((prev) => prev + "WebViewer imported successfully\n")
        } catch (importError) {
          setDebugInfo((prev) => prev + `Error importing WebViewer: ${importError}\n`)

          // Try alternative import method
          try {
            setDebugInfo((prev) => prev + "Trying alternative import method...\n")
            // @ts-ignore
            WebViewer = window.PDFJSExpress?.WebViewer
            if (!WebViewer) {
              throw new Error("WebViewer not found in window object")
            }
            setDebugInfo((prev) => prev + "WebViewer found in window object\n")
          } catch (windowError) {
            setDebugInfo((prev) => prev + `Error with window object: ${windowError}\n`)
            throw new Error(`Failed to import WebViewer: ${importError}`)
          }
        }

        // Initialize WebViewer
        try {
          setDebugInfo((prev) => prev + "Initializing WebViewer...\n")
          viewer = await WebViewer(
            {
              path: "/pdfjs-express", // Path to the PDF.js Express assets
              initialDoc: fileUrl,
              // Use demo license key for testing
              licenseKey: "demo:1692639803252:7aae243e03000000006caed2b3d1d8e0b2e3c9f1c6c0c3b0c7",
              enableAnnotations: true,
            },
            containerRef.current,
          )
          setDebugInfo((prev) => prev + "WebViewer initialized successfully\n")
        } catch (initError) {
          setDebugInfo((prev) => prev + `Error initializing WebViewer: ${initError}\n`)
          throw new Error(`Failed to initialize WebViewer: ${initError}`)
        }

        // Get the instance
        const { Core, UI } = viewer
        setDebugInfo((prev) => prev + "Got Core and UI from viewer\n")

        // Add event listener for when the document is loaded
        Core.documentViewer.addEventListener("documentLoaded", () => {
          setDebugInfo((prev) => prev + "Document loaded successfully\n")
          setLoading(false)
        })

        // Add event listener for errors
        Core.documentViewer.addEventListener("documentLoadingFailed", (error: any) => {
          setDebugInfo((prev) => prev + `Document loading failed: ${error}\n`)
          setError(`Failed to load document: ${error}`)
          setLoading(false)
        })

        // Store the instance
        setInstance(viewer)
        setDebugInfo((prev) => prev + "Viewer instance stored\n")
      } catch (err) {
        console.error("Error loading PDF.js Express:", err)
        setDebugInfo((prev) => prev + `Caught error: ${err}\n`)
        setError(`Failed to load the PDF viewer: ${err}`)
        setLoading(false)
      }
    }

    loadPDFJSExpress()

    // Clean up
    return () => {
      if (viewer) {
        try {
          viewer.dispose()
          setDebugInfo((prev) => prev + "Viewer disposed\n")
        } catch (disposeError) {
          setDebugInfo((prev) => prev + `Error disposing viewer: ${disposeError}\n`)
        }
      }
    }
  }, [file])

  const handleSaveAnnotations = async () => {
    if (!instance) return

    try {
      setSaving(true)

      const { Core } = instance
      const documentViewer = Core.documentViewer
      const annotationManager = documentViewer.getAnnotationManager()

      // Get the PDF document with annotations
      const doc = documentViewer.getDocument()
      const xfdfString = await annotationManager.exportAnnotations()
      const options = { xfdfString }
      const data = await doc.getFileData(options)
      const arr = new Uint8Array(data)

      // Create a blob from the array buffer
      const blob = new Blob([arr], { type: "application/pdf" })

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

        <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="gap-1 ml-2">
          <Bug className="h-4 w-4" />
          {showDebug ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showDebug && (
        <div className="m-4 p-4 bg-gray-100 rounded-md overflow-auto max-h-[200px]">
          <h3 className="font-medium mb-2">Debug Information:</h3>
          <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
        </div>
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

