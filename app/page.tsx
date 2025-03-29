"use client"

import { useState } from "react"
import { PDFUploader } from "@/components/pdf-uploader"
import { PDFAnnotator } from "@/components/pdf-annotator"
import { AnnotationProvider } from "@/context/annotation-context"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelected = (file: File) => {
    setFile(file)
  }

  const handleReset = () => {
    setFile(null)
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white p-4 shadow-sm">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">PDF Annotator</h1>
        </div>
      </header>

      <div className="container mx-auto flex-1 py-6">
        {!file ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-2xl font-semibold">PDF Annotation Tool</h2>
              <p className="mb-4 text-muted-foreground">
                Upload a PDF document to annotate it with highlights, comments, underlines, and signatures.
              </p>
            </div>
            <PDFUploader onFileSelected={handleFileSelected} />
          </div>
        ) : (
          <AnnotationProvider>
            <PDFAnnotator file={file} onReset={handleReset} />
          </AnnotationProvider>
        )}
      </div>
    </main>
  )
}

