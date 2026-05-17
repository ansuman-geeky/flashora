# FLASHORA — SCANNER UI REDESIGN PROMPT
### *Implement the Approved UI/UX Screens into Production Code*
> Design-to-Code Prompt | Use after scanner feature is built | Pixel-perfect implementation

---

## CONTEXT

The Flashora app is built. The Scanner feature module exists at `src/features/scanner/`. The UI/UX screens have been designed and approved as wireframes. This prompt instructs Claude Code to replace the current scanner screen implementations with production-grade code that exactly matches the approved designs.

**Read before starting:**
1. `FLASHORA_MASTER_PROMPT.md` — app-wide design tokens, architecture rules
2. `FLASHORA_SCANNER_PROMPT.md` — scanner feature specification and component list
3. Existing scanner screen files — understand what's there before replacing anything

---

## DESIGN SYSTEM — SCANNER SPECIFIC

All values below are extracted directly from the approved UI screens. Use these exclusively.

### Color Tokens

```ts
// src/features/scanner/constants/scannerColors.ts

export const ScannerColors = {
  // Brand
  accent:           '#0EA5E9',   // Sky Blue — ALL interactive elements
  accentBg:         'rgba(14, 165, 233, 0.08)',
  accentBorder:     'rgba(14, 165, 233, 0.35)',
  accentMuted:      'rgba(14, 165, 233, 0.15)',

  // Surfaces (dark theme — scanner is always dark)
  bgApp:            '#0D0F14',   // App background
  bgCard:           '#161A23',   // Card / sheet surface
  bgElevated:       '#1E2330',   // Elevated elements
  bgOverlay:        'rgba(0, 0, 0, 0.45)',

  // Borders
  border:           '#252B38',   // Default border
  borderSubtle:     'rgba(37, 43, 56, 0.6)',

  // Text
  textPrimary:      '#F1F5F9',
  textSecondary:    '#94A3B8',
  textTertiary:     '#64748B',
  textAccent:       '#0EA5E9',

  // Format card icons
  pdfIconBg:        'rgba(239, 68, 68, 0.15)',
  pdfIconColor:     '#EF4444',
  imgIconBg:        'rgba(245, 158, 11, 0.15)',
  imgIconColor:     '#F59E0B',
  docIconBg:        'rgba(91, 95, 239, 0.15)',
  docIconColor:     '#5B5FEF',

  // Premium badge
  premiumBg:        'rgba(245, 158, 11, 0.15)',
  premiumBorder:    'rgba(245, 158, 11, 0.4)',
  premiumText:      '#F59E0B',

  // Detection overlay
  detectedBadgeBg:  'rgba(14, 165, 233, 0.18)',
  detectedBadgeBorder: 'rgba(14, 165, 233, 0.5)',
  edgeLineColor:    'rgba(14, 165, 233, 0.35)',
  cornerHandleColor: '#0EA5E9',
};
```

### Spacing & Shape

```ts
export const ScannerLayout = {
  screenPadding:    18,   // horizontal padding on all screens
  cardRadius:       12,   // border-radius for format cards
  pillRadius:       20,   // border-radius for mode pills
  buttonRadius:     12,   // primary action buttons
  cornerDotSize:    16,   // draggable corner handle diameter
  pageThumbW:       52,   // page thumbnail width
  pageThumbH:       68,   // page thumbnail height
  pageThumbRadius:  8,
  captureButtonOuter: 64,
  captureButtonInner: 50,
  headerHeight:     48,
  sliderTrackH:     4,
  sliderThumbSize:  14,
  formatIconSize:   36,   // format card icon box
  formatIconRadius: 8,
};
```

### Typography Scale (scanner screens)

```ts
export const ScannerTypography = {
  headerTitle:   { fontSize: 14, fontWeight: '500', color: '#F1F5F9' },
  headerAction:  { fontSize: 13, color: '#0EA5E9' },
  sectionLabel:  { fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  formatName:    { fontSize: 13, fontWeight: '500', color: '#F1F5F9' },
  formatDesc:    { fontSize: 11, color: '#64748B' },
  fileName:      { fontSize: 12, color: '#F1F5F9' },
  fileLabel:     { fontSize: 11, color: '#64748B' },
  badgeText:     { fontSize: 10, color: '#0EA5E9' },
  premiumText:   { fontSize: 10, color: '#F59E0B' },
  pageCount:     { fontSize: 11, color: '#64748B' },
  thumbNum:      { fontSize: 9,  color: '#64748B' },
  hintText:      { fontSize: 11, color: '#0EA5E9' },
  sliderLabel:   { fontSize: 12, color: '#64748B', width: 70 },
  pillText:      { fontSize: 12 },
  actionPrimary: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  actionSecondary:{ fontSize: 14, color: '#94A3B8' },
};
```

---

## SCREEN 1 — CAMERA VIEW

**File:** `app/scanner/camera.tsx`

### Layout Structure

```
<SafeAreaView> (edges: top only, bg: transparent)
  <StatusBar> (translucent, dark-content)
  <CameraView> (full screen, position: absolute, inset: 0)
  <HeaderBar> (position: absolute, top: 0, z: 10)
  <EdgeOverlay> (position: absolute, inset: 0, pointer-events: none)
  <DetectedBadge> (position: absolute, centered horizontally)
  <PageStrip> (position: absolute, bottom: 88)
  <CaptureBar> (position: absolute, bottom: 18)
</SafeAreaView>
```

### HeaderBar Component

```tsx
// Layout: space-between, horizontal, padding: 12px 18px
// Left:  Back button — circular 34x34, bg rgba(0,0,0,0.45), radius 50%, icon: ArrowLeft
// Right: Row with Flash toggle pill + Gallery button

// Flash pill:
//   bg: rgba(0,0,0,0.45), borderRadius: 12, padding: 4px 10px
//   icon: Zap (lucide), size: 11, text: flash mode label ("auto" | "on" | "off")
//   fontSize: 11, color: rgba(255,255,255,0.7)
//   cycles: off → on → auto on tap

// Gallery button:
//   circular 34x34, bg rgba(0,0,0,0.45), icon: Image (lucide)
```

### EdgeOverlay Component

```tsx
// SVG overlay covering full screen
// Quad corners drawn as L-shaped handles (not circles)
// Each corner: two rect elements — horizontal bar (20x3) + vertical bar (3x20)
// Corner color: #0EA5E9, borderRadius: 2
// Edge lines connecting corners:
//   - 4 lines (top, bottom, left, right)
//   - stroke: rgba(14,165,233,0.35), strokeWidth: 1.5
//   - no fill
// DetectedBadge (inside overlay, centered horizontally, ~60% down screen):
//   bg: rgba(14,165,233,0.18), border: 1px solid rgba(14,165,233,0.5)
//   borderRadius: 20, padding: 4px 14px
//   icon: ScanLine (lucide, 11px) + text "document detected"
//   fontSize: 11, color: #0EA5E9
//   Animate: fade in when confidence > 0.7, fade out otherwise
// When no document detected: show dashed rectangle overlay with
//   text: "point camera at a document" centered
//   color: rgba(255,255,255,0.35), fontSize: 12
```

### PageStrip Component

```tsx
// Horizontal ScrollView, non-paginated
// padding: 0 18px, gap: 8px, bottom: 88px
// Each captured page thumbnail:
//   size: 40x52, borderRadius: 6
//   bg: #2a2a2a, border: 1.5px solid rgba(14,165,233,0.6)
//   label: "pg N" — fontSize: 8, color: rgba(14,165,233,0.8)
// Add page button:
//   size: 40x52, borderRadius: 6
//   border: 1.5px dashed rgba(255,255,255,0.25)
//   "+" icon — fontSize: 20, color: rgba(255,255,255,0.35)
//   tapping triggers another capture
```

### CaptureBar Component

```tsx
// Horizontal row, centered, gap: 32px, bottom: 18px
// Left side button: circular 40x40, bg rgba(0,0,0,0.45)
//   icon: RotateCw (lucide) — retake / discard last
// Center: Capture button
//   Outer: 64x64 circle, bg: white, border: 4px solid rgba(255,255,255,0.3)
//   Inner: 50x50 circle, bg: white, border: 2px solid #0EA5E9
//   On press: scale animation 0.92 → 1.0 (100ms)
//   On press: haptic feedback (Notificationtype.Success)
// Right side button: circular 40x40, bg rgba(0,0,0,0.45)
//   icon: Settings (lucide) — scan settings sheet
```

### Camera Behavior

```tsx
// Use react-native-vision-camera
// torch: 'off' | 'on' — controlled by flash state
// photo: true, video: false
// On capture:
//   1. Flash white overlay briefly (150ms fade)
//   2. Run edgeDetectionService on captured photo URI
//   3. Navigate to /scanner/adjust with photo URI + detected quad
//   4. If pageStrip has existing pages: add to session, stay on camera
//      (user tapped "+" in strip)
```

---

## SCREEN 2 — CROP & ADJUST

**File:** `app/scanner/adjust.tsx`

### Layout Structure

```
<SafeAreaView> (bg: #0D0F14)
  <HeaderBar>
  <ImageCanvas>    ← react-native-skia canvas
  <ModeToggle>
  <HintCard>
  <ApplyButton>
</SafeAreaView>
```

### HeaderBar

```tsx
// space-between row, padding: 14px 18px 10px
// border-bottom: 0.5px solid #252B38
// Left:  "← retake" — color: #0EA5E9, fontSize: 13
// Center: "adjust corners" — fontSize: 14, fontWeight: 500, color: #F1F5F9
// Right: "apply →" — color: #0EA5E9, fontSize: 13
```

### ImageCanvas (CropCanvas component)

```tsx
// react-native-skia Canvas — margin: 16px 18px
// bg: #161A23, borderRadius: 12, height: 280
// border: 0.5px solid #252B38
// Renders:
//   1. Captured image (fitted inside canvas with padding 20px inset)
//   2. Semi-transparent quad overlay outside the crop area (rgba(0,0,0,0.4))
//   3. 4 corner drag handles:
//      - 16x16 circle, bg: #0EA5E9, border: 2px solid white
//      - Gesture handler: PanGesture, constrained to canvas bounds
//      - On drag: live redraws quad lines
//   4. Quad outline: stroke #0EA5E9, strokeWidth: 1.5, no fill
// Auto mode: quad positions come from edgeDetectionService result
// Manual mode: user can freely drag all 4 corners
```

### ModeToggle

```tsx
// Pill toggle: 2 options "auto detect" | "manual adjust"
// Container: bg #161A23, borderRadius: 10, padding: 3px
//   border: 0.5px solid #252B38, margin: 0 18px 14px
// Each option: flex:1, textAlign: center, padding: 7px
//   borderRadius: 8, fontSize: 12
// Active:  bg #0EA5E9, color white, fontWeight 500
// Inactive: color #94A3B8
// On toggle to "auto": re-run edge detection, animate corners to new positions
// On toggle to "manual": unlock all 4 corners for free drag
```

### HintCard

```tsx
// margin: 0 18px 14px
// bg: rgba(14,165,233,0.08), borderRadius: 10
// border: 0.5px solid rgba(14,165,233,0.2), padding: 10px 14px
// icon: InfoCircle (lucide, 14px) + text side by side
// text: "drag any corner to fine-tune the crop area"
// fontSize: 11, color: #0EA5E9
```

### ApplyButton

```tsx
// Full width minus 36px horizontal margin
// bg: #0EA5E9, borderRadius: 12, padding: 14px
// icon: Check (lucide) + text "apply & continue"
// fontSize: 14, fontWeight: 500, color: white
// On press:
//   1. Run perspectiveService with final quad
//   2. Show processing overlay (spinner, "correcting perspective...")
//   3. Navigate to /scanner/enhance with corrected image URI
```

---

## SCREEN 3 — ENHANCE

**File:** `app/scanner/enhance.tsx`

### Layout Structure

```
<SafeAreaView> (bg: #0D0F14)
  <HeaderBar>
  <PreviewCard>
  <ModeSection>
  <SliderSection>
  <DoneButton>
</SafeAreaView>
```

### HeaderBar

```tsx
// space-between row, padding: 14px 18px 10px
// border-bottom: 0.5px solid #252B38
// Left:  "← back" — color: #0EA5E9, fontSize: 13
// Center: "enhance" — fontSize: 14, fontWeight: 500, color: #F1F5F9
// Right: "done →" — color: #0EA5E9, fontSize: 13
```

### PreviewCard (BeforeAfterToggle component)

```tsx
// margin: 14px 18px
// borderRadius: 12, overflow: hidden, height: 200
// bg: renders the enhanced image (or original if showing "before")
// BeforeAfter toggle (bottom-right of card):
//   position: absolute, bottom: 10, right: 10
//   Container: bg rgba(0,0,0,0.5), borderRadius: 8, overflow: hidden
//   Two buttons side by side: "before" | "after"
//     fontSize: 10, padding: 4px 10px
//     Active:  bg rgba(255,255,255,0.15), color white
//     Inactive: color rgba(255,255,255,0.6)
//   Tapping "before": display raw perspectiveCorrected URI
//   Tapping "after":  display enhancedUri (re-runs enhancement if params changed)
```

### ModeSection (EnhancementModeBar component)

```tsx
// padding: 0 18px 14px
// Label: "enhancement mode" — fontSize: 11, color: #64748B, marginBottom: 10
// Horizontal ScrollView (showsHorizontalScrollIndicator: false)
//   gap: 8, paddingBottom: 4
// Mode pills (5 total):
//   Labels: "auto" | "b&w" | "grayscale" | "photo" | "whiteboard"
//   Each pill: padding 7px 14px, borderRadius: 20, fontSize: 12
//   Inactive: bg #161A23, border 0.5px solid #252B38, color #94A3B8
//   Active:   bg rgba(14,165,233,0.15), border rgba(14,165,233,0.5), color #0EA5E9
//   On select: run enhancementService with new mode, update preview
```

### SliderSection

```tsx
// padding: 0 18px 16px
// 3 sliders: Brightness | Contrast | Sharpness
// Each row: horizontal, alignItems center, gap: 10, marginBottom: 14
// Label: fontSize 12, color #64748B, width: 70, flexShrink: 0
// Track: flex 1, height 4, bg #252B38, borderRadius 2
// Fill:  height 4, bg #0EA5E9, borderRadius 2, width = value%
// Thumb: 14x14 circle, bg white, border 2px solid #0EA5E9
//         positioned at right edge of fill
// Default values: Brightness 55%, Contrast 65%, Sharpness 40%
// On change: debounce 300ms → re-run enhancementService → update preview
// Use react-native Slider (or @miblanchard/react-native-slider)
```

### DoneButton

```tsx
// margin: 0 18px
// bg: #0EA5E9, borderRadius: 12, padding: 14px
// icon: Check (lucide) + text "done"
// fontSize: 14, fontWeight: 500, color: white
// On press: save enhancedUri to store, navigate to /scanner/export
```

---

## SCREEN 4 — EXPORT

**File:** `app/scanner/export.tsx`

### Layout Structure

```
<SafeAreaView> (bg: #0D0F14)
  <HeaderBar>
  <PageCountLabel>
  <PageReorderStrip>
  <FormatSection>
  <FileNameRow>
  <ActionButtons>
</SafeAreaView>
```

### HeaderBar

```tsx
// space-between, padding: 14px 18px 10px
// border-bottom: 0.5px solid #252B38
// Left:  "← back" — color: #0EA5E9, fontSize: 13
// Center: "export"  — fontSize: 14, fontWeight: 500, color: #F1F5F9
// Right: empty spacer (width: 40) — symmetric layout
```

### PageCountLabel

```tsx
// padding: 12px 18px 8px
// text: "{N} pages scanned"
// fontSize: 11, color: #64748B
```

### PageReorderStrip

```tsx
// react-native-draggable-flatlist (horizontal)
// padding: 0 18px, paddingBottom: 16, gap: 8
// Each page thumbnail:
//   size: 52x68, borderRadius: 8
//   bg: #161A23, border: 0.5px solid #252B38
//   Inner white paper: 36x48, borderRadius: 3, bg: #f5f0e8
//   Page number badge: position absolute, bottom 4, right 5
//     fontSize: 9, color: #64748B
//   Long press: activates drag reorder
//   Swipe up or double-tap: delete page (show confirmation)
// Add page button (always last item):
//   size: 52x68, borderRadius: 8
//   border: 1.5px dashed rgba(14,165,233,0.35)
//   bg: rgba(14,165,233,0.05)
//   icon: Plus (lucide, 18px, color rgba(14,165,233,0.5))
//   tapping: navigate back to camera for another scan
```

### FormatSection

```tsx
// padding: 0 18px 14px
// Label: "export as" — fontSize: 11, color: #64748B, marginBottom: 10

// 3 format cards:

// Card container:
//   display: flex, flexDirection: row, alignItems: center
//   padding: 13px 14px, borderRadius: 12
//   bg: #161A23, border: 0.5px solid #252B38
//   marginBottom: 8, gap: 12
// Selected state:
//   bg: rgba(14,165,233,0.08), borderColor: rgba(14,165,233,0.5)

// Format Icon box (36x36, borderRadius: 8):
//   PDF:   bg rgba(239,68,68,0.15),  icon FileText,  color #EF4444
//   Image: bg rgba(245,158,11,0.15), icon Image,     color #F59E0B
//   Doc:   bg rgba(91,95,239,0.15),  icon FileWord,  color #5B5FEF

// Text block (flex: 1):
//   Name: fontSize 13, fontWeight 500, color #F1F5F9, marginBottom 2
//   Desc: fontSize 11, color #64748B

// Right element:
//   PDF + Image (free): Radio button
//     18x18 circle, border 1.5px solid #252B38
//     Selected: border + bg #0EA5E9, inner dot 7x7 white
//   Doc (premium): PRO badge
//     bg rgba(245,158,11,0.15), border 0.5px solid rgba(245,158,11,0.4)
//     borderRadius: 6, padding: 2px 7px
//     fontSize: 10, color: #F59E0B, text: "PRO"

// Doc card behavior:
//   Tapping when free user: open PremiumUpgradeSheet
//   Tapping when premium:   select .docx as format
```

### FileNameRow

```tsx
// margin: 0 18px 14px
// bg: #161A23, border: 0.5px solid #252B38
// borderRadius: 10, padding: 10px 14px
// Horizontal row, alignItems: center, gap: 10
// Label: "name" — fontSize: 11, color: #64748B, flexShrink: 0
// Value: fontSize 12, color: #F1F5F9, flex: 1
//   Default: "Scan_{YYYY}_{MM}_{DD}" — auto-generated
// Edit icon: Edit2 (lucide, 14px, color #64748B)
// On tap row: open inline text input to rename
```

### ActionButtons

```tsx
// padding: 0 18px
// Stack: flexDirection column, gap: 8

// Primary — Save to Device:
//   bg: #0EA5E9, borderRadius: 12, padding: 14px
//   flexDirection: row, alignItems: center, justifyContent: center, gap: 8
//   icon: Save (lucide, 16px) + text "save to device"
//   fontSize: 14, fontWeight: 500, color: white
//   On press:
//     1. Run export service (pdfExportService | imageExportService | docxExportService)
//     2. Show progress overlay: "exporting... {N} pages"
//     3. Save to MediaLibrary (expo-media-library)
//     4. Show success toast: "saved to your files"
//     5. Log analytics: scanner_export
//     6. Trigger interstitial ad (via existing adService)
//     7. Add to history store

// Secondary — Share:
//   bg: #161A23, border: 0.5px solid #252B38
//   borderRadius: 12, padding: 13px
//   flexDirection: row, alignItems: center, justifyContent: center, gap: 8
//   icon: Share2 (lucide, 16px) + text "share"
//   fontSize: 14, color: #94A3B8
//   On press: expo-sharing shareAsync with generated file URI
```

---

## SHARED COMPONENTS — EXACT SPECS

### Processing Overlay

```tsx
// Used on: adjust screen (perspective), export screen (generating file)
// Full screen overlay: bg rgba(13,15,20,0.85), position absolute, inset 0
// Center: vertical stack, alignItems center, gap 16
// Spinner: ActivityIndicator, color #0EA5E9, size large
// Text: fontSize 14, color #F1F5F9, fontWeight 500
// Sub-text: fontSize 12, color #64748B (e.g. "this may take a moment")
```

### Success Toast

```tsx
// position: absolute, bottom: 24, left: 18, right: 18
// bg: #161A23, borderRadius: 12
// border: 0.5px solid rgba(14,165,233,0.35)
// padding: 12px 16px
// flexDirection: row, alignItems: center, gap: 10
// icon: CheckCircle2 (lucide, 18px, color #00C98D)
// text: fontSize 13, color #F1F5F9
// Animate: slide up from bottom (translateY: 40 → 0, 200ms ease-out)
// Auto dismiss: after 2500ms (slide back down)
```

### Premium Upgrade Sheet (Bottom Sheet)

```tsx
// @gorhom/bottom-sheet — snapPoints: ['45%']
// bg: #161A23, borderRadius top: 20
// Content:
//   PRO badge pill: bg rgba(245,158,11,0.15), color #F59E0B, centered
//   Title: "unlock word doc export" — fontSize 18, fontWeight 500, color #F1F5F9
//   Description: fontSize 13, color #94A3B8, textAlign center
//   Upgrade button: full width, bg #0EA5E9, borderRadius 12, padding 14
//     text "upgrade to pro", fontSize 14, fontWeight 500, color white
//   Dismiss: "maybe later" link — fontSize 12, color #64748B, textAlign center, marginTop 12
```

---

## ANIMATION SPECIFICATIONS

```ts
// All animations use react-native-reanimated 3
// Max duration: 200ms
// Easing: Easing.out(Easing.ease)

Animations: {
  captureButtonPress: {
    scale:    [1, 0.92, 1],
    duration: 100,
  },
  detectedBadgeFadeIn: {
    opacity:  [0, 1],
    duration: 200,
  },
  cornerHandleDrag: {
    // useAnimatedStyle — live, no duration cap
    // SVG quad redraws on every frame via useDerivedValue
  },
  modeTabSwitch: {
    // background color interpolation: 150ms
  },
  toastSlideUp: {
    translateY: [40, 0],
    opacity:    [0, 1],
    duration:   200,
  },
  processingFadeIn: {
    opacity:  [0, 1],
    duration: 150,
  },
  screenTransition: {
    // Expo Router default — do not override
  },
}
```

---

## ICONS — EXACT MAPPING

All from `lucide-react-native`. No other icon library.

```
Screen 1 (Camera):
  Back button       → ArrowLeft      (18px)
  Flash toggle      → Zap            (11px)
  Gallery import    → Image          (18px)
  Rotate/Discard    → RotateCw       (16px)
  Settings          → Settings       (16px)
  Detected badge    → ScanLine       (11px)

Screen 2 (Adjust):
  Hint info         → Info           (14px)
  Apply button      → Check          (16px)

Screen 3 (Enhance):
  Done button       → Check          (16px)

Screen 4 (Export):
  Format — PDF      → FileText       (18px)
  Format — Image    → Image          (18px)
  Format — Doc      → FileText       (18px)  // use FileText, style differently
  Edit filename     → Pencil         (14px)
  Save button       → Save           (16px)
  Share button      → Share2         (16px)

Shared:
  Success toast     → CheckCircle2   (18px)
  Processing        → (ActivityIndicator only, no icon)
  Premium sheet     → (no icon, PRO text pill)
```

---

## NAVIGATION FLOW

```
/scanner/camera
    ↓ (capture tap)
/scanner/adjust   ← params: { photoUri, detectedQuad }
    ↓ (apply tap)
/scanner/enhance  ← params: { correctedUri }
    ↓ (done tap)
/scanner/export   ← params: { pages: ScannedPage[] }
    ↓ (save/share tap)
  → Success toast → stays on export (user can share again or go back)

Back navigation:
  export  → enhance  (pages preserved)
  enhance → adjust   (correctedUri preserved, re-crop)
  adjust  → camera   (retake — clears current page)
  camera  → previous screen (confirm discard session if pages exist)
```

---

## STEP-BY-STEP EXECUTION ORDER

### Step 0 — Audit Existing Scanner Screens

Before writing any code:
1. Read current `app/scanner/camera.tsx`, `adjust.tsx`, `enhance.tsx`, `export.tsx`
2. Read current `src/features/scanner/components/` — all existing components
3. Note what matches the spec above and what needs to change
4. Report: list of files to fully rewrite vs files to patch
5. Wait for confirmation before proceeding

### Step 1 — Create Design Constants File

```
src/features/scanner/constants/scannerColors.ts   ← NEW
src/features/scanner/constants/scannerLayout.ts   ← NEW
src/features/scanner/constants/scannerTypography.ts ← NEW
src/features/scanner/constants/index.ts           ← NEW
```

### Step 2 — Rebuild Shared Components

Rebuild these components to exactly match the spec above:
```
src/features/scanner/components/CaptureButton.tsx
src/features/scanner/components/EdgeOverlay.tsx
src/features/scanner/components/CornerHandle.tsx
src/features/scanner/components/PageStrip.tsx
src/features/scanner/components/EnhancementModeBar.tsx
src/features/scanner/components/BeforeAfterToggle.tsx
src/features/scanner/components/ExportFormatCard.tsx
src/features/scanner/components/ProcessingOverlay.tsx   ← NEW
src/features/scanner/components/SuccessToast.tsx        ← NEW
src/features/scanner/components/PremiumUpgradeSheet.tsx ← NEW
```

Each component: full implementation, typed Props, zero TODOs, dark theme only.

### Step 3 — Rebuild Screen 1: Camera

Rewrite `app/scanner/camera.tsx` to spec. Verify:
- [ ] HeaderBar renders with back, flash, gallery
- [ ] Camera feed covers full screen
- [ ] EdgeOverlay renders quad with L-shaped corners
- [ ] DetectedBadge fades in when document confidence > 0.7
- [ ] PageStrip shows captured pages + add button
- [ ] CaptureButton has scale animation + haptic
- [ ] Flash cycles off → on → auto

### Step 4 — Rebuild Screen 2: Adjust

Rewrite `app/scanner/adjust.tsx` to spec. Verify:
- [ ] Skia canvas renders image + draggable corners
- [ ] Corner handles constrained to canvas bounds
- [ ] Quad lines redraw live during drag
- [ ] Auto/Manual toggle works
- [ ] HintCard renders
- [ ] Processing overlay shows during perspectiveService call

### Step 5 — Rebuild Screen 3: Enhance

Rewrite `app/scanner/enhance.tsx` to spec. Verify:
- [ ] Preview renders enhanced image
- [ ] Before/After toggle switches between original and enhanced
- [ ] All 5 mode pills selectable
- [ ] Active pill: blue highlight
- [ ] 3 sliders render with correct fill and thumb positions
- [ ] Enhancement re-runs on mode/slider change (debounced 300ms)

### Step 6 — Rebuild Screen 4: Export

Rewrite `app/scanner/export.tsx` to spec. Verify:
- [ ] Page count label correct
- [ ] Page thumbnails draggable to reorder
- [ ] Add page button navigates back to camera
- [ ] 3 format cards render with correct icons + colors
- [ ] PDF selected by default (radio checked)
- [ ] Doc card shows PRO badge (not radio)
- [ ] Doc card tap shows PremiumUpgradeSheet for free users
- [ ] Filename auto-generated, editable inline
- [ ] Save button triggers export service + progress overlay + success toast + ad
- [ ] Share button triggers expo-sharing

### Step 7 — Regression Check

```
[ ] npx tsc --noEmit → zero errors
[ ] All 4 screens navigate correctly (camera → adjust → enhance → export)
[ ] Back navigation works on all screens
[ ] Session state preserved across screens
[ ] Existing app features unaffected (PDF, QR, Image, Converter, URL Shortener)
[ ] Dark mode renders correctly (scanner is always dark — no mode switch needed)
[ ] Large font accessibility: labels scale correctly
[ ] Screen reader: all icons have aria-label or are aria-hidden
```

### Step 8 — Final Report

After all steps complete:
```
## SCANNER UI REDESIGN COMPLETE

### Screens Rebuilt
[list with file paths]

### New Components Created
[list with paths and descriptions]

### Design Token Files Created
[list]

### Pixel Differences from Spec
[any intentional deviations and why]

### Known Limitations
[e.g. Skia canvas performance on low-end devices]

### Recommended Next Steps
[real-device testing, specific Android versions to verify]
```

---

## EXECUTION COMMAND

Paste this into your Claude Code session:

```
Read FLASHORA_SCANNER_REDESIGN_PROMPT.md fully.
Also have FLASHORA_MASTER_PROMPT.md and FLASHORA_SCANNER_PROMPT.md open as references.

Begin with Step 0 — audit the existing scanner screen files and components.
Report what exists vs what needs to be rebuilt.
Do not write any code until I confirm the audit.
```
