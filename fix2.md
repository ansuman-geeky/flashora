## Bug Fixes + UX Enhancements Prompt for Flashora Tool App (React Native + Material 3)

You are working on an existing **React Native mobile app** named **Flashora** (Scanner,PDF & Image Tools app).
Apply the following fixes and enhancements carefully without breaking existing functionality.

### Global Requirements

* Follow **Material 3** design system strictly.
* Maintain existing theme, spacing, typography, and component consistency.
* Use reusable components wherever possible.
* Ensure all fixes work on **Android 12+ and Android 15**.
* Test both **free and premium** user flows.
* Add proper loading states, success states, and error handling.

---

# 1. Tools Screen – Favorite/Heart Icon

### Requirement:

Add a **heart/favorite icon** on the **top-right corner** of every tool card on the **Tools screen**.

### Expected behavior:

* Icon should be aligned at top-right inside each card.
* Default state = outlined heart.
* On tap = filled heart.
* Persist state locally using AsyncStorage/local DB.
* Smooth toggle animation.
* Maintain Material 3 touch feedback.

---

# 2. Save Success Toast / Snackbar

### Requirement:

Show a success message after user saves any output file.

### Message:

`Saved successfully`

### Apply on:

* All PDF tools
* All Image tools
* SaveOutput screen

### Behavior:

* Use Material 3 Snackbar/Toast.
* Auto dismiss after 2 seconds.
* Include success icon.

---

# 3. Fix All Image Tool Functionalities

Current image tools are broken. Fix all workflows end-to-end.

---

## 3.1 Compress Image Tool

### Issue:

Compression does not reduce file size.

### Fix:

* Ensure actual image compression logic works.
* Reduce file size based on selected quality percentage.
* Preserve aspect ratio.
* Show original vs compressed size.

Expected:
Example:
5 MB → 1.2 MB

---

## 3.2 Save after Processing

### Broken tools:

* Compress Image
* Resize Image
* Crop Image
* Convert Image
* Remove Metadata

### Fix:

After processing:

* output file must save correctly to device local storage
* visible in gallery/files app
* unique filename generation
* overwrite prevention

---

## 3.3 Download Button Not Working

### Affected tools:

* Image
* Compress Image
* Resize Image
* Crop Image
* Convert Image
* Remove Metadata

### Fix:

Download button must:

* save file locally
* request storage permission properly
* show loading state
* show success snackbar
* handle permission denial gracefully

---

## 3.4 Success Snackbar for Every Tool

Add:
`Saved successfully`

after:

* save
* download
* export

for:

* all PDF tools
* all Image tools

---

# 4. Premium Lock Flow – Password Lock Tool

### Requirement:

When free user taps **Password Lock Tool**:

Show premium paywall modal.

### Modal requirements:

* subscription plans visible
* close (X) icon on top-right
* dismiss on tap outside OR X
* smooth bottom-sheet animation
* prevent tool access unless premium purchased

Flow:
Free user → tap tool → paywall popup

---

# 5. Share App Fix

Current share app feature is broken.

### Fix:

Share should open native share sheet with:

* app name
* short description
* Play Store link (or placeholder)
* app icon preview if possible

Example text:
"Try Flashora – powerful PDF & Image tools app:
[Play Store Link]"

Support:

* WhatsApp
* Gmail
* Telegram
* Messages
* Copy link

---

# QA Checklist

Validate:

* no crashes
* no broken navigation
* no blank screens
* all save/download paths work
* all snackbars appear
* premium flow works
* heart favorites persist after app restart
* share works on Android devices

---

# Deliverables

Provide:

1. updated code
2. reusable components
3. bug fixes summary
4. test checklist
5. edge cases handled

Goal: make Flashora production-ready and stable.
