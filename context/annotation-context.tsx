"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Annotation {
  id: string
  type: "highlight" | "underline" | "comment" | "signature"
  pageNumber: number
  x: number
  y: number
  width?: number
  height?: number
  color?: string
  text?: string
  dataUrl?: string
  // Store the container dimensions for proper scaling when exporting
  containerWidth?: number
  containerHeight?: number
}

export type AnnotationTool = "highlight" | "underline" | "comment" | "signature"

interface AnnotationContextType {
  annotations: Annotation[]
  currentTool: AnnotationTool
  currentColor: string
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (annotation: Annotation) => void
  removeAnnotation: (id: string) => void
  clearAnnotations: () => void
  setCurrentTool: (tool: AnnotationTool) => void
  setCurrentColor: (color: string) => void
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined)

export function AnnotationProvider({ children }: { children: ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentTool, setCurrentTool] = useState<AnnotationTool>("highlight")
  const [currentColor, setCurrentColor] = useState<string>("#FFEB3B")

  const addAnnotation = (annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation])
  }

  const updateAnnotation = (annotation: Annotation) => {
    setAnnotations((prev) => prev.map((a) => (a.id === annotation.id ? annotation : a)))
  }

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }

  const clearAnnotations = () => {
    setAnnotations([])
  }

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
        currentTool,
        currentColor,
        addAnnotation,
        updateAnnotation,
        removeAnnotation,
        clearAnnotations,
        setCurrentTool,
        setCurrentColor,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  )
}

export function useAnnotation() {
  const context = useContext(AnnotationContext)
  if (context === undefined) {
    throw new Error("useAnnotation must be used within an AnnotationProvider")
  }
  return context
}

