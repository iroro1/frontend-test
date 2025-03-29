"use client"

import { useState } from "react"

import { useEffect, useRef } from "react"
import WebViewer from "@pdftron/webviewer"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PDFViewerProps {
  file: File
  onReset: () => void
}

export default function PDFViewerWithWebViewer({ file, onReset }: PDFViewerProps) {
  const viewer = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPDF = async () => {
      if (!viewer.current) return

      try {
        setLoading(true)

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)

        // Initialize WebViewer
        const instance = await WebViewer(
          {
            path: "/webviewer/lib", // path to the WebViewer files on your server
            initialDoc: url,
            licenseKey: "YOUR_LICENSE_KEY", // Replace with your license key or use demo key
          },
          viewer.current,
        )

        const { documentViewer, annotationManager, Annotations } = instance.Core

        // Set up annotation tools
        instance.UI.setToolMode(instance.Core.Tools.ToolNames.HIGHLIGHT)

        // Enable all annotation tools
        instance.UI.enableFeatures([instance.UI.Feature.Annotations])

        // Add event listener for when the document is loaded
        documentViewer.addEventListener("documentLoaded", () => {
          setLoading(false)
        })

        // Clean up
        return () => {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error("Error loading PDF:", error)
        setLoading(false)
      }
    }

    loadPDF()
  }, [file])

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] rounded-lg border bg-white shadow-sm">
      <div className="flex w-full items-center justify-between border-b p-2">
        <Button variant="outline" onClick={onReset} className="gap-2" size="sm">
          Upload Different PDF
        </Button>
        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading PDF viewer...</span>
        </div>
      )}

      <div ref={viewer} className="webviewer w-full flex-1"></div>
    </div>
  )
}

