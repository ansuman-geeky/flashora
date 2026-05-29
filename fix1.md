Fix Existing Issues + UX Enhancements for PDF Tool App

You are a senior React Native + PDF processing engineer and Material 3 UX specialist.

Analyze the existing codebase thoroughly and fix the following bugs without breaking existing functionality. Ensure production-ready implementation, clean architecture, proper error handling, and smooth UX.

Critical Bug Fixes & Enhancements
1. Fix Doc Scanner Route Issue
Problem:

When clicking:

Tools tab → Doc Scanner
Quick Actions → Scanner

app throws:
Unmatched route error / page could not be found

Fix:
Verify route registration in navigation stack.
Ensure scanner screen is properly linked in:
Bottom tab navigator
Stack navigator
Deep linking config
Remove duplicate/incorrect route names.
Add fallback navigation guard:
if (!routeExists) navigate("DocScanner")
Expected:

Scanner opens correctly from all entry points.

2. Fix Save to Local Storage (Scanner Output)
Problem:

After:

scanning
crop
filter

Saving as:

PDF
Image

is not working.

Fix:

Implement proper local save 

Required:

save PDF to Downloads/Documents
save images to Gallery/Pictures
request runtime permissions:
Android 13+
scoped storage support
return file path after save

Example:

await RNFS.writeFile(path, fileData, "base64")
Expected:

Files should appear in user storage/gallery.

3. Add Success Toast / Snackbar

After:

Save
Download
Share

show success message.

Use Material 3 Snackbar.

Examples:

“PDF saved successfully”
“Image downloaded”
“Shared successfully”
“Compression completed”

Include:

icon
auto dismiss
subtle animation
4. Fix Compress PDF Logic
Problem:

Compressed file size remains same.

Fix:

Rebuild compression logic.

Apply:

image downsampling
remove metadata
optimize embedded fonts
recompress streams
selectable compression levels:
Low
Medium
High

Use:

pdf-lib
or native bridge.

Display:
Before: 12.4 MB
After: 4.8 MB
Saved: 61%

Expected:

Actual file reduction.

5. Rebuild Reorder Pages UX
Problem:

Arrow-based reorder is poor UX.

Replace with:

Drag & Drop reorder.

Use:
react-native-draggable-flatlist

Features:

page thumbnails
long press drag
smooth animation
auto-scroll
haptic feedback

After reorder:
update actual PDF page order.

6. Replace Star with Heart Favorite
Change:

Current:
⭐ star

Replace with:
❤️ heart

Behavior:

default: outlined heart
on click: filled red heart
animate scale (pop)
persist using local storage

Example:

AsyncStorage.setItem("favorites", ...)

Apply everywhere:

tools list
tool details
recent tools
7. Fix Protect PDF Tool
Problem:

Password applied file downloads but opens without password.

Fix:

Implement proper PDF encryption:

AES-256
user password
owner password
disable editing
disable printing (optional)

Recommended:

pdf-lib
or native library.

Validate after generation:
attempt open without password must fail.

Expected:
Password prompt appears.

Additional Enhancements
Global Error Handling

Add:

try/catch

show friendly message:
“Something went wrong. Please try again.”

Loading States

For every tool:
show:

progress loader
processing state
disable buttons while processing

Example:
“Compressing PDF…”

File Validation

Reject:

corrupted files
unsupported formats

max file size

Show proper error.

Analytics Events

Track:

scanner_opened
pdf_saved
pdf_compressed
pdf_protected
reordered_pages
UI Standards

Use Material 3 only.

No glassmorphism.

Requirements:

premium SaaS feel
rounded 16dp
subtle elevation
proper spacing
responsive
dark/light support
smooth transitions
Deliverables

Provide:

fixed code
updated routes
improved scanner save logic
working compression logic
drag-drop reorder
favorite heart implementation
proper PDF password protection
test checklist
edge case handling
production-ready code

Do not leave placeholders. Implement complete solution.
There should be back button arrow on every pages