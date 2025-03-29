import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import type { Annotation } from "@/context/annotation-context"

export async function exportAnnotatedPdf(file: File, annotations: Annotation[]) {
  try {
    console.log("Starting PDF export with", annotations.length, "annotations")

    // Read the file as an ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer()

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(fileArrayBuffer)
    console.log("PDF loaded successfully with", pdfDoc.getPageCount(), "pages")

    // Get the pages
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
      {} as Record<number, Annotation[]>,
    )

    // Process annotations for each page
    for (const [pageIndexStr, pageAnnotations] of Object.entries(annotationsByPage)) {
      const pageIndex = Number.parseInt(pageIndexStr)
      const page = pages[pageIndex]

      if (!page) {
        console.warn(`Page ${pageIndex + 1} not found in PDF`)
        continue
      }

      // Get page dimensions
      const { width: pageWidth, height: pageHeight } = page.getSize()
      console.log(`Processing page ${pageIndex + 1} (${pageWidth}x${pageHeight})`)

      // Process each annotation
      for (const annotation of pageAnnotations) {
        try {
          // Get container dimensions from annotation
          const containerWidth = annotation.containerWidth || 612 // Default to standard PDF width
          const containerHeight = annotation.containerHeight || 792 // Default to standard PDF height

          // Calculate scaling factors based on page dimensions and container
          const scaleX = pageWidth / containerWidth
          const scaleY = pageHeight / containerHeight

          // Calculate PDF coordinates (flip Y coordinate since PDF origin is bottom-left)
          const pdfX = annotation.x * scaleX
          const pdfY = pageHeight - annotation.y * scaleY

          console.log(`Adding ${annotation.type} at (${pdfX}, ${pdfY}) with scale (${scaleX}, ${scaleY})`)

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
              color: rgb(r, g, b),
              opacity: 0.3,
            })
          } else if (annotation.type === "underline") {
            const width = (annotation.width || 100) * scaleX

            // Draw underline
            page.drawLine({
              start: { x: pdfX, y: pdfY },
              end: { x: pdfX + width, y: pdfY },
              thickness: 2,
              color: rgb(r, g, b),
            })
          } else if (annotation.type === "comment") {
            // Draw comment circle
            page.drawCircle({
              x: pdfX,
              y: pdfY,
              size: 10 * scaleX,
              color: rgb(r, g, b),
            })

            // Add text
            if (annotation.text) {
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
              page.drawText(annotation.text, {
                x: pdfX + 15 * scaleX,
                y: pdfY,
                size: 10 * scaleX,
                font,
                color: rgb(0, 0, 0),
                maxWidth: 200 * scaleX,
              })
            }
          } else if (annotation.type === "signature" && annotation.dataUrl) {
            try {
              // Convert data URL to bytes
              const base64Data = annotation.dataUrl.split(",")[1]
              if (!base64Data) {
                console.warn("Invalid signature data URL")
                continue
              }

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
    console.log("Saving PDF...")
    const pdfBytes = await pdfDoc.save()
    console.log("PDF export completed successfully")

    return pdfBytes
  } catch (error) {
    console.error("Error exporting PDF:", error)
    throw error
  }
}

