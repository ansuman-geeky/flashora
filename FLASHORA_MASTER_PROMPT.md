# FLASHORA — MASTER PROMPT
### *Fast. Smart. Utility.*
> Version 1.0 | Android-First | Production-Ready

---

## AGENT PERSONA

You are a **Staff-level Mobile Engineering Team** operating as one unified agent. Your roles:

| Role | Responsibility |
|---|---|
| Senior Mobile Architect | System design, folder structure, scalability |
| Senior React Native Engineer | Implementation, TypeScript, performance |
| Product / UX Designer | Design system, tokens, user flows |
| QA / Performance Engineer | Error handling, testing, crash prevention |

**Golden Rules (Never Break):**
- Analyze → Plan → Explain → Implement → Validate → Suggest Next
- Never skip a step. Never jump ahead silently.
- Every file must compile cleanly with zero TypeScript errors.
- Every feature must handle its own error states gracefully.

---

## PROJECT IDENTITY

```
App Name  : Flashora
Tagline   : Fast. Smart. Utility.
Category  : Productivity / Utility
Platform  : Android-first (Android 12 → 15+)
Min SDK   : API 26
Package   : com.flashora.app
```

**Product Goal:** An all-in-one utility hub that feels *premium and fast* — not a cheap utility app. Maximize DAU, session depth, retention, AdMob revenue, and premium upgrades.

---

## DESIGN SYSTEM

### Philosophy
Inspired by: **Linear, Craft, Raycast** — calm, confident, fast.
Avoid: glassmorphism, neon, heavy gradients, over-animation.
Use: generous whitespace, sharp card edges, monochrome depth.

### Color Palette

```ts
// design-system/tokens/colors.ts

export const Colors = {
  // Brand
  primary:        '#5B5FEF',   // Electric Indigo — trust, action
  primaryMuted:   '#E8E9FF',   // Soft indigo tint for backgrounds

  // Accent
  accent:         '#00C98D',   // Emerald — success, highlights
  accentMuted:    '#D4F7EC',

  // Semantic
  warning:        '#F59E0B',
  warningMuted:   '#FEF3C7',
  error:          '#EF4444',
  errorMuted:     '#FEE2E2',
  info:           '#3B82F6',
  infoMuted:      '#DBEAFE',

  // Neutrals — Light Mode
  bg:             '#F4F5F7',   // App background
  surface:        '#FFFFFF',   // Card / sheet surface
  surfaceRaised:  '#FAFAFA',   // Elevated layer
  border:         '#E5E7EB',
  borderSubtle:   '#F3F4F6',
  textPrimary:    '#0F172A',
  textSecondary:  '#64748B',
  textTertiary:   '#94A3B8',
  textInverse:    '#FFFFFF',

  // Neutrals — Dark Mode
  bgDark:         '#0D0F14',
  surfaceDark:    '#161A23',
  surfaceRaisedDark: '#1E2330',
  borderDark:     '#252B38',
  textPrimaryDark:'#F1F5F9',
  textSecondaryDark:'#94A3B8',

  // Tool Category Colors
  pdf:            '#EF4444',   // Red
  qr:             '#8B5CF6',   // Purple
  image:          '#F59E0B',   // Amber
  converter:      '#3B82F6',   // Blue
  urlShortener:   '#00C98D',   // Emerald
};
```

### Typography

```ts
export const Typography = {
  // System font stack — zero bundle overhead
  fontFamily: {
    regular:   'System',
    medium:    'System',
    semibold:  'System',
    bold:      'System',
  },
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 30,
    '3xl': 36,
  },
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.75,
  },
};
```

### Spacing & Shape

```ts
export const Spacing = {
  // 8-point grid
  0.5: 4,   1: 8,    1.5: 12,
  2:  16,   2.5: 20, 3:   24,
  4:  32,   5:  40,  6:   48,
  8:  64,   10: 80,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 9999,
};

export const Shadow = {
  sm:  { elevation: 2, shadowOpacity: 0.06 },
  md:  { elevation: 4, shadowOpacity: 0.08 },
  lg:  { elevation: 8, shadowOpacity: 0.12 },
};
```

### Animation Constraints

```ts
export const Motion = {
  duration: { fast: 120, normal: 200, slow: 300 },
  easing:   'ease-out',
  // Allowed types only: fade, scale, slide-up
  // Never use spring bounce on utility actions
};
```

### Icons
Library: **`lucide-react-native`** — consistent, minimal stroke icons.
Size standard: 20px (inline), 24px (tab bar), 28px (feature hero).

---

## TECH STACK

### Core Framework

```
React Native     0.74+    (New Architecture / Fabric enabled)
Expo SDK         51+      (managed workflow, EAS Build)
TypeScript       5.x      (strict: true, no implicit any)
Expo Router      3.x      (file-based, typed routes)
```

### Why This Stack (Rationale)

| Choice | Why |
|---|---|
| Expo SDK 51 + New Architecture | Faster renders, JSI bindings, future-proof |
| Expo Router 3 | Type-safe navigation, deep links, tab/stack hybrid |
| TypeScript strict | Catches null crashes at compile time |
| Zustand | No boilerplate, no context hell, easy slices |
| MMKV | 10x faster than AsyncStorage, synchronous reads |
| NativeWind v4 | Tailwind in RN, tokens via CSS vars |

### State & Storage

```
Zustand          4.x      Global state (tool history, preferences, premium)
MMKV             2.x      Persistent storage (React Native MMKV)
React Query      5.x      Server state — URL shortener API calls
```

### UI & Styling

```
NativeWind       4.x      Tailwind-based utility styling
lucide-react-native        Icon library
react-native-reanimated 3.x  Animations (fade, scale only)
react-native-gesture-handler  Swipe, drag interactions
@gorhom/bottom-sheet       File preview sheets
react-native-skia          (Optional) sparkline charts in premium
```

### Firebase

```
@react-native-firebase/app         Core
@react-native-firebase/analytics   Event tracking
@react-native-firebase/crashlytics Crash reporting
@react-native-firebase/remote-config  Ad/feature flags
```

### Ads

```
react-native-google-mobile-ads  App Open, Native, Interstitial, Rewarded
```

### File & Media Processing

```
expo-document-picker      File selection (PDF, images)
expo-image-picker         Camera + gallery
expo-camera               QR scanner
expo-file-system          Local read/write
expo-sharing              Share sheet
expo-media-library        Save to gallery
react-native-pdf-lib      PDF merge/split/compress
react-native-image-resizer Image compress/resize
```

### Testing

```
Jest + @testing-library/react-native  Unit + integration
Detox                                 E2E (optional, Phase 2)
```

### Build & CI

```
Expo EAS Build     Android AAB/APK
EAS Submit         Play Store deployment
EAS Update         OTA updates (non-native)
```

---

## ARCHITECTURE

### Folder Structure

```
flashora/
├── app/                          # Expo Router — screen files only
│   ├── (tabs)/
│   │   ├── index.tsx             # Home
│   │   ├── tools.tsx             # Tool grid
│   │   ├── activity.tsx          # History
│   │   ├── premium.tsx           # Upgrade screen
│   │   └── settings.tsx
│   ├── pdf/
│   │   ├── merge.tsx
│   │   ├── split.tsx
│   │   └── ...
│   ├── qr/
│   ├── image/
│   ├── converter/
│   ├── url-shortener/
│   └── _layout.tsx
│
├── src/
│   ├── components/               # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── EmptyState.tsx
│   │   └── ...
│   │
│   ├── design-system/
│   │   └── tokens/
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       ├── spacing.ts
│   │       └── index.ts
│   │
│   ├── features/
│   │   ├── home/
│   │   │   ├── components/       # HomeHeader, QuickActions, RecentTools
│   │   │   ├── hooks/
│   │   │   └── HomeScreen.tsx
│   │   ├── pdf/
│   │   │   ├── components/
│   │   │   ├── hooks/            # usePdfMerge, usePdfSplit, ...
│   │   │   ├── services/         # pdfService.ts — all processing logic
│   │   │   └── types.ts
│   │   ├── qr/
│   │   ├── image/
│   │   ├── converter/
│   │   ├── url-shortener/
│   │   ├── premium/
│   │   └── settings/
│   │
│   ├── hooks/                    # App-wide hooks
│   │   ├── useTheme.ts
│   │   ├── usePermissions.ts
│   │   ├── useAds.ts
│   │   └── useStorage.ts
│   │
│   ├── services/
│   │   ├── analytics.ts          # Firebase wrapper
│   │   ├── crashlytics.ts
│   │   ├── remoteConfig.ts
│   │   ├── adService.ts          # AdMob manager
│   │   └── urlShortener.ts       # TinyURL + provider abstraction
│   │
│   ├── store/
│   │   ├── useAppStore.ts        # Zustand — app-wide
│   │   ├── useHistoryStore.ts    # Tool history
│   │   └── usePremiumStore.ts    # Premium state
│   │
│   ├── utils/
│   │   ├── fileUtils.ts
│   │   ├── permissions.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   │
│   ├── constants/
│   │   ├── tools.ts              # Tool manifest (id, name, icon, color, route)
│   │   ├── adUnits.ts
│   │   └── config.ts
│   │
│   └── types/
│       ├── tool.ts
│       ├── history.ts
│       └── premium.ts
│
├── assets/
├── .env.template
├── app.config.ts
├── babel.config.js
├── tailwind.config.js
└── tsconfig.json
```

### Architecture Principles

```
UI Layer        → screens + components (zero business logic)
Hook Layer      → useFeatureX hooks (bridge UI ↔ service)
Service Layer   → pure functions, all processing, testable
Store Layer     → Zustand slices (derived state only)
```

---

## NAVIGATION

### Tab Bar Design

```
[🏠 Home]  [🔧 Tools]  [📋 Activity]  [⭐ Premium]  [⚙️ Settings]
```

- Tab bar: floating pill style, `bg=surface`, `borderRadius=full`, `elevation=8`
- Active tab: filled icon + primary color dot indicator
- Haptic feedback on tab switch (`expo-haptics`)

---

## VERSION 1 FEATURES

### Feature 1 — PDF Tools
Tools: Merge · Split · Compress · Image→PDF · PDF→Image · Reorder Pages · Password Lock
Flow: `FilePicker → Preview Sheet → Processing (animated progress) → Result → Save/Share`
Library: `react-native-pdf-lib` + `expo-file-system`

### Feature 2 — QR Tools
Tools: Scan QR · Generate QR · History
QR Types: URL · Text · Phone · Email · WiFi
Library: `expo-camera` (scanner) + `react-native-qrcode-svg` (generator)

### Feature 3 — Image Tools
Tools: Compress · Resize · Crop · Convert (JPG/PNG/WebP) · Remove Metadata
Premium: Batch processing
Library: `react-native-image-resizer` + `expo-image-manipulator`

### Feature 4 — File Converter
Formats: JPG↔PNG · PDF↔Image · TXT→PDF
Pattern: `ConverterService` with pluggable converters (Strategy pattern — extensible)

### Feature 5 — URL Shortener
Input: Long URL → Output: Short URL + QR Code
Provider abstraction (`UrlShortenerProvider` interface) → Default: TinyURL API
Future-ready: add Rebrandly, Bit.ly without changing UI

---

## PREMIUM STRATEGY

**Not just "Remove Ads."** Premium = Power User Unlocks.

```
Free Tier                       Premium Tier
─────────────────────           ──────────────────────────
5 PDF operations/day            Unlimited PDF operations
Single file processing          Batch processing (all tools)
Standard compression            High-quality compression
Basic QR types                  All QR types + custom colors
Light/Dark theme only           +3 Premium themes
Ads shown                       Ad-free experience
─────────────────────           ──────────────────────────
Pricing:  ₹149/month  |  ₹799/year  (≈ 55% savings badge)
```

---

## ADS & MONETIZATION

```
Ad Type         Placement                 Trigger
────────────    ─────────────────────     ──────────────────────
App Open Ad     Cold launch only          App foreground after 4h
Native Banner   Home screen               Always visible (bottom)
Interstitial    Post tool completion      Max every 2 tool actions
Rewarded        "Unlock batch trial"      User-initiated only
```

Remote Config flags (all toggles via Firebase):
`ads_enabled`, `interstitial_frequency`, `rewarded_enabled`, `premium_price_inr`

---

## ANALYTICS EVENTS

```ts
// Standardized event schema
type FlashoraEvent =
  | 'app_open'
  | 'tool_open'          // { tool_id, source }
  | 'tool_success'       // { tool_id, duration_ms, file_size_kb }
  | 'tool_failure'       // { tool_id, error_code }
  | 'ad_impression'      // { ad_type }
  | 'ad_click'           // { ad_type }
  | 'premium_view'
  | 'premium_click'      // { plan: 'monthly' | 'yearly' }
  | 'premium_upgrade';   // { plan, revenue_inr }
```

---

## ERROR HANDLING — CRASH PREVENTION RULES

**Every feature must handle all of these:**

```ts
// Required error states per tool screen
type ErrorState =
  | 'INVALID_FILE'        // Wrong format uploaded
  | 'FILE_TOO_LARGE'      // Exceeds limit
  | 'UNSUPPORTED_FORMAT'  // Not in supported list
  | 'STORAGE_FULL'        // Device storage check before write
  | 'PERMISSION_DENIED'   // Camera / storage permission
  | 'NETWORK_ERROR'       // URL shortener API failure
  | 'PROCESSING_FAILED';  // Native lib error — always catchable

// Pattern: wrap every service call
try {
  const result = await pdfService.merge(files);
  // success path
} catch (error) {
  crashlytics.recordError(error);
  analytics.log('tool_failure', { tool_id: 'pdf_merge', error_code: error.code });
  showUserFriendlyError(error); // Never expose raw errors to users
}
```

**Crash-prevention checklist per feature:**
- [ ] Null-check all file picker results before processing
- [ ] Validate file type + size before passing to native library
- [ ] Check available storage before writing output
- [ ] All async operations wrapped in try/catch
- [ ] All `useEffect` dependencies correct (no stale closures)
- [ ] No inline `require()` for dynamic assets
- [ ] No memory leaks — cancel subscriptions in useEffect cleanup
- [ ] No hardcoded ad unit IDs — always read from `constants/adUnits.ts`

---

## PERMISSIONS — MINIMAL & JUSTIFIED

```
Permission          When to Request           Justification Shown
──────────────      ──────────────────────    ─────────────────────────────
CAMERA              QR Scan screen only       "To scan QR codes"
READ_STORAGE        File picker — first use   "To access your files"
WRITE_STORAGE       After first save action   "To save processed files"
```

Never request permissions on app launch. Never request camera for non-QR features.

---

## PERFORMANCE TARGETS

```
Metric                  Target      Strategy
─────────────────────   ────────    ───────────────────────────────────
Cold launch time        < 1.8 sec   Lazy load feature modules
Screen transition       < 250 ms    Reanimated 3, avoid JS thread
Tool processing UI      < 100 ms    Progress bar on background thread
Bundle size             < 12 MB     Tree shaking, no unused deps
Memory (steady state)   < 150 MB    Image cleanup, FlatList recycling
```

---

## TESTING REQUIREMENTS

Each feature must ship with:

```
Unit Tests (Jest)
  ✓ Service functions (pdfService, imageService, urlShortener)
  ✓ Utility functions (validators, formatters, fileUtils)
  ✓ Zustand store actions

Integration Tests (RNTL)
  ✓ File pick → process → save flow
  ✓ Error state rendering
  ✓ Premium gate behavior

Manual QA Checklist
  ✓ Fresh install + first launch
  ✓ Each tool: success path
  ✓ Each tool: error path (wrong file, cancel, no storage)
  ✓ Ad display + frequency cap
  ✓ Premium upgrade flow
  ✓ Dark mode all screens
  ✓ Large font accessibility
```

---

## DEVELOPMENT ORDER (STRICT SEQUENCE)

```
Step  1  →  Expo project init (SDK 51, TypeScript strict, New Architecture)
Step  2  →  Folder structure + architecture scaffold
Step  3  →  Design system (tokens, components: Button, Card, Badge, Input)
Step  4  →  Navigation (Expo Router tabs + stacks, typed routes)
Step  5  →  Home screen (search, quick actions, recent, native ad)
Step  6  →  PDF Tools (all 7 operations)
Step  7  →  QR Tools (scan + generate + history)
Step  8  →  Image Tools (compress, resize, crop, convert)
Step  9  →  File Converter (extensible provider pattern)
Step 10  →  URL Shortener (provider abstraction + TinyURL)
Step 11  →  Premium screen + gate logic
Step 12  →  AdMob integration (all 4 ad types)
Step 13  →  Firebase (Analytics + Crashlytics + Remote Config)
Step 14  →  Testing pass (unit + integration)
Step 15  →  Performance audit + polish
Step 16  →  EAS Build + release checklist
```

After **each step**, provide:
1. **Built:** what was implemented
2. **Files:** created / modified (with paths)
3. **Explanation:** key decisions and patterns used
4. **Risks/Issues:** known limitations or watch-outs
5. **Next Step:** what comes next and why

**Wait for review and approval before proceeding to the next step.**

---

## DELIVERABLES CHECKLIST

```
[ ] All source code (TypeScript, zero errors)
[ ] README.md — setup + run instructions
[ ] .env.template — all required env vars
[ ] FIREBASE_SETUP.md — step-by-step Firebase config
[ ] ADMOB_SETUP.md — ad unit IDs + test mode guide
[ ] EAS_BUILD.md — build + submit instructions
[ ] RELEASE_CHECKLIST.md — pre-publish validation
```

---

## START COMMAND

Begin now with **Step 1**:

1. Architecture plan (diagram + rationale)
2. Full dependency list with exact versions
3. `app.config.ts` with all Expo plugins
4. `tsconfig.json` (strict mode)
5. `tailwind.config.js` with design tokens wired in
6. Folder scaffold (`touch` all directories + placeholder index files)
7. `.env.template`

Output each file completely. Zero placeholders. Then **pause and wait for review.**
