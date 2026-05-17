# FLASHORA — PRO SCANNER ENGINE
### *Adobe Scan Level Precision. Native Performance. Zero Compromise.*
> Quality Enhancement Prompt | Replaces basic scanner implementation | Production-grade

---

## THE PROBLEM — WHY BASIC SCANNERS FAIL

Current implementation issues that make scanning feel amateur:

```
❌ Edge detection uses simple heuristics — misses curved pages, shadows, complex backgrounds
❌ Perspective correction distorts text when quad is slightly off
❌ No real-time frame analysis — detection runs once on captured photo
❌ Enhancement is basic brightness/contrast — no intelligent document processing
❌ No shadow removal — shadows from hands/binding ruin scans
❌ No auto-capture when document is stable — user must tap manually
❌ No blur detection — captures blurry frames silently
❌ Output quality degrades with compression — text becomes unreadable
❌ Multi-page PDFs have inconsistent white balance across pages
❌ No page boundary detection for book scanning (curved spine)
```

**Goal:** Match Adobe Scan, Microsoft Lens, and Google PhotoScan in detection accuracy, correction quality, and output fidelity.

---

## ARCHITECTURE OVERVIEW — PRO ENGINE

```
┌─────────────────────────────────────────────────────────┐
│                   CAMERA LAYER                           │
│  VisionCamera + Frame Processor (runs on UI thread)     │
│  30fps real-time analysis — no JS bridge overhead       │
└─────────────────────┬───────────────────────────────────┘
                       │ every frame
┌─────────────────────▼───────────────────────────────────┐
│                 DETECTION ENGINE                          │
│  OpenCV.js / MLKit Document Scanner                      │
│  • Canny edge detection                                  │
│  • Hough line transform                                  │
│  • Contour approximation (Douglas-Peucker)               │
│  • Confidence scoring                                    │
└─────────────────────┬───────────────────────────────────┘
                       │ on capture
┌─────────────────────▼───────────────────────────────────┐
│              CORRECTION ENGINE                            │
│  • Perspective warp (homography matrix)                  │
│  • Lens distortion correction                            │
│  • Page curl / book spine correction                     │
│  • Geometric straightening                               │
└─────────────────────┬───────────────────────────────────┘
                       │
┌─────────────────────▼───────────────────────────────────┐
│             ENHANCEMENT ENGINE                            │
│  • Adaptive thresholding (Otsu / Sauvola)                │
│  • Shadow removal (illumination normalization)            │
│  • Denoising (Non-local means / BM3D)                    │
│  • Sharpening (unsharp mask)                             │
│  • Color normalization + white balance                   │
│  • Moiré pattern removal (for printed docs)              │
└─────────────────────┬───────────────────────────────────┘
                       │
┌─────────────────────▼───────────────────────────────────┐
│               OUTPUT ENGINE                               │
│  • Lossless-quality JPEG (95+) / PNG                     │
│  • PDF/A archival format                                 │
│  • DOCX with embedded high-res images                    │
│  • Consistent white balance across multi-page            │
└─────────────────────────────────────────────────────────┘
```

---

## DEPENDENCY STRATEGY

### Primary Vision Library

```bash
# Option A — Best accuracy (recommended)
npm install vision-camera-document-scanner

# Frame processor plugin — runs OpenCV natively on every frame
# Gives: real-time quad detection, confidence score, corner positions
# Platform: Android (JNI), no JS bridge latency

# Option B — Fallback if A unavailable
npm install react-native-document-scanner-plugin
# Runs on captured photo only — less real-time but still accurate

# Option C — Maximum control (advanced)
npm install @opencv-tools/react-native-opencv3
# Full OpenCV — implement custom pipeline
# Use only if A and B are insufficient
```

### Image Processing

```bash
npm install @shopify/react-native-skia        # GPU canvas — perspective warp
npm install react-native-image-resizer        # High-quality resize
npm install @react-native-ml-kit/document-scanner  # MLKit on-device
npm install react-native-fast-image           # Cached preview rendering
```

### PDF Generation

```bash
npm install react-native-pdf-lib              # Native PDF — best quality
npm install @react-pdf/renderer               # JS fallback
```

### Install all

```bash
npx expo install vision-camera-document-scanner \
  @shopify/react-native-skia \
  react-native-image-resizer \
  react-native-fast-image

npm install react-native-pdf-lib
```

---

## ENGINE 1 — REAL-TIME DETECTION ENGINE

**File:** `src/features/scanner/engines/detectionEngine.ts`

### Specification

```ts
export interface DetectionResult {
  quad:            DocumentQuad;      // 4 corner points in image coords
  confidence:      number;            // 0.0 – 1.0
  isStable:        boolean;           // true if quad hasn't moved > 5px in last 8 frames
  stableFrames:    number;            // consecutive stable frames count
  blurScore:       number;            // 0.0 – 1.0 (1.0 = sharp)
  lightingScore:   number;            // 0.0 – 1.0 (1.0 = ideal lighting)
  warnings:        DetectionWarning[];
}

export type DetectionWarning =
  | 'TOO_DARK'           // lightingScore < 0.3
  | 'TOO_BRIGHT'         // lightingScore > 0.95 (overexposed)
  | 'BLURRY'             // blurScore < 0.4
  | 'MOVE_CLOSER'        // doc occupies < 40% of frame
  | 'MOVE_FARTHER'       // doc occupies > 92% of frame
  | 'SHADOW_DETECTED'    // high shadow coverage on document
  | 'GLARE_DETECTED'     // specular reflection detected
  | 'PARTIAL_DOCUMENT'   // document edges outside frame
  | 'CURVED_PAGE';       // book/magazine — suggest flat mode
```

### Real-Time Frame Processor

```ts
// src/features/scanner/engines/frameProcessor.ts
// Runs on UI thread via VisionCamera worklet — zero JS bridge

import { useFrameProcessor } from 'react-native-vision-camera';
import { scanDocument } from 'vision-camera-document-scanner';
import Reanimated, { useSharedValue, runOnJS } from 'react-native-reanimated';

export function useDocumentFrameProcessor(
  onDetection: (result: DetectionResult) => void
) {
  // Shared values — updated on UI thread, read by Reanimated
  const quadPoints    = useSharedValue<DocumentQuad | null>(null);
  const confidence    = useSharedValue(0);
  const stableFrames  = useSharedValue(0);
  const lastQuad      = useSharedValue<DocumentQuad | null>(null);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    // Run detection on every frame (30fps)
    const result = scanDocument(frame);

    if (result.found) {
      const currentQuad = result.corners;

      // Stability check — compare to last 8 frames
      const isStable = lastQuad.value !== null
        && quadDistance(currentQuad, lastQuad.value) < 5;

      stableFrames.value = isStable ? stableFrames.value + 1 : 0;
      lastQuad.value     = currentQuad;
      quadPoints.value   = currentQuad;
      confidence.value   = result.confidence ?? 0.85;

      // Auto-capture when stable for 12 consecutive frames (~400ms at 30fps)
      if (stableFrames.value >= 12 && confidence.value > 0.82) {
        runOnJS(onDetection)({
          quad:          currentQuad,
          confidence:    confidence.value,
          isStable:      true,
          stableFrames:  stableFrames.value,
          blurScore:     result.blurScore ?? 0.9,
          lightingScore: result.lightingScore ?? 0.8,
          warnings:      computeWarnings(result),
        });
      }
    } else {
      stableFrames.value = 0;
      confidence.value   = 0;
    }
  }, []);

  return { frameProcessor, quadPoints, confidence, stableFrames };
}

// Euclidean distance between two quads (max corner delta)
function quadDistance(a: DocumentQuad, b: DocumentQuad): number {
  'worklet';
  const corners: (keyof DocumentQuad)[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
  return Math.max(...corners.map(c =>
    Math.sqrt(Math.pow(a[c].x - b[c].x, 2) + Math.pow(a[c].y - b[c].y, 2))
  ));
}
```

### Confidence Feedback System

```ts
// Real-time guidance shown to user based on DetectionWarning[]

const WARNING_MESSAGES: Record<DetectionWarning, string> = {
  TOO_DARK:          'Too dark — move to better lighting',
  TOO_BRIGHT:        'Overexposed — avoid direct light',
  BLURRY:            'Hold steady — camera is moving',
  MOVE_CLOSER:       'Move closer to the document',
  MOVE_FARTHER:      'Move farther from the document',
  SHADOW_DETECTED:   'Shadow detected — try a different angle',
  GLARE_DETECTED:    'Glare detected — tilt slightly',
  PARTIAL_DOCUMENT:  'Full document not in frame',
  CURVED_PAGE:       'Book detected — use Book mode',
};

// Display rules:
// — Show only the highest-priority warning (one at a time)
// — Warning priority order: BLURRY > TOO_DARK > GLARE_DETECTED > SHADOW_DETECTED > rest
// — Animate warning in/out with 150ms fade
// — Warning disappears when resolved — do not linger
```

---

## ENGINE 2 — PERSPECTIVE CORRECTION ENGINE

**File:** `src/features/scanner/engines/perspectiveEngine.ts`

### Specification

```ts
export interface PerspectiveOptions {
  quad:            DocumentQuad;  // source corners in original image
  outputWidth:     number;        // target output width in pixels
  outputHeight:    number;        // target output height in pixels
  qualityPreset:   'standard' | 'high' | 'archival';
  correctLens:     boolean;       // correct barrel/pincushion distortion
}

export async function applyPerspectiveCorrection(
  imageUri: string,
  options:  PerspectiveOptions
): Promise<string>
```

### Implementation — Homography via Skia

```ts
// Use @shopify/react-native-skia for GPU-accelerated perspective warp

import { Skia, Canvas, Image, useImage } from '@shopify/react-native-skia';

// Step 1: Compute homography matrix from quad corners to rectangle
function computeHomography(
  srcPoints: [Corner, Corner, Corner, Corner],  // quad corners
  dstWidth:  number,
  dstHeight: number
): number[] {
  // 3x3 homography matrix (perspective transform)
  // Maps srcPoints → [0,0], [W,0], [W,H], [0,H]
  // Uses Direct Linear Transform (DLT) algorithm
  // Returns flat 9-element array [a,b,c,d,e,f,g,h,1]
  return computeDLT(srcPoints, dstWidth, dstHeight);
}

// Step 2: Apply via Skia Matrix transform (runs on GPU)
function applyHomographySkia(
  imageUri: string,
  matrix:   number[],
  outW:     number,
  outH:     number
): Promise<string> {
  // Create offscreen Skia surface
  // Apply 3x3 matrix transform to image
  // Encode at quality preset:
  //   standard:  JPEG 85%
  //   high:      JPEG 95%
  //   archival:  PNG lossless
  // Return output file URI
}
```

### Output Resolution by Preset

```ts
const OUTPUT_RESOLUTION = {
  standard: {
    // A4 equivalent at 150 DPI — fast processing
    width:   1240,
    height:  1754,
    quality: 85,
    format:  'JPEG',
  },
  high: {
    // A4 at 300 DPI — professional quality
    width:   2480,
    height:  3508,
    quality: 95,
    format:  'JPEG',
  },
  archival: {
    // A4 at 600 DPI — lossless archival
    width:   4960,
    height:  7016,
    quality: 100,
    format:  'PNG',
  },
};

// Free users: standard only
// Premium users: high + archival
```

### Auto-Sizing (Smart Aspect Ratio)

```ts
// Do NOT always output A4.
// Detect document type and set aspect ratio accordingly:

function detectDocumentAspectRatio(quad: DocumentQuad): DocumentAspect {
  const width  = avgHorizontalSpan(quad);
  const height = avgVerticalSpan(quad);
  const ratio  = width / height;

  if (ratio > 1.35)        return 'LANDSCAPE';
  if (ratio < 0.65)        return 'PORTRAIT';
  if (Math.abs(ratio - 1) < 0.05) return 'SQUARE';   // business card / receipt
  return 'AUTO';  // use detected ratio directly
}
```

---

## ENGINE 3 — ENHANCEMENT ENGINE

**File:** `src/features/scanner/engines/enhancementEngine.ts`

This is the core quality differentiator. Each mode below must produce output that is indistinguishable from a dedicated scanner app.

### Enhancement Modes — Detailed Algorithms

```ts
export type EnhancementMode =
  | 'auto'        // Intelligent mode selection based on content analysis
  | 'document'    // Printed text — crisp black on white
  | 'bw'          // Aggressive threshold — newspaper / fax quality
  | 'grayscale'   // Tones preserved — handwritten notes, pencil
  | 'photo'       // Full color — photos, illustrations, color docs
  | 'whiteboard'  // High-contrast + background removal
  | 'book'        // Curved page correction + shadow removal
  | 'receipt'     // Narrow, high contrast, thermal paper
  | 'id_card';    // Fixed aspect, sharp edges, no enhancement artifacts
```

### Mode: `auto` — Intelligent Selection

```ts
async function autoEnhance(imageUri: string): Promise<string> {
  // Step 1: Analyze image content
  const analysis = await analyzeImageContent(imageUri);
  // Returns: { dominantColor, textDensity, hasPhoto, isHandwritten,
  //            backgroundBrightness, shadowCoverage, colorVariance }

  // Step 2: Select mode based on analysis
  if (analysis.backgroundBrightness > 0.85 && analysis.textDensity > 0.3) {
    return documentEnhance(imageUri);       // white background, dense text
  }
  if (analysis.shadowCoverage > 0.2) {
    return shadowRemovalEnhance(imageUri);  // shadow present
  }
  if (analysis.isHandwritten) {
    return grayscaleEnhance(imageUri);      // handwriting
  }
  if (analysis.hasPhoto) {
    return photoEnhance(imageUri);          // color content
  }
  if (analysis.colorVariance < 0.05) {
    return bwEnhance(imageUri);             // near-monochrome
  }
  return documentEnhance(imageUri);         // default
}
```

### Mode: `document` — Professional Document Processing

```ts
async function documentEnhance(imageUri: string): Promise<string> {
  // This is the flagship mode — must match Adobe Scan quality

  // Step 1: Shadow removal
  // — Estimate illumination field using large Gaussian blur (σ=50)
  // — Divide original by illumination field
  // — Normalizes uneven lighting without losing text

  // Step 2: Background whitening
  // — Detect background color (sample corners + edges)
  // — Shift background pixels toward pure white
  // — Preserve foreground (text) pixels

  // Step 3: Adaptive thresholding (Sauvola method)
  // — Local threshold for each pixel based on local mean + stddev
  // — Formula: T(x,y) = mean(x,y) * [1 + k * (stddev(x,y)/R - 1)]
  // — k = 0.34, R = 128
  // — Superior to global Otsu for uneven lighting

  // Step 4: Ink darkening
  // — Push text pixels toward pure black (levels: 0–180 → 0)
  // — Eliminates gray fringing on text edges

  // Step 5: Denoising
  // — Apply Non-local Means denoising (h=6, hColor=6, templateWindowSize=7)
  // — Removes scanner grain without blurring text edges

  // Step 6: Unsharp mask
  // — Sigma=0.5, Strength=1.5, Threshold=0
  // — Sharpens character edges

  // Output: JPEG 95% or PNG lossless
}
```

### Mode: `shadow` — Shadow Removal Algorithm

```ts
async function shadowRemovalEnhance(imageUri: string): Promise<string> {
  // The #1 failure point of basic scanners — must solve this properly

  // Algorithm: Illumination Normalization
  // Step 1: Convert to LAB color space
  // Step 2: Extract L channel (luminance only)
  // Step 3: Estimate background illumination:
  //   — Apply morphological dilation (kernel 15x15) to L channel
  //   — This expands bright regions, eliminating dark text/shadows
  //   — Result = estimated illumination without content
  // Step 4: Normalize: L_normalized = (L_original / L_illumination) * 255
  // Step 5: Recombine with A and B channels
  // Step 6: Convert back to RGB

  // Additional: CLAHE (Contrast Limited Adaptive Histogram Equalization)
  //   — clipLimit=2.0, tileGridSize=8x8
  //   — Enhances local contrast without amplifying noise

  // Result: flat, evenly lit document regardless of shadow source
}
```

### Mode: `whiteboard` — Whiteboard Algorithm

```ts
async function whiteboardEnhance(imageUri: string): Promise<string> {
  // Step 1: Shadow removal (as above)
  // Step 2: Color normalization — detect marker colors, boost saturation
  // Step 3: Background detection:
  //   — Sample 10% of pixels near edges
  //   — Compute median color — that's the board background
  // Step 4: Replace background color range with pure white
  //   — Tolerance: ΔE < 20 (CIEDE2000 color distance)
  // Step 5: Boost saturation of non-background pixels (×1.4)
  // Step 6: Light sharpening (unsharp mask σ=1.0, strength=1.2)

  // Result: clean white background, vibrant marker colors
}
```

### Mode: `book` — Curved Page Correction

```ts
async function bookEnhance(imageUri: string): Promise<string> {
  // Addresses curved pages from book spine

  // Step 1: Detect spine position (vertical dark band near center)
  // Step 2: Estimate page curl using horizontal line profiles
  //   — Sample horizontal lines at 20 positions
  //   — Fit polynomial curve to text baseline positions
  //   — Curve coefficients → warp parameters

  // Step 3: Dewarp correction
  //   — Apply inverse polynomial warp to flatten page
  //   — Use bicubic interpolation (preserves quality)

  // Step 4: Shadow removal at spine (darkest area)
  // Step 5: Standard document enhancement

  // Result: flat, readable text even from thick book scans
}
```

---

## ENGINE 4 — AUTO-CAPTURE ENGINE

**File:** `src/features/scanner/engines/autoCaptureEngine.ts`

This makes Flashora feel like a professional app — the camera captures automatically when conditions are perfect.

```ts
export interface AutoCaptureConfig {
  enabled:             boolean;  // user toggle in settings
  stabilityFrames:     number;   // consecutive stable frames required (default: 12)
  minConfidence:       number;   // minimum edge detection confidence (default: 0.82)
  minBlurScore:        number;   // minimum sharpness score (default: 0.65)
  minLightingScore:    number;   // minimum lighting quality (default: 0.35)
  captureDelay:        number;   // ms after stability achieved before capture (default: 300)
  cooldownMs:          number;   // ms before next auto-capture allowed (default: 1500)
}

// State machine:
// SCANNING → DETECTING → STABILIZING → COUNTDOWN → CAPTURED → COOLDOWN → SCANNING

export type AutoCaptureState =
  | 'SCANNING'      // No document visible
  | 'DETECTING'     // Document found, not stable yet
  | 'STABILIZING'   // Stable, counting down
  | 'CAPTURING'     // Shutter triggered
  | 'COOLDOWN';     // Post-capture cooldown

// UI feedback per state:
// SCANNING:     Blue overlay pulse animation (looking...)
// DETECTING:    Corners appear, yellow (#F59E0B)
// STABILIZING:  Corners turn blue, circular progress arc fills
// CAPTURING:    White flash, camera sound/haptic
// COOLDOWN:     Green checkmark briefly, then reset
```

### Countdown Arc UI

```tsx
// When STABILIZING: show a circular progress arc around capture button
// Duration: captureDelay ms (300ms default)
// Color: #0EA5E9
// Stroke: 3px
// Fills clockwise from top
// When full → auto-capture triggers
// User can tap capture button at any point to capture immediately
```

---

## ENGINE 5 — QUALITY VALIDATION ENGINE

**File:** `src/features/scanner/engines/qualityEngine.ts`

```ts
export interface QualityReport {
  overallScore:   number;    // 0–100
  isAcceptable:   boolean;   // score > 60
  issues:         QualityIssue[];
  recommendation: string;    // human-readable action
}

export type QualityIssue =
  | 'EDGE_SOFTNESS'       // text edges are blurry
  | 'LOW_CONTRAST'        // text-background contrast < 4.5:1 (WCAG AA)
  | 'SHADOW_REMNANT'      // shadow not fully removed
  | 'PERSPECTIVE_ERROR'   // text lines not horizontal
  | 'MOIRÉ_PATTERN'       // moiré detected (printed source)
  | 'NOISE'               // excessive grain
  | 'COMPRESSION_ARTIFACT'; // JPEG blocking visible

// Run after enhancement — before showing preview
// If isAcceptable = false: show "Rescan for better quality" option
// Never block the user — they can proceed with any result
```

---

## CAMERA SCREEN — PRO UPGRADE

**File:** `app/scanner/camera.tsx` — full rewrite

### New UI Elements

```tsx
// 1. DOCUMENT GUIDANCE OVERLAY
// Semi-transparent document frame guide in center of viewfinder
// Dashed white border showing ideal document placement area
// Covers 85% of screen width, proportional height
// When document fills this area: guidance fades out
// Text below: "Align document to the guide" (fades when doc detected)

// 2. REAL-TIME WARNING BANNER
// Position: top of screen, below header
// bg: rgba(0,0,0,0.6), padding: 8px 18px, borderRadius: 8
// icon (14px) + warning message text (12px)
// Fades in/out as warnings change — never jarring
// One warning at a time — highest priority only

// 3. STABILITY INDICATOR
// Position: top-right of edge overlay quad
// Small pill: shows stability progress
// "hold still..." → fills bar → "✓ captured!"
// Only appears when confidence > 0.7

// 4. AUTO-CAPTURE PROGRESS ARC
// Around capture button when in STABILIZING state
// Circular arc fills over captureDelay ms
// Color: #0EA5E9, strokeWidth: 3
// Built with react-native-svg or Skia

// 5. SCAN MODE SELECTOR
// Bottom left of screen (above page strip)
// Horizontal scrollable mode chips:
//   "Document" | "Photo" | "Whiteboard" | "Book" | "ID Card" | "Receipt"
// Selected mode: white text, #0EA5E9 background
// Each mode sets both detection behavior AND enhancement preset
// Auto mode selected by default

// 6. QUALITY INDICATOR
// Top of quad overlay — small dot
// Green (●) = excellent conditions
// Yellow (●) = acceptable — will capture
// Red (●) = poor — warning shown
// Updates in real-time from frame processor

// 7. FLASH STATES
// 3 states: Off (⚡̶) → On (⚡) → Auto (⚡A)
// Smart flash: In Auto mode, fires if lightingScore < 0.35
```

### Camera Settings Sheet

```tsx
// Triggered by Settings icon (top right)
// @gorhom/bottom-sheet — snapPoints: ['50%']
// Settings:
//   Auto-capture toggle (default: ON)
//   Capture delay: 300ms / 600ms / 1000ms
//   Output quality: Standard / High / Archival (Archival = Premium)
//   Page size: Auto / A4 / Letter / Business Card / Receipt
//   Color mode: Auto / Document / B&W / Photo (default for session)
//   Grid overlay toggle (rule-of-thirds guide)
```

---

## CROP & ADJUST SCREEN — PRO UPGRADE

**File:** `app/scanner/adjust.tsx` — full rewrite

### Precision Corner Handles

```tsx
// Handles must be large enough for finger precision but not obscure content
// Outer: 28x28 circle, bg transparent, border 2px solid #0EA5E9
// Inner dot: 10x10 circle, bg #0EA5E9
// Tap target: 44x44 (accessibility minimum)

// Handle snap behavior:
// — When dragged near a straight edge: snaps to detected line (within 8px)
// — When dragged to corner: shows magnetic snap indicator
// — Haptic feedback on snap: impactOccurred('light')

// Edge midpoint handles:
// — 4 additional handles at midpoints of each edge
// — Smaller: 20x20 circle, semi-transparent
// — Dragging midpoint: moves both adjacent corners proportionally
// — This is how Adobe Scan does edge-dragging — much more precise
```

### Pinch-to-Zoom on Canvas

```tsx
// User can pinch to zoom the crop canvas
// Min: fit-to-screen, Max: 3x
// Allows pixel-level precision on corner placement
// Zoom level indicator: small pill in corner (e.g. "2.1×")
// Double-tap: reset to fit-to-screen
```

### Straighten Tool

```tsx
// Rotation dial below the canvas
// Range: -15° to +15°
// Visual: tick marks, current value shown
// Auto-detect skew: compute angle of text lines, suggest correction
// "Auto straighten" button: applies detected skew correction
// This fixes documents placed slightly crooked
```

### Edge Line Detection Visualization

```tsx
// Show detected Hough lines as semi-transparent overlays
// Color: rgba(14,165,233,0.2)
// Helps user understand what the algorithm sees
// Toggle: "Show detected lines" chip button
// Advanced users can use this to manually correct misdetected quads
```

---

## ENHANCE SCREEN — PRO UPGRADE

**File:** `app/scanner/enhance.tsx` — full rewrite

### Split-Screen Before/After

```tsx
// Instead of toggle — show split screen with draggable divider
// Left side: original corrected image
// Right side: enhanced image
// Center: draggable divider bar (vertical line, 2px, white)
//   - Handle: circular 28px pill at center of divider
// Drag left: see more original
// Drag right: see more enhanced
// This is the professional approach used by Lightroom mobile
```

### Advanced Enhancement Controls

```tsx
// Collapsible "Advanced" section below mode pills

Advanced Controls (shown when "Advanced" toggle tapped):

  Threshold      ──●───── (only for document/bw modes)
  Denoise        ──●─────
  Sharpness      ──●─────
  Warmth         ──●───── (only for photo/auto modes)
  Shadows        ──●───── (lift shadow detail)
  Highlights     ──●───── (recover blown highlights)

// Basic section (always visible):
  Brightness     ──●─────
  Contrast       ──●─────

// Reset button: "Reset to defaults" — restores mode defaults
// All changes debounced 250ms before re-processing
```

### Page Consistency Mode (Multi-page)

```tsx
// When session has > 1 page:
// Toggle: "Match all pages" (default: ON)
// When ON: enhancement settings applied equally to all pages
//   — White balance matched to page 1
//   — Brightness/contrast normalized across all pages
//   — Prevents inconsistent-looking multi-page PDFs
// When OFF: each page enhanced independently
```

---

## EXPORT SCREEN — PRO UPGRADE

**File:** `app/scanner/export.tsx` — full rewrite

### OCR Integration (Text Recognition)

```tsx
// Uses @react-native-ml-kit/text-recognition (on-device, free)
// Runs automatically after enhancement if > 1 page scanned
// Status shown in export screen: "Reading text..." spinner

// Benefits:
// PDF output: embeds hidden text layer (searchable PDF)
// DOCX output: actual editable text + images (not just images)
// Copy text: "Copy text" button appears if OCR successful

// OCR Progress UI:
//   Small banner above format cards
//   icon: FileSearch (lucide) + "Making PDF searchable..."
//   Color: rgba(14,165,233,0.08), border rgba(14,165,233,0.2)
//   Disappears when complete — no dismissal needed
```

### PDF Export Options

```tsx
// When PDF selected — show sub-options:

PDF Options:
  Searchable PDF  ●  (default — requires OCR complete)
  Image-only PDF  ○  (faster, no OCR)

  Page size:
  [ Auto ]  [ A4 ]  [ Letter ]  [ Custom ]

  Compression:
  [ Balanced ]  [ Smallest ]  [ Best Quality ]
  //  Balanced:     JPEG 85% embedded images
  //  Smallest:     JPEG 70% + PDF compression
  //  Best Quality: JPEG 95% or PNG

  Include metadata: toggle (file name, creation date, device info)
```

### Image Export Options

```tsx
// When Image selected:

Format:
  [ JPG ]  [ PNG ]  [ WebP ]

Quality (JPG/WebP only):
  ──●───── 85%   (default)
  Range: 60% – 100%

Separate files:  toggle
  ON:  each page = separate image file (zipped if > 1)
  OFF: pages combined in a scrollable image strip (single tall image)
```

### DOCX Export Options (Premium)

```tsx
// When DOCX selected:

Content:
  ● Images + extracted text  (if OCR available)
  ○ Images only

Page layout:
  [ Full page image ]  [ Inline with margins ]

Font for OCR text:
  [ System Default ]  [ Times New Roman ]  [ Arial ]

Include page numbers: toggle
```

### Batch Share Options

```tsx
// New: "Send via..." section with direct integrations

Send via:
  [ 💬 WhatsApp ]  [ 📧 Email ]  [ ☁️ Drive ]  [ 🗂️ Files ]

// Each taps into native share sheet pre-filtered to that app
// Or falls back to generic expo-sharing
// Drive integration: uses Google Drive MCP if connected
```

---

## SCAN MODES — FULL SPECIFICATION

Each mode controls detection behavior + enhancement preset:

### Document Mode (default)
```
Detection:    Standard quadrilateral detection
Enhancement:  Shadow removal → adaptive threshold → ink darken → sharpen
Output:       High contrast black text, white background
Best for:     Printed documents, contracts, letters, forms
```

### Photo Mode
```
Detection:    Standard — with color preservation flag
Enhancement:  Illumination normalization → CLAHE → mild sharpening
Output:       Natural colors, no threshold applied
Best for:     Photographs, colored illustrations, magazine pages
```

### Whiteboard Mode
```
Detection:    Large area detection (fills most of frame)
Enhancement:  Aggressive background removal → marker color boost
Output:       Pure white background, vibrant marker colors
Best for:     Whiteboards, blackboards, presentation slides
```

### Book Mode
```
Detection:    Curved edge detection (non-rigid quad)
Enhancement:  Dewarp → shadow removal (spine shadow) → document enhance
Output:       Flattened, readable text from curved pages
Best for:     Books, magazines, notebooks
Auto-split:   Optional — detect spine, split into 2 pages automatically
```

### ID Card Mode
```
Detection:    Fixed aspect (CR80 standard: 85.6mm × 53.98mm)
Enhancement:  Mild — preserve holographic/color elements
Output:       Color-accurate, sharp edges, no over-processing
Best for:     ID cards, credit cards, business cards
```

### Receipt Mode
```
Detection:    Tall narrow detection (portrait orientation emphasized)
Enhancement:  High contrast, thermal paper compensation (tends toward gray)
Output:       Clear text, even narrow column text readable
Best for:     Receipts, narrow tickets, labels
```

---

## HISTORY & SESSION MANAGEMENT

**File:** `src/features/scanner/store/useScannerStore.ts` — enhance existing

```ts
interface ScannerStore {
  // Existing fields +

  // Quality tracking
  qualityReports:    Record<string, QualityReport>;  // pageId → report
  sessionMode:       ScanMode;                        // active scan mode
  autoCapture:       boolean;                         // user preference

  // OCR
  ocrResults:        Record<string, string>;  // pageId → extracted text
  ocrStatus:         'idle' | 'running' | 'complete' | 'failed';

  // Session persistence
  savedSessions:     ScanSession[];           // last 20 sessions
  addSession:        (s: ScanSession) => void;
  deleteSession:     (id: string) => void;

  // Quality actions
  setQualityReport:  (pageId: string, r: QualityReport) => void;
  setOcrResult:      (pageId: string, text: string) => void;
}
```

### Session History Screen

```
Route: /scanner/history

Shows last 20 scan sessions:
  — Thumbnail of first page
  — Date + time
  — Page count
  — Export format used
  — Tap: re-open session for additional export or editing
  — Swipe left: delete session

Accessible from Scanner home screen (clock icon in header)
```

---

## ERROR HANDLING — PRO LEVEL

```ts
// Every engine must handle these — no silent failures

type ProScannerError =
  // Detection
  | 'FRAME_PROCESSOR_CRASH'    // restart frame processor silently
  | 'NO_DOCUMENT_TIMEOUT'      // user pointed camera for 30s, nothing detected
  | 'DETECTION_LIBRARY_MISSING' // native lib not linked — fallback to manual

  // Perspective
  | 'HOMOGRAPHY_SINGULAR'      // quad is degenerate (self-intersecting)
  | 'OUTPUT_TOO_LARGE'         // archival resolution exceeds available memory
  | 'SKIA_RENDER_FAILED'       // GPU pipeline failure — fallback to CPU

  // Enhancement
  | 'ENHANCEMENT_OOM'          // out of memory during processing
  | 'INVALID_COLOR_SPACE'      // unsupported image format from camera

  // OCR
  | 'OCR_TIMEOUT'              // exceeded 8 seconds — skip OCR silently
  | 'OCR_NO_TEXT_FOUND'        // no text detected — offer image-only PDF

  // Export
  | 'PDF_GENERATION_FAILED'
  | 'DOCX_GENERATION_FAILED'
  | 'STORAGE_PERMISSION_DENIED'
  | 'INSUFFICIENT_STORAGE'

// Recovery rules:
// FRAME_PROCESSOR_CRASH     → restart automatically (max 3 times)
// DETECTION_LIBRARY_MISSING → show manual corner guide, user places corners
// HOMOGRAPHY_SINGULAR       → show "adjust corners" screen, highlight bad corner
// ENHANCEMENT_OOM           → downscale to standard quality, notify user
// OCR_TIMEOUT               → continue without OCR, image-only PDF
// All others                → show specific message + retry option
```

---

## PERFORMANCE REQUIREMENTS — PRO LEVEL

```
Metric                              Target     Method
──────────────────────────────────  ─────────  ─────────────────────────────────────
Frame processor latency             < 16ms     Worklet on UI thread, no JS bridge
Edge detection per frame            < 12ms     Native JNI, not JS
Auto-capture trigger lag            < 50ms     Reanimated shared values
Perspective correction              < 1.8s     Skia GPU pipeline
Enhancement (document mode)         < 2.5s     GPU + optimized algorithms
Enhancement (book mode)             < 4.0s     Dewarp is expensive — show progress
OCR (single page, A4)               < 5.0s     MLKit on-device
OCR (5 pages)                       < 15s      Run pages in parallel
PDF export (5 pages, high quality)  < 6.0s     
Memory during session (5 pages)     < 280MB    Release raw frames after enhancement
Battery drain per scan session      Minimal    Stop camera on background, on adjust/enhance
```

---

## TESTING — PRO SCANNER QUALITY CHECKLIST

### Detection Tests

```
[ ] Plain white paper on wooden desk → detected in < 1 second
[ ] Document on patterned tablecloth → detected correctly
[ ] Document with hand shadow → detected, shadow warning shown
[ ] Low light room (< 50 lux) → TOO_DARK warning, still detects
[ ] Crumpled/folded document → corners detected or user prompted
[ ] Very small document (business card) → ID Card mode works
[ ] Very large document (A3) → partial detection handled gracefully
[ ] Book (open, curved) → Book mode dewarp applied
[ ] Whiteboard at angle → Whiteboard mode detects despite perspective
```

### Enhancement Tests

```
[ ] Document mode: black text on white = zero gray background
[ ] Shadow test: hand shadow removed completely
[ ] Book spine: dark shadow at spine lightened
[ ] Whiteboard: marker colors remain vibrant, background pure white
[ ] Thermal receipt: gray text → high contrast black
[ ] Color photo: natural colors preserved, no threshold applied
[ ] Multi-page: pages 1-5 have consistent white balance
```

### Output Quality Tests

```
[ ] Standard quality JPEG: 9pt font readable at 100% zoom
[ ] High quality JPEG: 8pt font readable at 100% zoom
[ ] Archival PNG: 7pt font readable at 100% zoom
[ ] PDF: text layer present and selectable (after OCR)
[ ] PDF: file size under 2MB for 5-page standard quality
[ ] DOCX: opens in Microsoft Word without errors
[ ] DOCX: extracted text is > 90% accurate for printed docs
```

---

## EXECUTION ORDER

### Step 0 — Audit
Scan current scanner implementation. Report:
- Current detection library + version
- Current perspective method
- Current enhancement pipeline
- Performance baseline (measure current correction time)

### Step 1 — Detection Engine
Build `frameProcessor.ts` + `detectionEngine.ts`. Test on real device.
Verify 30fps frame processing with zero dropped frames.

### Step 2 — Perspective Engine
Build `perspectiveEngine.ts`. Test with extreme angles (60° tilt).
Verify text lines are horizontal in output.

### Step 3 — Enhancement Engine
Build `enhancementEngine.ts` — all 8 modes.
Test each mode with real document photos.
Shadow removal and document mode are highest priority.

### Step 4 — Auto-Capture Engine
Build `autoCaptureEngine.ts`.
Test stability detection — must not false-trigger.

### Step 5 — Quality Engine
Build `qualityEngine.ts`.
Integrate into post-enhancement pipeline.

### Step 6 — OCR Integration
Install + configure MLKit text recognition.
Test on printed and handwritten documents.
Verify searchable PDF output.

### Step 7 — Screen Upgrades
Rebuild all 4 screens with pro UI components.
Integrate all engines into screen hooks.

### Step 8 — Performance Profiling
Run Flashlight (Android profiler) on full scan session.
Target: < 280MB peak memory, < 16ms frame processor.

### Step 9 — Quality Testing
Run full checklist above on physical Android device.
Test: Samsung Galaxy A-series (mid-range), Pixel (flagship).

### Step 10 — Regression
Verify all existing Flashora features still work.
TypeScript: zero errors.
---

## EXECUTION COMMAND FOR CLAUDE CODE

```
Read FLASHORA_PROSCIANNER_PROMPT.md fully before writing any code.
Also reference FLASHORA_MASTER_PROMPT.md and FLASHORA_SCANNER_PROMPT.md.

Begin with Step 0 — audit the current scanner implementation:
1. Read all files in src/features/scanner/
2. Read app/scanner/*.tsx
3. Check package.json for current scanner-related dependencies
4. Measure or estimate current perspective correction quality
5. Report what exists, what is lacking, and what needs full replacement

Do not write any code until I confirm the audit report.
After confirmation, execute steps 1 through 10 sequentially.
Stop and wait for my approval after each step.
```
