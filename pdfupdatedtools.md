# Flashora — Professional PDF Tools Master Prompt

You are a senior React Native + Expo + PDF processing engineer and Material 3 UX specialist.

Before implementation, deeply analyze the existing Flashora architecture, design system, navigation flow, storage system, Files tab structure, tool workflow patterns, and PDF processing services.

IMPORTANT:

* Do not skip any requirement or architecture rule from the existing Flashora master prompt.
* Preserve all existing functionality.
* Do not break current PDF tools, save flow, theme handling, navigation, or Files tab.
* All tools must be fully functional and production-ready.
* Do not create placeholders, dummy screens, fake previews, or incomplete implementations.

Implement the following new professional PDF tools:

1. Unlock PDF
2. Sign PDF
3. Add Watermark

All tools must follow existing Flashora:

* Material 3 design language
* storage architecture
* save/share flow
* theme system
* navigation structure
* Files tab integration
* recent files/history system

---

# 1. Unlock PDF Tool

## Purpose

Allow users to remove password protection from PDF files.

## User Flow

Select protected PDF
→ Enter password
→ Validate password
→ Remove protection
→ Generate unlocked PDF
→ Auto-save file
→ Show success screen/snackbar
→ Allow Open / Share / View Files

## Functional Requirements

* support password-protected PDFs
* validate entered password correctly
* handle invalid password errors gracefully
* preserve original PDF quality
* generate fully unlocked PDF
* auto-save output file

## Storage

Save into:

```text
Flashora/PDF/
```

Filename example:

```text
flashora_unlocked_2026_05_28_103245.pdf
```

## Error Handling

Handle:

* wrong password
* corrupted PDF
* unsupported PDF
* processing failure

Show proper Material 3 error states.

---

# 2. Sign PDF Tool

## Purpose

Allow users to add signatures into PDF documents professionally.

## Signature Types

Support:

1. Draw signature
2. Upload signature image
3. Type signature

---

## User Flow

Upload PDF
→ Open PDF preview
→ Add signature
→ Drag signature position
→ Resize signature
→ Select page
→ Apply signature
→ Generate signed PDF
→ Auto-save output
→ Open / Share / View Files

---

## Functional Requirements

### PDF Preview

* render PDF pages properly
* smooth scrolling
* zoom support

### Signature Interaction

* draggable signature
* resizable signature
* rotate support optional
* multi-page support
* maintain signature quality

### Output

* properly embed signature into final PDF
* preserve PDF formatting
* no quality loss

---

## Storage

Save into:

```text
Flashora/PDF/
```

Filename example:

```text
flashora_signed_2026_05_28_103245.pdf
```

---

# 3. Add Watermark Tool

## Purpose

Allow users to add professional text or image watermarks to PDFs.

---

## Watermark Types

### Text Watermark

Support:

* custom text
* font size
* opacity
* rotation
* alignment
* color
* page position

### Image Watermark

Support:

* upload logo/image
* resize
* opacity
* placement
* rotation optional

---

## User Flow

Upload PDF
→ Configure watermark
→ Preview watermark
→ Apply watermark
→ Generate PDF
→ Auto-save output
→ Open / Share / View Files

---

## Functional Requirements

* watermark all pages
* support selected pages
* preserve PDF quality
* optimized processing
* proper preview rendering

---

## Storage

Save into:

```text
Flashora/PDF/
```

Filename example:

```text
flashora_watermark_2026_05_28_103245.pdf
```

---

# Technical Implementation Requirements

Use:

* pdf-lib
* expo-file-system
* react-native-gesture-handler
* react-native-reanimated

Avoid:

* deprecated PDF libraries
* fake preview rendering
* placeholder processing

---

# Shared Tool Requirements

All tools must support:

* loading states
* progress indicators
* success snackbar
* error snackbar
* auto-save
* share
* open file
* Files tab integration
* recent history integration

All async operations must use:

```ts
try/catch
```

No silent failures.

---

# UI/UX Requirements

Strictly follow Flashora Material 3 design system.

Requirements:

* premium SaaS feel
* responsive layouts
* dark/light theme support
* accessible touch targets
* rounded corners
* proper spacing
* subtle animations
* smooth transitions

Do not use:

* glassmorphism
* cluttered layouts
* neon gradients

---

# Navigation Requirements

Add tools into:

* Tools screen
* Favorites
* Search
* Recent tools
* Quick actions if applicable

Ensure:

* routes registered correctly
* no unmatched route errors
* no navigation resets
* no splash screen redirects

---

# Files Tab Integration

Generated outputs must:

* appear in Files tab automatically
* support preview
* support delete
* support share
* support open folder

---

# Performance & Stability

Ensure:

* no crashes
* no blank screens
* no memory leaks
* stable Android 12–15 support
* optimized PDF rendering
* smooth drag interactions

---

# QA Validation Checklist

Unlock PDF:
✅ password validation works
✅ unlock successful
✅ save/share works

Sign PDF:
✅ draw signature works
✅ upload signature works
✅ drag/resize works
✅ signed PDF opens correctly

Watermark:
✅ text watermark works
✅ image watermark works
✅ opacity and position work
✅ all-page watermark works

General:
✅ dark/light mode works
✅ Files tab integration works
✅ recent history works
✅ no regressions
✅ no placeholder logic
✅ production-ready implementation

---

# Final Deliverables

Provide:

1. architecture updates
2. modified files list
3. route integration
4. storage integration
5. full implementation
6. validation checklist
7. production-ready codebase
