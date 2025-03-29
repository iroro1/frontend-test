"use client"

import { useCallback, useState } from "react"
import { FileUp, Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface PDFUploaderProps {
  onFileSelected: (file: File) => void
}

export function PDFUploader({ onFileSelected }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]

        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          setSelectedFile(file)

          // Simulate upload progress
          let progress = 0
          const interval = setInterval(() => {
            progress += 5
            setUploadProgress(progress)

            if (progress >= 100) {
              clearInterval(interval)
              setTimeout(() => {
                onFileSelected(file)
              }, 500)
            }
          }, 50)
        } else {
          setError("Please upload a PDF file")
        }
      }
    },
    [onFileSelected],
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      } bg-white shadow-sm`}
    >
      <input {...getInputProps()} />

      {selectedFile ? (
        <div className="flex w-full max-w-md flex-col items-center">
          <div className="mb-4 flex items-center gap-2 text-lg font-medium">
            <FileUp className="h-6 w-6 text-primary" />
            <span className="truncate">{selectedFile.name}</span>
          </div>
          <Progress value={uploadProgress} className="h-2 w-full" />
          <p className="mt-2 text-sm text-muted-foreground">
            {uploadProgress < 100 ? "Uploading..." : "Processing PDF..."}
          </p>
        </div>
      ) : (
        <>
          <FileUp className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Upload your PDF document</h2>
          <p className="mb-6 text-sm text-muted-foreground">Drag and drop your file here, or click the button below</p>
          <Button onClick={open} className="gap-2">
            <Upload className="h-4 w-4" />
            Select PDF
          </Button>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </>
      )}
    </div>
  )
}

