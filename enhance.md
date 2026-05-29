## Flashora — Smart File Storage + Files Tab Master Prompt

You are a senior React Native + Expo + Android storage engineer and Material 3 UX specialist.

Refactor Flashora’s file saving and file access system completely to provide a seamless automatic storage experience.

### Current Problem

Users are asked to manually create/select folders before saving generated files. During UAT testing, many users could not locate saved files.

Replace the current flow completely.

---

# Required Features

## 1. Automatic Flashora Storage System

Automatically create app folders and save outputs without asking users to create/select folders manually.

### Folder Structure

```text
Flashora/
├── PDF/
├── Scanner/
├── Images/
├── QR/
├── Compressed/
└── Converted/
```

### Save Behavior

* auto-create folders on first save
* auto-save processed files
* unique filenames with timestamp
* return saved file metadata

Example:

```text
flashora_merge_2026_05_27_103245.pdf
```

---

# 2. Add “Files” Tab in Bottom Navigation

Update bottom tabs:

```text
Home | Tools | Files | Scanner | Settings
```

Use Material 3 bottom navigation.

Icons:

* Home → house
* Tools → wrench
* Files → folder
* Scanner → scan-line
* Settings → settings

Use:
`lucide-react-native`

---

# 3. Files Screen

Create a dedicated Files tab where users can access all generated outputs.

### Features

* Recent files
* Grid/List toggle
* File preview
* Search files
* Sort by:

  * latest
  * size
  * type
* Open file
* Share file
* Delete file
* Open containing folder

### Categories

```text
PDF
Images
Scanner
QR
Compressed
Converted
```

---

# 4. Save Success UX

After every save:

Show Material 3 snackbar:

```text
✓ PDF Saved Successfully
Stored in Flashora > PDF
```

Actions:

* Open
* Share
* View Files

---

# 5. Storage Architecture

Use:

* `expo-file-system`
  or
* `react-native-fs`

Android 12–15 compatible.

Do NOT:

* ask manual folder selection
* use MANAGE_EXTERNAL_STORAGE

Implement proper scoped storage.

Preferred location:

```text
Android/media/com.flashora.app/Flashora/
```

---

# 6. Technical Requirements

Implement:

* automatic directory creation
* file indexing
* thumbnail generation
* save history
* persistent storage metadata
* error handling
* loading states
* empty states

All async operations must use:

```ts
try/catch
```

---

# 7. UI Requirements

Follow Material 3:

* premium SaaS feel
* responsive layouts
* dark/light mode support
* subtle animations
* rounded corners
* proper spacing
* smooth transitions

---

# 8. QA Validation

Ensure:

* all generated files save successfully
* files visible in Files tab
* users can easily locate outputs
* no manual folder creation
* no storage confusion
* no crashes
* no blank screens

Provide:

1. updated architecture
2. modified files
3. complete implementation
4. validation checklist
5. production-ready codebase
