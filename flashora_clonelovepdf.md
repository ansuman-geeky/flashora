Analyze the scanner workflow and UX of the iLovePDF Android app and clone its scanner tool functionality as closely as possible inside my existing React Native Android application.

Goal

Build a production-grade document scanner module with the same user flow, functionality, and UX quality as iLovePDF Scanner.

Tech Constraints
Existing app: React Native (latest stable)
Implement using:
react-native-vision-camera for camera
native Android bridge module for Google ML Kit Document Scanner API
react-native-fs for local file storage
react-native-pdf-lib (or native Android PDF APIs) for PDF generation
Use Material 3 UI patterns and components
Android-first implementation
Required Functionalities (must match iLovePDF)
1. Scanner Home
Dedicated Scanner tab in bottom navigation
Primary CTA: “Scan Document”
Secondary CTA: Import from Gallery
Show Recent Scans list with thumbnails, filename, date, size
2. Camera Scan Screen

Fullscreen scanner camera with:

live preview
auto document edge detection overlay
auto capture mode toggle
manual shutter button
flash toggle
gallery picker
camera permissions handling

UX should open camera instantly.

3. Auto Crop + Perspective Correction

After capture:

detect document edges automatically
auto crop
fix perspective/skew
allow manual corner drag adjustment

Must feel intelligent and smooth.

4. Filters / Enhancement

Provide:

Original
Color
Grayscale
Black & White
High Contrast

Also:

brightness adjustment
contrast adjustment
rotate left/right

Real-time preview while editing.

5. Multi-page Scan Flow

Allow:

scan multiple pages continuously
“Add Page” button
page thumbnail strip
reorder pages via drag/drop
delete page
rotate individual page

Flow:
Scan → Edit → Add More → Save

6. Save / Export

Allow:

save as PDF
save as JPG
rename file before saving
choose destination folder
share immediately after save

Support Android share sheet.

7. Scan History

Create “Recent Scans” screen:

searchable
thumbnail preview
rename
delete
re-share
open again

Persist locally.

Explicitly Exclude

❌ OCR / text extraction
Do not implement OCR.

UI / UX Requirements

Use Material 3:

modern clean layout
large rounded buttons
bottom sheets for editing tools
floating action button for capture
smooth animations/transitions
premium spacing and typography
dark/light mode support

Must feel identical in simplicity and speed to iLovePDF.

Folder Architecture

Create clean modular structure:

/src/modules/scanner
  /components
  /screens
  /hooks
  /services
  /native
  /utils
Deliverables
Full scanner module code
Native Android bridge setup
React Native screens/components
navigation integration
permission handling
reusable hooks/services
production-ready code comments

Priority: Accuracy over creativity — replicate iLovePDF scanner behavior as closely as possible