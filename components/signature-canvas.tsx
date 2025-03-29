"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface SignatureCanvasProps {
  position: { x: number; y: number }
  onSave: (dataUrl: string) => void
  onCancel: () => void
  color: string
}

export function SignatureCanvas({ position, onSave, onCancel, color }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 200

    // Clear canvas
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Set drawing style
    context.strokeStyle = color
    context.lineWidth = 2
    context.lineCap = "round"
    context.lineJoin = "round"
  }, [color])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    context.lineTo(x, y)
    context.stroke()
    setHasDrawn(true)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")
    onSave(dataUrl)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Reset drawing style
    context.strokeStyle = color
    context.lineWidth = 2
    context.lineCap = "round"
    context.lineJoin = "round"

    setHasDrawn(false)
  }

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)

    setIsDrawing(true)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    context.lineTo(x, y)
    context.stroke()
    setHasDrawn(true)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-lg border max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="p-2 border-b flex justify-between items-center">
          <span className="text-sm font-medium">Draw Signature</span>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="border-b"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        <div className="p-2 flex justify-between">
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1" disabled={!hasDrawn}>
              <Check className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

