"use client"

import { Highlighter, Underline, MessageSquare, Pen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAnnotation } from "@/context/annotation-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AnnotationToolbar() {
  const { currentTool, setCurrentTool, currentColor, setCurrentColor, annotations, clearAnnotations } = useAnnotation()

  const handleToolClick = (tool: "highlight" | "underline" | "comment" | "signature") => {
    setCurrentTool(currentTool === tool ? "highlight" : tool)
  }

  const handleColorChange = (color: string) => {
    setCurrentColor(color)
  }

  const colors = [
    { name: "Yellow", value: "#FFEB3B" },
    { name: "Green", value: "#4CAF50" },
    { name: "Blue", value: "#2196F3" },
    { name: "Red", value: "#F44336" },
    { name: "Purple", value: "#9C27B0" },
  ]

  // Count annotation types
  const highlightCount = annotations.filter((a) => a.type === "highlight").length
  const underlineCount = annotations.filter((a) => a.type === "underline").length
  const commentCount = annotations.filter((a) => a.type === "comment").length
  const signatureCount = annotations.filter((a) => a.type === "signature").length

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Annotation Mode</AlertTitle>
          <AlertDescription className="text-blue-700">
            {`${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)} tool is active. Click or drag on the PDF to add.`}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="font-medium">Annotation Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "highlight" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("highlight")}
                  aria-label="Highlight Text"
                  style={currentTool === "highlight" ? { backgroundColor: currentColor, color: "#000" } : {}}
                  className={currentTool === "highlight" ? "ring-2 ring-primary" : ""}
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Highlight Text</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "underline" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("underline")}
                  aria-label="Underline Text"
                  style={currentTool === "underline" ? { backgroundColor: currentColor, color: "#000" } : {}}
                  className={currentTool === "underline" ? "ring-2 ring-primary" : ""}
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline Text</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "comment" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("comment")}
                  aria-label="Add Comment"
                  style={currentTool === "comment" ? { backgroundColor: currentColor, color: "#000" } : {}}
                  className={currentTool === "comment" ? "ring-2 ring-primary" : ""}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Comment</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "signature" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("signature")}
                  aria-label="Add Signature"
                  style={currentTool === "signature" ? { backgroundColor: currentColor, color: "#000" } : {}}
                  className={currentTool === "signature" ? "ring-2 ring-primary" : ""}
                >
                  <Pen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Signature</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="font-medium">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Tooltip key={color.value}>
                <TooltipTrigger asChild>
                  <button
                    className={`h-6 w-6 rounded-full transition-all ${
                      currentColor === color.value ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    aria-label={color.name}
                  />
                </TooltipTrigger>
                <TooltipContent>{color.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="font-medium">Annotation Summary</h3>
          <div className="rounded-md border p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Highlighter className="h-4 w-4 text-primary" />
                <span className="text-sm">{highlightCount} Highlights</span>
              </div>
              <div className="flex items-center gap-2">
                <Underline className="h-4 w-4 text-primary" />
                <span className="text-sm">{underlineCount} Underlines</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm">{commentCount} Comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Pen className="h-4 w-4 text-primary" />
                <span className="text-sm">{signatureCount} Signatures</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-medium text-yellow-800 mb-1">How to use:</p>
            <ol className="text-sm text-yellow-700 list-decimal pl-4 space-y-1">
              <li>Select a tool from the toolbar above</li>
              <li>Select a color if desired</li>
              <li>Click directly on the PDF to add comments or signatures</li>
              <li>Click and drag to create highlights or underlines</li>
            </ol>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={clearAnnotations}
            disabled={annotations.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear All Annotations
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

