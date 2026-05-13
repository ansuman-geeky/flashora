# FLASHORA — SCANNER TOOL
### *Scan Anything. Save Everything.*
> Feature Module | Integrates into Flashora v1 | Step 6.5 (after PDF Tools)

---

## FEATURE IDENTITY

```
Feature Name   : Smart Scanner
Feature ID     : scanner
Route          : /scanner/*
Tab Location   : Tools Grid (prominent placement — top row)
Icon           : lucide ScanLine
Category Color : #0EA5E9   (Sky Blue — distinct from all other tools)
Tag            : NEW  (badge on home screen quick actions)
```

**One-line pitch:** Point your camera at any document, book page, whiteboard, or receipt — Flashora cleans it up and saves it as a crisp Image, PDF, or Word Doc.

---

## AGENT INSTRUCTION

You are continuing the Flashora build session. The full app spec is in `FLASHORA_MASTER_PROMPT.md`. This file defines one new feature module — **Smart Scanner** — to be built as Step 6.5, inserted between PDF Tools (Step 6) and QR Tools (Step 7).

Follow all existing architecture rules:
- Feature-first folder under `src/features/scanner/`
- Service layer handles all processing — zero business logic in UI
- Full TypeScript strict compliance
- All error states handled
- Crash-prevention checklist must pass before step is complete

---

## WHAT THE SCANNER DOES

The user opens the Scanner, points their phone camera at any flat document, and Flashora:

1. **Detects the document edges** automatically (quadrilateral detection)
2. **Lets the user adjust corners** manually if needed
3. **Captures the scan** with perspective correction applied
4. **Enhances the image** (auto contrast, denoise, sharpen)
5. **Lets the user pick export format**: Image (JPG/PNG) · PDF · Word Doc (.docx)
6. **Saves or shares** the output

Multi-page scanning is supported — the user can scan multiple pages before exporting.

---

## USER FLOWS

### Flow A — Quick Single Scan
```
Open Scanner
  → Camera live view with edge detection overlay
  → Auto-detect document edges (highlight in #0EA5E9)
  → Tap capture button
  → Enhancement preview (before/after toggle)
  → Select export format: Image / PDF / Doc
  → Save to device / Share
```

### Flow B — Multi-Page Scan
```
Open Scanner
  → Scan page 1 → thumbnail added to strip at bottom
  → Tap "+" to scan next page
  → Scan page 2, 3, ... N
  → Tap "Done" → review all pages (reorder/delete)
  → Select export format: PDF (only) or Image ZIP
  → Save / Share
```

### Flow C — Gallery Import
```
Open Scanner
  → Tap gallery icon (top right)
  → Pick image from gallery
  → Same edge-detection + correction flow
  → Export as Image / PDF / Doc
```

---

## SCREENS & COMPONENTS

### Screen 1 — Scanner Camera (`/scanner/camera`)

```
Layout:
  ┌──────────────────────────────────┐
  │  ← Back          Gallery  Flash  │  ← Header bar
  │                                  │
  │   ┌─────────────────────┐        │
  │   │                     │        │
  │   │   [LIVE CAMERA]     │        │  ← Full screen camera
  │   │                     │        │
  │   │  ◇─────────────────◇│        │  ← Edge detection overlay
  │   │  │   DOCUMENT      ││        │     (animated, #0EA5E9 corners)
  │   │  │   DETECTED      ││        │
  │   │  ◇─────────────────◇│        │
  │   │                     │        │
  │   └─────────────────────┘        │
  │                                  │
  │  [Page 1] [Page 2]  +            │  ← Page strip (multi-scan)
  │                                  │
  │          [ ◎ CAPTURE ]           │  ← Capture button
  └──────────────────────────────────┘
```

**Components:**
- `CameraView` — expo-camera live feed, full screen
- `EdgeOverlay` — SVG quadrilateral drawn over detected corners, animates to lock position
- `CornerHandle` — draggable corner adjustment handle (gesture-controlled)
- `PageStrip` — horizontal scroll strip showing captured page thumbnails
- `CaptureButton` — large circular button with haptic feedback
- `FlashToggle` — cycles: Off → On → Auto
- `GalleryImportButton` — opens expo-image-picker

### Screen 2 — Crop & Adjust (`/scanner/adjust`)

```
Layout:
  ┌──────────────────────────────────┐
  │  ← Retake        Adjust Corners  │
  │                                  │
  │   ┌──────────────────────────┐   │
  │   │                          │   │
  │   │   [CAPTURED IMAGE]       │   │
  │   │                          │   │
  │   ◇──────────────────────────◇   │  ← Draggable corners
  │   │                          │   │
  │   ◇──────────────────────────◇   │
  │                                  │
  │   [ Auto ]  [ Manual ]           │  ← Mode toggle
  │                                  │
  │          [ APPLY →  ]            │
  └──────────────────────────────────┘
```

**Components:**
- `CropCanvas` — react-native-skia canvas with the captured image + draggable handles
- `CropHandle` — gesture-driven corner, snaps to edges
- `ModeToggle` — Auto (re-runs detection) vs Manual (free drag)

### Screen 3 — Enhancement (`/scanner/enhance`)

```
Layout:
  ┌──────────────────────────────────┐
  │  ← Back                   Done → │
  │                                  │
  │   ┌──────────────────────────┐   │
  │   │   [ENHANCED PREVIEW]     │   │  ← Full preview
  │   └──────────────────────────┘   │
  │                                  │
  │   Enhancement Mode:              │
  │   ┌───┐  ┌───┐  ┌───┐  ┌───┐   │
  │   │ A │  │ B │  │ G │  │ P │   │  ← Mode pills
  │   │uto│  │&W │  │ray│  │hto│   │
  │   └───┘  └───┘  └───┘  └───┘   │
  │                                  │
  │   Brightness ──●───────── +      │
  │   Contrast   ────●─────── +      │
  │                                  │
  │   [ Before ] ←──→ [ After ]      │  ← Toggle preview
  └──────────────────────────────────┘
```

**Enhancement Modes:**
```ts
type EnhancementMode =
  | 'auto'       // Smart auto-enhance (default)
  | 'bw'         // Black & White — high contrast document
  | 'grayscale'  // Gray tones preserved
  | 'photo'      // Color preserved, light correction only
  | 'whiteboard' // High contrast, whiteboard-optimized
```

### Screen 4 — Export (`/scanner/export`)

```
Layout:
  ┌──────────────────────────────────┐
  │  ← Back              Export      │
  │                                  │
  │   Pages: 3 scanned               │
  │   ┌────┐ ┌────┐ ┌────┐          │
  │   │ P1 │ │ P2 │ │ P3 │   +      │  ← Reorder / delete pages
  │   └────┘ └────┘ └────┘          │
  │                                  │
  │   Export As:                     │
  │   ┌──────────────────────────┐   │
  │   │  📄  PDF Document        │ ✓ │  ← Selected
  │   │  🖼️  Image (JPG / PNG)   │   │
  │   │  📝  Word Doc (.docx)    │ 👑 │  ← Premium
  │   └──────────────────────────┘   │
  │                                  │
  │   File Name: [Scan_2025_01_15]   │
  │   Quality:   ○ Standard  ● High  │  ← High quality = Premium
  │                                  │
  │   [ 💾 Save to Device ]          │
  │   [ 🔗 Share ]                   │
  └──────────────────────────────────┘
```

---

## FOLDER STRUCTURE

```
src/features/scanner/
├── components/
│   ├── CameraView.tsx           # Expo camera wrapper with permissions
│   ├── EdgeOverlay.tsx          # SVG quad overlay for edge detection
│   ├── CornerHandle.tsx         # Draggable gesture corner
│   ├── CropCanvas.tsx           # react-native-skia crop interface
│   ├── PageStrip.tsx            # Multi-page thumbnail strip
│   ├── CaptureButton.tsx        # Shutter button with haptics
│   ├── EnhancementModeBar.tsx   # Mode selector pills
│   ├── BeforeAfterToggle.tsx    # Preview comparison slider
│   └── ExportFormatCard.tsx     # Format selection card
│
├── hooks/
│   ├── useScanner.ts            # Main scanner orchestration hook
│   ├── useEdgeDetection.ts      # Edge detection logic + state
│   ├── useCropGestures.ts       # Pinch/drag gesture handling
│   ├── useEnhancement.ts        # Enhancement mode + params state
│   └── useExport.ts             # Export format + quality + save logic
│
├── services/
│   ├── edgeDetectionService.ts  # Document corner detection
│   ├── perspectiveService.ts    # Perspective warp / correction
│   ├── enhancementService.ts    # Image filters + adjustments
│   ├── pdfExportService.ts      # Scanned pages → PDF
│   ├── imageExportService.ts    # Scanned pages → JPG/PNG
│   └── docxExportService.ts     # Scanned pages → .docx (Premium)
│
├── store/
│   └── useScannerStore.ts       # Zustand: pages[], currentMode, settings
│
├── types/
│   └── scanner.ts               # All scanner-related types
│
└── index.ts                     # Public exports
```

---

## TYPES

```ts
// src/features/scanner/types/scanner.ts

export type EnhancementMode =
  | 'auto'
  | 'bw'
  | 'grayscale'
  | 'photo'
  | 'whiteboard';

export type ExportFormat = 'pdf' | 'jpg' | 'png' | 'docx';

export type ExportQuality = 'standard' | 'high';

export interface Corner {
  x: number;
  y: number;
}

export interface DocumentQuad {
  topLeft:     Corner;
  topRight:    Corner;
  bottomRight: Corner;
  bottomLeft:  Corner;
}

export interface ScannedPage {
  id:              string;
  rawUri:          string;    // Original captured image URI
  croppedUri:      string;    // After perspective correction
  enhancedUri:     string;    // After enhancement
  quad:            DocumentQuad;
  enhancementMode: EnhancementMode;
  capturedAt:      number;    // timestamp
}

export interface ScanSession {
  id:        string;
  pages:     ScannedPage[];
  createdAt: number;
}

export interface ExportOptions {
  format:   ExportFormat;
  quality:  ExportQuality;
  fileName: string;
}

export interface ScannerState {
  session:         ScanSession | null;
  isDetecting:     boolean;
  detectedQuad:    DocumentQuad | null;
  flashMode:       'off' | 'on' | 'auto';
  enhancementMode: EnhancementMode;
}
```

---

## SERVICES — IMPLEMENTATION SPEC

### `edgeDetectionService.ts`

```ts
// Strategy: use expo-image-manipulator for preprocessing
// + OpenCV.js (via react-native-opencv3) or fallback heuristic detection
// Fallback: if no library available, return full-image quad (user adjusts manually)

interface EdgeDetectionResult {
  quad:       DocumentQuad;
  confidence: number;   // 0–1, show manual adjust prompt if < 0.7
}

export async function detectDocumentEdges(
  imageUri: string,
  imageWidth: number,
  imageHeight: number
): Promise<EdgeDetectionResult>
```

**Implementation note:** Use `vision-camera-document-scanner` or `react-native-document-scanner-plugin` for on-device ML edge detection. If unavailable, fall back to a centered default quad with a prompt for manual adjustment. Never crash — always return a valid quad.

### `perspectiveService.ts`

```ts
// Applies 4-point perspective transform to straighten the document
// Library: expo-image-manipulator + custom perspective matrix
// Output: flat, rectangular, corrected image

export async function applyPerspectiveCorrection(
  imageUri: string,
  quad: DocumentQuad,
  outputWidth: number,
  outputHeight: number
): Promise<string>  // returns corrected image URI
```

### `enhancementService.ts`

```ts
// Applies enhancement filters using expo-image-manipulator
// Auto mode: normalize + sharpen + slight contrast boost
// B&W: desaturate + high contrast threshold
// Whiteboard: aggressive brightness + contrast, remove background noise

export async function enhanceImage(
  imageUri: string,
  mode: EnhancementMode,
  params: { brightness: number; contrast: number }
): Promise<string>  // returns enhanced image URI
```

### `pdfExportService.ts`

```ts
// Converts array of enhanced image URIs to a single PDF
// Library: react-native-pdf-lib (reuses PDF feature dependency)
// Each page = one image, A4 sizing, margins: 0 (full bleed)

export async function exportToPdf(
  pages: ScannedPage[],
  options: ExportOptions
): Promise<string>  // returns output PDF URI
```

### `docxExportService.ts` (Premium)

```ts
// Embeds scanned images into a .docx file
// Library: docx (npm) — pure JS, no native bridge needed
// Each page = one full-width image block in the document

export async function exportToDocx(
  pages: ScannedPage[],
  options: ExportOptions
): Promise<string>  // returns output .docx URI
```

---

## ZUSTAND STORE

```ts
// src/features/scanner/store/useScannerStore.ts

interface ScannerStore {
  // State
  session:         ScanSession | null;
  flashMode:       'off' | 'on' | 'auto';
  enhancementMode: EnhancementMode;
  isProcessing:    boolean;
  error:           string | null;

  // Actions
  startSession:    () => void;
  addPage:         (page: ScannedPage) => void;
  removePage:      (pageId: string) => void;
  reorderPages:    (fromIndex: number, toIndex: number) => void;
  updatePageQuad:  (pageId: string, quad: DocumentQuad) => void;
  setFlashMode:    (mode: 'off' | 'on' | 'auto') => void;
  setEnhancement:  (mode: EnhancementMode) => void;
  setProcessing:   (val: boolean) => void;
  setError:        (msg: string | null) => void;
  clearSession:    () => void;
}
```

---

## DEPENDENCIES TO ADD

```json
// Add to package.json dependencies

"react-native-document-scanner-plugin": "^1.8.0",
"react-native-vision-camera": "^4.0.0",
"vision-camera-document-scanner": "^0.2.0",
"@shopify/react-native-skia": "^1.3.0",
"docx": "^8.5.0",
"react-native-draggable-flatlist": "^4.0.1"
```

**Why these:**

| Package | Purpose |
|---|---|
| `react-native-document-scanner-plugin` | On-device ML edge detection — no server call |
| `react-native-vision-camera` | Superior camera API vs expo-camera for live frame processing |
| `@shopify/react-native-skia` | GPU-accelerated crop canvas + corner handles |
| `docx` | Pure JS .docx generation — no native bridge, stable |
| `react-native-draggable-flatlist` | Page reorder in export screen |

---

## FREE vs PREMIUM GATES

```
Feature                         Free        Premium
───────────────────────────     ────────    ───────────────
Single page scan                ✓           ✓
Multi-page scan (up to 3)       ✓           ✓
Multi-page scan (unlimited)     ✗           ✓
Export as Image (JPG/PNG)       ✓           ✓
Export as PDF                   ✓           ✓
Export as Word Doc (.docx)      ✗           ✓
Standard quality export         ✓           ✓
High quality export             ✗           ✓
Whiteboard enhancement mode     ✓           ✓
Batch scan from gallery         ✗           ✓
Remove scanner watermark        ✗           ✓
```

**Gate implementation:** Check `usePremiumStore.isPremium` before export. Show upgrade bottom sheet if gated — never hard-block without offering upgrade path.

---

## ANALYTICS EVENTS

```ts
// Add to existing analytics schema

| 'scanner_open'
| 'scanner_capture'          // { page_number }
| 'scanner_edge_auto'        // { confidence: number }
| 'scanner_edge_manual'      // user manually adjusted corners
| 'scanner_enhance'          // { mode: EnhancementMode }
| 'scanner_export'           // { format, quality, page_count }
| 'scanner_export_gate'      // { format } — hit premium gate
| 'scanner_failure'          // { error_code }
```

---

## ERROR HANDLING — SCANNER SPECIFIC

```ts
type ScannerError =
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_UNAVAILABLE'
  | 'EDGE_DETECTION_FAILED'    // fallback to manual — never crash
  | 'PERSPECTIVE_FAILED'       // show retake option
  | 'ENHANCEMENT_FAILED'       // skip enhancement, use raw
  | 'EXPORT_FAILED'            // show retry
  | 'STORAGE_FULL'             // prompt user to free space
  | 'INVALID_IMAGE'            // file unreadable
  | 'DOCX_GENERATION_FAILED';  // Premium export error

// Rule: edge detection failure must NEVER crash the app.
// Always fall back to a default centered quad and show:
// "Couldn't auto-detect edges. Drag corners to adjust."
```

---

## CRASH PREVENTION CHECKLIST — SCANNER

```
[ ] Camera permission requested only on Scanner open, not app launch
[ ] Camera ref null-checked before every capture call
[ ] Edge detection wrapped in try/catch with guaranteed fallback quad
[ ] Perspective warp input validated (quad corners within image bounds)
[ ] All image URIs validated before passing to processing services
[ ] expo-file-system storage check before saving output
[ ] Skia canvas unmounted cleanly (no memory leaks on screen exit)
[ ] Vision Camera session stopped on screen blur/unmount
[ ] Multi-page array never mutated directly — always via Zustand actions
[ ] Export format gating checked before triggering export service
[ ] .docx generation in try/catch — failure shows retry, not white screen
[ ] All useEffect hooks return cleanup functions
```

---

## NAVIGATION INTEGRATION

```ts
// app/(tabs)/tools.tsx — add Scanner to tool grid

{
  id:       'scanner',
  name:     'Smart Scanner',
  icon:     'ScanLine',
  color:    '#0EA5E9',
  route:    '/scanner/camera',
  badge:    'NEW',
  position: 0,   // First in grid — prominent placement
}

// app/scanner/_layout.tsx — Scanner stack
// Screens: camera → adjust → enhance → export
// Stack navigator, no tab bar visible (full-screen camera experience)
```

---

## HOME SCREEN INTEGRATION

Add to Quick Actions row:

```ts
{
  id:     'scanner',
  label:  'Scan Doc',
  icon:   'ScanLine',
  color:  '#0EA5E9',
  route:  '/scanner/camera',
  badge:  'NEW',
}
```

---

## PERFORMANCE REQUIREMENTS — SCANNER

```
Metric                          Target
────────────────────────────    ──────────────────────────────
Camera feed to first frame      < 800ms
Edge detection per frame        < 150ms (must not block UI thread)
Perspective correction          < 1.5s (with progress indicator)
Enhancement preview render      < 800ms
PDF export (5 pages)            < 4s
.docx export (5 pages)          < 3s
Memory during scan session      < 200MB (release raw URIs after crop)
```

---

## STEP EXECUTION INSTRUCTION

> Paste this into your active Claude Code session after Step 6 (PDF Tools) is approved.

```
Step 6 is complete. Now execute Step 6.5 — Smart Scanner feature.

Read FLASHORA_SCANNER_PROMPT.md for the complete specification.

Build in this exact order:
1. Types — scanner.ts
2. Zustand store — useScannerStore.ts
3. Service layer — all 5 services (edge, perspective, enhance, pdf, docx)
4. Hooks — useScanner, useEdgeDetection, useCropGestures, useEnhancement, useExport
5. Components — CameraView, EdgeOverlay, CornerHandle, CropCanvas, PageStrip,
                CaptureButton, EnhancementModeBar, BeforeAfterToggle, ExportFormatCard
6. Screens — camera, adjust, enhance, export
7. Navigation — scanner/_layout.tsx + stack config
8. Integration — add to tools grid, home quick actions, activity history
9. Tests — unit tests for all 5 services

Write every file completely. Zero placeholders.
After all files are written, run through the crash prevention checklist
and fix any issues before marking this step complete.

Then stop and wait for review.
```
