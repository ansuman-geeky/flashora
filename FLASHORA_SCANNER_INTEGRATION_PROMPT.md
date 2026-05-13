# FLASHORA — ADD SMART SCANNER TO EXISTING APP
### *Inject Scanner Feature into Production Codebase*
> Integration Prompt | Use this when app is already built | Zero regression policy

---

## CONTEXT

The Flashora app is **already built and working**. All existing features (PDF Tools, QR Tools, Image Tools, File Converter, URL Shortener, Navigation, Ads, Firebase, Premium) are complete and functional.

**Your job:** Add the Smart Scanner feature to the existing codebase without breaking anything that already works.

**Read before touching any file:**
1. `FLASHORA_MASTER_PROMPT.md` — full app spec and architecture rules
2. `FLASHORA_SCANNER_PROMPT.md` — complete scanner feature specification
3. Scan the existing codebase structure first — understand what exists before writing a single line

---

## PRIME DIRECTIVE

```
DO NOT modify any existing working file unless absolutely required for integration.
Every change to an existing file must be additive only — no deletions, no refactors.
If a change to an existing file is needed, state exactly what line changes and why.
The app must compile and run after every single file addition.
```

---

## STEP 0 — AUDIT FIRST (DO THIS BEFORE WRITING ANY CODE)

Before writing a single file, run a full codebase audit. Report back:

```
1. Current folder structure (tree output)
2. Existing package.json dependencies
3. Current navigation setup — how tabs and stacks are defined
4. How the Tools grid is currently built — component name, file path, data source
5. How Quick Actions on Home screen are built — component name, data array location
6. How Activity / History is stored — store file, data shape
7. How Premium gating is implemented — which hook/store/component
8. How AdMob interstitial is triggered post tool-completion
9. Current design token file locations (colors, spacing, etc.)
10. Any existing camera or image-picker usage (to avoid permission conflicts)
```

**Stop after the audit. Show me the report. Wait for my confirmation before proceeding.**

---

## STEP 1 — DEPENDENCY INSTALLATION

After audit is confirmed, install only the packages that are NOT already in `package.json`:

```bash
# Check each before installing — do not reinstall existing packages

npx expo install react-native-vision-camera
npx expo install react-native-document-scanner-plugin
npx expo install @shopify/react-native-skia
npx expo install react-native-draggable-flatlist

npm install docx
```

### Expo Plugin Registration

Add to `app.config.ts` plugins array (additive only — do not remove existing plugins):

```ts
// ADD these entries to the existing plugins array

[
  'react-native-vision-camera',
  {
    cameraPermissionText: 'Flashora needs camera access to scan documents.',
    enableMicrophonePermission: false,
  }
],
'react-native-document-scanner-plugin',
```

### Android Permissions

Add to `app.config.ts` android.permissions array (additive):

```ts
// ADD to existing android.permissions — do not replace the array

'android.permission.CAMERA',           // if not already present
'android.permission.READ_MEDIA_IMAGES' // if not already present
```

**After installation:** run `npx expo prebuild --clean` to regenerate native files.
Confirm zero build errors before proceeding to Step 2.

---

## STEP 2 — CREATE SCANNER FILES (NEW FILES ONLY)

Create every file below from scratch. These are all new — they do not exist yet.

### 2a. Types

```
src/features/scanner/types/scanner.ts
```

Full type definitions as specified in `FLASHORA_SCANNER_PROMPT.md`:
- `EnhancementMode`, `ExportFormat`, `ExportQuality`
- `Corner`, `DocumentQuad`, `ScannedPage`, `ScanSession`
- `ExportOptions`, `ScannerState`, `ScannerError`

### 2b. Zustand Store

```
src/features/scanner/store/useScannerStore.ts
```

Zustand slice — matches existing store pattern in the codebase (check how other stores are structured and match exactly):
- `session`, `flashMode`, `enhancementMode`, `isProcessing`, `error`
- Actions: `startSession`, `addPage`, `removePage`, `reorderPages`, `updatePageQuad`, `setFlashMode`, `setEnhancement`, `setProcessing`, `setError`, `clearSession`

### 2c. Services (5 files)

```
src/features/scanner/services/edgeDetectionService.ts
src/features/scanner/services/perspectiveService.ts
src/features/scanner/services/enhancementService.ts
src/features/scanner/services/pdfExportService.ts
src/features/scanner/services/docxExportService.ts
```

Every service must:
- Be a pure async function — no side effects, no store access
- Have explicit TypeScript return types
- Have try/catch around every native/library call
- Log errors to Crashlytics before rethrowing
- Never crash the app — always return a safe fallback or throw a typed `ScannerError`

### 2d. Hooks (5 files)

```
src/features/scanner/hooks/useScanner.ts
src/features/scanner/hooks/useEdgeDetection.ts
src/features/scanner/hooks/useCropGestures.ts
src/features/scanner/hooks/useEnhancement.ts
src/features/scanner/hooks/useExport.ts
```

Every hook must:
- Follow the exact same pattern as existing hooks in the codebase
- Clean up all subscriptions and camera sessions in `useEffect` return
- Never hold strong references to image URIs after they're no longer needed

### 2e. Components (9 files)

```
src/features/scanner/components/CameraView.tsx
src/features/scanner/components/EdgeOverlay.tsx
src/features/scanner/components/CornerHandle.tsx
src/features/scanner/components/CropCanvas.tsx
src/features/scanner/components/PageStrip.tsx
src/features/scanner/components/CaptureButton.tsx
src/features/scanner/components/EnhancementModeBar.tsx
src/features/scanner/components/BeforeAfterToggle.tsx
src/features/scanner/components/ExportFormatCard.tsx
```

Every component must:
- Use the existing design token imports (match the pattern used in other features)
- Use NativeWind classes — no raw StyleSheet unless unavoidable
- Use `lucide-react-native` icons — no other icon library
- Be typed with explicit `Props` interface

### 2f. Screens (4 files)

```
app/scanner/camera.tsx
app/scanner/adjust.tsx
app/scanner/enhance.tsx
app/scanner/export.tsx
```

### 2g. Scanner Stack Layout

```
app/scanner/_layout.tsx
```

Stack navigator — full screen, no tab bar. Match the pattern of other stack layouts already in the app.

### 2h. Feature Index

```
src/features/scanner/index.ts
```

Public exports for the scanner feature module.

---

## STEP 3 — INTEGRATE INTO EXISTING FILES

These are the **only** existing files that need modification. Each change is additive — a new entry in an existing array or a new import.

### 3a. Tools Grid

**File:** (check audit result — likely `src/features/home/components/QuickActions.tsx` or `src/constants/tools.ts`)

Add scanner entry to the tools array:

```ts
// ADD this entry — do not modify existing entries

{
  id:          'scanner',
  name:        'Smart Scanner',
  description: 'Scan docs, books & receipts',
  icon:        'ScanLine',
  color:       '#0EA5E9',
  route:       '/scanner/camera',
  badge:       'NEW',
  position:    0,   // first in grid
  category:    'productivity',
}
```

### 3b. Home Screen Quick Actions

**File:** (check audit result — likely `src/features/home/` directory)

Add to quick actions array:

```ts
// ADD this entry — do not modify existing entries

{
  id:    'scanner',
  label: 'Scan Doc',
  icon:  'ScanLine',
  color: '#0EA5E9',
  route: '/scanner/camera',
  badge: 'NEW',
}
```

### 3c. Activity / History Store

**File:** (check audit result — likely `src/store/useHistoryStore.ts`)

Add `'scanner'` to the existing `ToolId` type union:

```ts
// BEFORE (example — match actual type name in codebase):
type ToolId = 'pdf' | 'qr' | 'image' | 'converter' | 'url-shortener';

// AFTER:
type ToolId = 'pdf' | 'qr' | 'image' | 'converter' | 'url-shortener' | 'scanner';
```

No other changes to history store needed — scanner uses the same existing `addHistoryEntry` action.

### 3d. AdMob Interstitial Trigger

**File:** (check audit result — likely `src/services/adService.ts` or `src/hooks/useAds.ts`)

The scanner export screen should trigger the interstitial ad on successful export, exactly like other tools do. Check the existing pattern — likely `showInterstitialAd('scanner')` — and call it from `useExport.ts` after successful save.

No changes to `adService.ts` needed if it already accepts a generic `toolId` string.

### 3e. Analytics

**File:** `src/services/analytics.ts`

Add scanner events to the existing event type union (additive):

```ts
// ADD to existing FlashoraEvent type

| 'scanner_open'
| 'scanner_capture'
| 'scanner_edge_auto'
| 'scanner_edge_manual'
| 'scanner_enhance'
| 'scanner_export'
| 'scanner_export_gate'
| 'scanner_failure'
```

### 3f. Premium Store / Gating

**File:** (check audit result — likely `src/store/usePremiumStore.ts` or `src/features/premium/`)

Add scanner premium features to the existing premium features list:

```ts
// ADD to existing premiumFeatures config — do not modify existing entries

scanner_unlimited_pages:    { free: 3,     premium: Infinity },
scanner_docx_export:        { free: false, premium: true },
scanner_high_quality:       { free: false, premium: true },
scanner_batch_gallery:      { free: false, premium: true },
```

---

## STEP 4 — REGRESSION TESTING

After all files are created and integrations are done, verify:

### 4a. Existing Features — Smoke Test

Run through each existing tool and confirm it still works:

```
[ ] PDF Tools — open, process, save
[ ] QR Tools — scan, generate
[ ] Image Tools — compress, resize
[ ] File Converter — convert a file
[ ] URL Shortener — shorten a URL
[ ] Navigation — all 5 tabs navigate correctly
[ ] Home screen — quick actions, recent tools render
[ ] Premium screen — renders, gate logic works
[ ] Settings — renders
[ ] AdMob — no crash on ad load
[ ] Activity / History — entries show correctly
```

### 4b. Scanner Feature — Full Flow Test

```
[ ] Camera opens without crash
[ ] Camera permission prompt appears (first open only)
[ ] Edge detection runs — auto quad appears on document
[ ] Manual corner drag works
[ ] All 5 enhancement modes render correct preview
[ ] Brightness / contrast sliders update preview
[ ] Before/After toggle works
[ ] Multi-page: add page 2 and 3 — page strip shows thumbnails
[ ] Reorder pages — drag works
[ ] Delete page — removed from strip
[ ] Export as Image — saves to device
[ ] Export as PDF — saves to device
[ ] Export as Doc — shows premium gate (free user)
[ ] Export as Doc — completes (premium user)
[ ] High quality export — shows premium gate (free user)
[ ] Activity history — scan entry appears after export
[ ] Interstitial ad — shows after successful export
[ ] Scanner appears in Tools grid (position 0)
[ ] Scanner appears in Home quick actions with NEW badge
[ ] Dark mode — all scanner screens render correctly
[ ] Back navigation — no stuck screens, no memory leaks
[ ] Kill app mid-scan — no corrupted state on reopen
```

### 4c. TypeScript Check

```bash
npx tsc --noEmit
```

Must return: **zero errors**.

### 4d. Bundle Check

```bash
npx expo export --platform android --dev false
```

Must complete without warnings about missing imports or unresolved modules.

---

## STEP 5 — FINAL REPORT

After all steps are complete, provide:

```
## SCANNER INTEGRATION COMPLETE

### New Files Created
[list with paths and one-line descriptions]

### Existing Files Modified
[list with paths, exactly what was changed, and why]

### Dependencies Added
[list with versions]

### Known Limitations
[anything the user should be aware of]

### Test Results
[pass/fail for each checklist item above]

### Recommended Next Steps
[e.g. real-device testing, Play Store update, OTA push via EAS Update]
```

---

## EXECUTION RULES — ACTIVE FOR THIS SESSION

```
Rule 1   Read the full codebase before writing anything
Rule 2   Match every existing pattern — naming, imports, structure
Rule 3   New files only — existing files get additive changes only
Rule 4   Every file compiles — run tsc check mentally before outputting
Rule 5   Zero placeholders — full file content always
Rule 6   State every existing-file change explicitly before making it
Rule 7   Stop and ask if any integration point is ambiguous
Rule 8   Crash prevention checklist must pass before marking complete
```

---

## START NOW

Begin with **Step 0 — Audit**.

Scan the entire project and report all 10 audit points listed above. Do not write any code yet. Show me the audit report and wait for my confirmation.
