import { FeatureComparison } from "@/components/feature-comparison"
import { InstallationGuide } from "@/components/installation-guide"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white p-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">PDF Annotator - Features</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto flex-1 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Why Use PDF.js Express?</h2>
            <p className="mb-4 text-muted-foreground">
              PDF.js Express is built on top of Mozilla's PDF.js, the most widely used PDF viewer on the web. It
              provides a comprehensive set of tools for viewing, annotating, and manipulating PDF documents.
            </p>

            <h3 className="text-lg font-medium mb-2">Key Benefits:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Free version available with essential annotation features</li>
              <li>Accurate annotation positioning across all PDF documents</li>
              <li>Comprehensive annotation tools (highlights, comments, shapes, signatures)</li>
              <li>Based on Mozilla's PDF.js, the most widely used PDF renderer</li>
              <li>Mobile-friendly with touch support</li>
              <li>Regular updates and maintenance</li>
              <li>Upgrade path to commercial version for advanced features</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <h4 className="text-blue-800 font-medium mb-2">Free vs. Commercial Version</h4>
              <p className="text-blue-700 text-sm">
                PDF.js Express offers a free version that includes essential annotation features like highlighting,
                comments, and signatures. The commercial version adds advanced features like redaction, measurement
                tools, and more comprehensive form filling capabilities.
              </p>
            </div>
          </div>

          <FeatureComparison />

          <InstallationGuide />
        </div>
      </div>

      <footer className="border-t bg-white p-4 text-center text-sm text-muted-foreground">
        <p>PDF Annotator - Powered by PDF.js Express</p>
      </footer>
    </main>
  )
}

