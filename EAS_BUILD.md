# EAS Build Guide for Flashora

Flashora uses **Expo Application Services (EAS)** to compile local native binaries (`APK` and `AAB`) for Android.

---

## Step 1: Login to Expo CLI
Ensure you have the EAS CLI installed and logged in:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

---

## Step 2: Configure Project Setup
To link the project to your Expo account and set up EAS config:

```bash
# Link the project to your Expo dashboard
eas project:init
```

---

## Step 3: Run Builds

### 1. Local Development Build (for debugger & local emulator testing)
```bash
eas build --platform android --profile development
```
*Creates a development client APK containing all native configs (AdMob, Firebase). You can run this on your simulator and hot reload JS changes.*

### 2. Preview Build (for physical device QA)
```bash
eas build --platform android --profile preview
```
*Compiles a standalone, release-signed `APK` that can be sideloaded directly onto any Android device for manual testing.*

### 3. Production Build (for Play Store submit)
```bash
eas build --platform android --profile production
```
*Compiles an optimized `AAB` (Android App Bundle) matching strict Google Play Store release guidelines.*

---

## Troubleshooting Build Errors
* **Duplicate Classes**: If you hit class clashes, run `./clean-android.ps1` to wipe compile caches and native folders.
* **Environment Variables**: For production builds, make sure you configure your `.env` secrets on the EAS website dashboard (under Project Settings → Secrets) so they are injected during remote compiler execution.
