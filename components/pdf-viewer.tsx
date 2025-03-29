"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFViewerProps {
  file: File
  onReset: () => void
}

export default function PDFViewer({ file, onReset }: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Create an object URL for the PDF file
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      // Create a URL for the file
      const url = URL.createObjectURL(file)
      setObjectUrl(url)
      setLoading(false)

      // Clean up the URL when the component unmounts
      return () => {
        if (url) URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Error creating object URL:", err)
      setError("Failed to load the PDF. Please try a different file.")
      setLoading(false)
    }
  }, [file])

  // Handle iframe load error
  const handleIframeError = () => {
    setError("Failed to render the PDF. Please try a different file.")
    setLoading(false)
  }

  // Handle iframe load success
  const handleIframeLoad = () => {
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center overflow-hidden rounded-lg border bg-white">
      <div className="flex w-full items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Upload Different PDF
          </Button>
        </div>
      </div>

      <div className="relative h-[calc(100vh-200px)] w-full">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <div className="text-red-500">{error}</div>
            <Button onClick={onReset} variant="outline">
              Go Back to Upload
            </Button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={objectUrl || ""}
            className="h-full w-full"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            title="PDF Viewer"
          />
        )}
      </div>
    </div>
  )
}

