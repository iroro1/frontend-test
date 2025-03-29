"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  file: File
  onReset: () => void
}

export default function ReactPDFViewer({ file, onReset }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // Create a URL for the file
  useState(() => {
    const url = URL.createObjectURL(file)
    setFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] rounded-lg border bg-white shadow-sm">
      <div className="flex w-full items-center justify-between border-b p-2">
        <Button variant="outline" onClick={onReset} className="gap-2" size="sm">
          Upload Different PDF
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {pageNumber} of {numPages || "--"}
          </span>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={numPages === null || pageNumber >= numPages}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading PDF...</span>
          </div>
        )}

        {fileUrl && (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
          >
            <Page pageNumber={pageNumber} renderTextLayer={true} renderAnnotationLayer={true} scale={1.2} />
          </Document>
        )}
      </div>
    </div>
  )
}

