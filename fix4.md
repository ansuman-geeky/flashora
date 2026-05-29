# Flashora — Critical Stabilization & Bug Fix Master Prompt

You are a **staff-level React Native + Expo + PDF processing engineer** and **Material 3 mobile UX specialist**.

Your task is to **audit, debug, refactor, and stabilize** the existing Flashora codebase after recent upgrades.

Priority:

1. restore broken functionality
2. fix regressions
3. improve UX consistency
4. ensure production-ready stability

Do not redesign unrelated features.
Focus on fixing all issues below.

---

# Phase 1: Remove Premium Strategy Completely

Remove all premium/business logic from app.

Delete:

* premium screen
* premium tab
* premium banners
* paywalls
* upgrade popups
* premium gating
* premium analytics events
* subscription state/store
* rewarded unlock logic
* pricing configs
* premium theme references
and related files  exist
Also remove:

```ts
usePremiumStore
premium.ts
premium routes
premium navigation
```

Update bottom tabs:
Home | Tools | Scanner | Settings

No premium references anywhere.

---

# Phase 2: Fix Broken PDF Tool Engine

Current issue:
all tools show:
`Process failed`

Broken tools:

* Merge PDF
* Split PDF
* Compress PDF
* Image to PDF
* Reorder Pages
* Password Lock

Audit:

* service layer
* file picker output
* path handling
* native module bindings
* async processing
* permissions

Required:
wrap every action:

```ts
try {
 await pdfService(...)
} catch(e){
 console.error(e)
}
```

Show actual logs.

Do not swallow errors.

Expected:
all tools must process successfully.

---

# Phase 3: Fix Compress PDF Redirect Bug

Bug:
after selecting file + tap compress,
app redirects to splash screen.

Likely causes:

* navigation reset
* unhandled exception
* memory crash

Fix:

* inspect stack traces
* prevent navigation reset
* preserve current route
* keep processing on same screen

Expected:
upload → compress → result → save/share

No redirect.

---

# Phase 4: Fix Light/Dark Theme

Current:
text invisible on multiple screens.

Audit:

* hardcoded colors
* inline styles
* missing theme tokens

Replace all hardcoded colors with theme tokens:

```ts
background
surface
textPrimary
textSecondary
border
```

Implement:

```ts
const colors = useTheme()
```

Validate:

* Home
* Tools
* Scanner
* Settings
* all tool screens
* dialogs
* snackbars
* bottom sheets

Expected:
100% visible in both modes.

---

# Phase 5: Fix Reorder Pages Blank Screen

Problem:
PDF uploads but page thumbnails do not load.

Possible causes:

* PDF render failure
* thumbnail generation broken
* null pages array

Fix:
use:

* `react-native-pdf`
  or existing renderer properly

Flow:

1. load PDF
2. generate thumbnails
3. render draggable list

Use:

```bash
react-native-draggable-flatlist
```

Expected:
pages visible + draggable.

---

# Phase 6: Optimize Heart Icon

Current:
too large.

Fix:

* size = 18dp
* top right aligned
* padding 8
* outlined by default
* filled red when active

Use:

```txt
heart
heart-filled
```

Animate:
scale 1 → 1.1 → 1

Apply on:
all tool cards.

---

# Phase 7: Add Bottom Navigation Icons

Current:
missing icons.

Tabs:
Home
Tools
Scanner
Settings

Use:
`lucide-react-native`

Map:
Home → house
Tools → wrench
Scanner → scan-line
Settings → settings

Specs:

* inactive: 22dp
* active: 24dp
* Material 3 colors

Add label below icon.

---

# Phase 8: Stability Audit

Check:

* all routes
* all async calls
* permissions
* file saves
* snackbar
* theme toggles
* navigation state
* memory leaks

No red screens.

No silent failures.

---

# QA Checklist (must pass)

PDF:
✅ merge
✅ split
✅ compress
✅ image to pdf
✅ reorder
✅ lock pdf

UI:
✅ dark mode
✅ light mode
✅ icons visible
✅ heart aligned

Navigation:
✅ scanner route
✅ no splash redirect

Storage:
✅ save works
✅ share works

Performance:
✅ no crash
✅ no blank screen

---

# Deliverables

Provide:

1. root cause for each bug
2. exact files modified
3. updated code
4. regression fixes
5. validation checklist
6. production-ready build

Do not stop until all listed issues are fixed successfully.
