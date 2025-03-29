import { CheckCircle2, XCircle } from "lucide-react"

export function FeatureComparison() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Feature Comparison</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Feature</th>
              <th className="py-2 px-4 text-center">Custom Solution</th>
              <th className="py-2 px-4 text-center">PDF.js Express Free</th>
              <th className="py-2 px-4 text-center">PDF.js Express Pro</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4">Accurate Annotation Positioning</td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Text Highlighting</td>
              <td className="py-2 px-4 text-center text-yellow-500">Limited</td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Comments & Notes</td>
              <td className="py-2 px-4 text-center text-yellow-500">Basic</td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Signatures</td>
              <td className="py-2 px-4 text-center text-yellow-500">Basic</td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Drawing & Shapes</td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Form Filling</td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-yellow-500">Limited</td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Redaction</td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Measurement Tools</td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Mobile Support</td>
              <td className="py-2 px-4 text-center text-red-500">
                <XCircle className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
              <td className="py-2 px-4 text-center text-green-500">
                <CheckCircle2 className="inline h-5 w-5" />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4">Cost</td>
              <td className="py-2 px-4 text-center text-green-500">Free</td>
              <td className="py-2 px-4 text-center text-green-500">Free</td>
              <td className="py-2 px-4 text-center text-yellow-500">Commercial</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

