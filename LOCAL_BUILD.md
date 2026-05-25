# Local Android Export Guide

Follow these steps to clean, compile, and export the Flashora release APK locally on your Windows development machine.

---

## Prerequisites
Ensure you have the following installed:
* Java Development Kit (JDK) configured (Java 17 recommended).
* Android SDK installed, with the path configured in [android/local.properties](file:///c:/Users/ansum/Desktop/flashora/android/local.properties).

---

## Build Steps

### Step 1: Clean Build Artifacts (Optional)
If you run into locked file errors or caching conflicts (e.g. from Metro, Gradle daemon, or OneDrive), run the clean script in the project root:
```powershell
powershell -ExecutionPolicy Bypass -File .\clean-android.ps1
```

### Step 2: Compile the APK
Navigate into the `android` directory and run the Gradle wrapper command:
```powershell
cd android
.\gradlew.bat assembleRelease
```
*Note: If building on macOS or Linux, use `./gradlew assembleRelease`.*

### Step 3: Copy the APK to the Project Root
Once Gradle outputs `BUILD SUCCESSFUL`, return to the project root and copy the APK for easy access:
```powershell
cd ..
Copy-Item -Path .\android\app\build\outputs\apk\release\app-release.apk -Destination .\flashora-release.apk -Force
```

The fresh local binary will now be available in the main folder as **`flashora-release.apk`**.
