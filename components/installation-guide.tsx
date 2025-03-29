export function InstallationGuide() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Installation Guide</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">1. Install PDF.js Express</h3>
          <div className="bg-gray-100 p-3 rounded-md">
            <code>npm install @pdftron/pdfjs-express</code>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">2. Copy Assets</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Copy the PDF.js Express assets to your public directory. These files are available in the package.
          </p>
          <div className="bg-gray-100 p-3 rounded-md">
            <code>cp -R node_modules/@pdftron/pdfjs-express/public public/pdfjs-express</code>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">3. Add License Key</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Replace <code>YOUR_LICENSE_KEY</code> in the PDFJSExpressViewer component with your actual license key. For
            testing, you can use a demo key from the PDF.js Express website.
          </p>
          <div className="bg-gray-100 p-3 rounded-md">
            <code>licenseKey: "YOUR_LICENSE_KEY",</code>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">4. Configure Next.js</h3>
          <p className="text-sm text-muted-foreground mb-2">Add the following to your next.config.js file:</p>
          <div className="bg-gray-100 p-3 rounded-md">
            <pre>{`module.exports = {
  webpack: (config) => {
    config.resolve.alias.fs = false;
    config.resolve.alias.path = false;
    return config;
  },
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

