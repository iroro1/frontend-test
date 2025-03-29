Thought for 4 seconds### PDF Annotator

A web-based PDF annotation tool that allows users to highlight, underline, add comments, and signatures to PDF documents. This tool renders PDFs directly in the browser and enables exporting annotated PDFs without relying on external services.

## Features

- PDF viewing with pagination controls
- Annotation tools:

- Highlighting with adjustable height and width
- Underlining with variable width
- Comments with text editing
- Signature drawing and placement

- Sidebar for annotation management and organization by page
- Real-time annotation preview
- Export annotated PDFs with preserved annotations
- Responsive design

## Setup and Installation

### Prerequisites

- Node.js (v16.x or higher)
- npm or yarn

### Installation

1. Clone the repository:

```shellscript
git clone https://github.com/iroro1/frontend-test.git
cd pdf-annotator
```

2. Install dependencies:

```shellscript
npm install
# or
yarn
```

3. Run the development server:

```shellscript
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload a PDF file using the upload interface.
2. Select an annotation tool from the toolbar on the left (highlight, underline, comment, or signature).
3. Choose a color for your annotation.
4. Click or drag on the PDF to create an annotation:

5. Click and drag to create highlights and underlines
6. Click to add a comment or signature

7. Navigate between pages using the pagination controls at the bottom.
8. View all annotations in the sidebar on the right, organized by page.
9. Preview your annotations by clicking the "Preview" button.
10. Export the annotated PDF by clicking the "Save PDF" button.

## Libraries and Tools Used

- **Next.js**: React framework for building the application, providing server-side rendering and routing
- **React**: UI library for building the component-based interface
- **pdf-lib**: Used for PDF manipulation and adding annotations to the PDF during export
- **Tailwind CSS**: Used for styling the application with utility classes
- **shadcn/ui**: Component library built on top of Tailwind CSS for UI elements like buttons, dialogs, etc.
- **uuid**: Used for generating unique IDs for annotations
- **react-dropzone**: Used for the file upload interface

### Why these libraries?

- **pdf-lib**: Chosen for its ability to manipulate PDFs directly in the browser without requiring server-side processing. It provides a clean API for adding various elements to PDFs including text, images, and shapes, which are essential for representing annotations.
- **Tailwind CSS & shadcn/ui**: Used to rapidly build a polished UI with consistent styling while allowing for customization. The utility-first approach enabled quick iteration and responsive design.
- **react-dropzone**: Provides a user-friendly file upload interface with drag-and-drop functionality and file validation.

## Challenges and Solutions

### PDF Rendering and Annotation Positioning

**Challenge**: Ensuring annotations are positioned correctly on the PDF, especially when the PDF is scaled to fit the container.

**Solution**:

- Implemented a custom overlay that matches the dimensions of the PDF container
- Stored both the annotation coordinates and the container dimensions to calculate scaling factors when exporting
- Used the `page-fit` mode for PDFs and disabled scrolling to ensure consistent positioning

### PDF Export with Annotations

**Challenge**: Adding annotations to the PDF in their correct positions during export.

**Solution**:

- Used pdf-lib's coordinate system (which has its origin at the bottom-left corner) and transformed our annotation coordinates (which are based on the top-left corner)
- Applied scaling factors based on the ratio between PDF page dimensions and our container dimensions
- Converted colors from hex format to RGB values for proper rendering in the exported PDF

### Draggable Annotations with Variable Dimensions

**Challenge**: Implementing draggable highlights and underlines that can vary in size based on user interaction.

**Solution**:

- Used mouse events (mousedown, mousemove, mouseup) to track the start and end points of the drag
- Calculated dimensions based on the difference between start and end points
- Created a temporary annotation display during dragging for visual feedback
- Implemented logic for min/max constraints on dimensions

### Canvas Signature Integration

**Challenge**: Integrating a canvas-based signature tool and embedding signatures in the PDF.

**Solution**:

- Created a custom SignatureCanvas component with drawing capabilities
- Converted the canvas drawing to a data URL
- Embedded the signature image in the PDF using pdf-lib's image embedding feature

## Future Enhancements

If given more time, the following features would enhance the application:

1. **Text Selection and Annotation**: Allow users to select text in the PDF and create annotations tied to specific text selections.
2. **Freehand Drawing Tool**: Add the ability to draw freehand on the PDF for more flexible annotations.
3. **Annotation Search and Filtering**: Add search functionality to find annotations by text, type, or page.
4. **Collaboration Features**: Enable multiple users to annotate the same document simultaneously with real-time updates.
5. **Annotation Layers**: Allow toggling visibility of different annotation types or layers.
6. **Better Mobile Support**: Optimize the interface and interaction for mobile devices.
7. **PDF Text Extraction**: Extract text from PDFs to enable features like search within the document.
8. **Form Filling**: Add support for filling out PDF forms.
9. **Offline Support**: Implement service workers for offline functionality.
10. **Annotation Templates**: Save and reuse common annotations or signature presets.
