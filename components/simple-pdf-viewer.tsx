"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw } from "lucide-react"

interface SimplePDFViewerProps {
  file: File
  onReset: () => void
}

export default function SimplePDFViewer({ file, onReset }: SimplePDFViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Create an object URL for the PDF file
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo("Creating object URL for file...")

      // Create a URL for the file
      const url = URL.createObjectURL(file)
      setObjectUrl(url)
      setDebugInfo((prev) => prev + "\nObject URL created successfully: " + url.substring(0, 30) + "...")
      setLoading(false)

      // Clean up the URL when the component unmounts
      return () => {
        if (url) {
          URL.revokeObjectURL(url)
          setDebugInfo((prev) => prev + "\nObject URL revoked")
        }
      }
    } catch (err) {
      console.error("Error creating object URL:", err)
      setDebugInfo((prev) => prev + "\nError creating object URL: " + String(err))
      setError("Failed to load the PDF. Please try a different file.")
      setLoading(false)
    }
  }, [file])

  // Handle iframe load error
  const handleIframeError = () => {
    setError("Failed to render the PDF. Please try a different file.")
    setDebugInfo((prev) => prev + "\nIframe error event triggered")
    setLoading(false)
  }

  // Handle iframe load success
  const handleIframeLoad = () => {
    setDebugInfo((prev) => prev + "\nIframe loaded successfully")
    setLoading(false)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-white">
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
            <div className="mt-4 p-4 bg-gray-100 rounded-md w-full max-w-2xl">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[200px]">{debugInfo}</pre>
            </div>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src={objectUrl || ""}
              className="h-full w-full"
              onError={handleIframeError}
              onLoad={handleIframeLoad}
              title="PDF Viewer"
            />
            <div className="absolute bottom-4 right-4 p-2 bg-white rounded-md border shadow-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const debugDiv = document.createElement("div")
                  debugDiv.className = "fixed inset-0 bg-white z-50 p-4 overflow-auto"
                  debugDiv.innerHTML = `
                    <h2 class="text-lg font-bold mb-2">Debug Information</h2>
                    <pre class="text-xs">${debugInfo}</pre>
                    <button class="mt-4 px-4 py-2 bg-gray-200 rounded" onclick="this.parentNode.remove()">Close</button>
                  `
                  document.body.appendChild(debugDiv)
                }}
              >
                Show Debug Info
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

