# Release Checklist for Flashora

This document serves as the pre-release manual quality assurance (QA) validation checklist. Before submitting any production build (AAB) to the Google Play Store, every item in this checklist must be tested and verified.

---

## 1. First Launch & Fresh Install Validation

Verify the app's behavior on clean installs to ensure a frictionless onboarding experience.

- [ ] **No Immediate Permissions Prompts**: Open the app for the first time. The app must NOT request camera or storage permissions on launch.
- [ ] **Default Theme Sync**: The app must respect the device's system theme on first launch (Light or Dark) without visual glitches.
- [ ] **Onboarding / Welcome State**: If the app features any onboarding flow or first-time tour, verify that it can be completed or skipped smoothly.
- [ ] **App Open Ad Trigger**: Verify that the first App Open Ad does not block critical initial loading sequences and displays only after the main screen layout is rendered.
- [ ] **Firebase Init Verification**: Check ADB logs to confirm Firebase Analytics has successfully initialized and logged the `app_open` event.

---

## 2. Ads & Frequency Cap Verification

Validate that AdMob ads are displayed according to frequency caps to avoid a poor user experience.

- [ ] **Banner Ads Visibility**: Verify that the home screen banner ad loads at the bottom and does not overlay or hide interactive elements (like the navigation tabs or list items).
- [ ] **Interstitial Ad Frequency Cap**:
  - Run tool operations (e.g., compress image, generate QR code).
  - Verify that the Interstitial Ad triggers *exactly* after the configured number of actions (default: `2`).
  - Verify that the app resumes cleanly after closing the ad.
- [ ] **Rewarded Ad Flow**:
  - Attempt to run a premium/batch tool action when in the free tier.
  - Verify that the upgrade sheet or rewarded ad prompt is shown.
  - Watch the rewarded ad to completion.
  - Verify that the action unlocks immediately after the ad completes, and does not unlock if the ad is closed early.
- [ ] **Ad Disabling for Premium**:
  - Go to the Premium Tab, trigger simulated premium upgrade.
  - Verify that all Banner, Interstitial, App Open, and Rewarded Ads are immediately hidden or disabled.
  - Restart the app and verify that ads remain disabled.

---

## 3. Dark Mode Compliance

Every screen must look premium and readable in both Light and Dark modes.

- [ ] **Dynamic Theme Switching**: Change the theme in the app settings from Light to Dark, and vice versa.
- [ ] **No Hardcoded Colors**: Verify that no text becomes invisible (e.g., black text on a dark background or white text on a light background).
- [ ] **Icon Backgrounds**: Ensure all tool icons have clean backgrounds in both light and dark modes, avoiding black squares on dark or white-out blocks on light.
- [ ] **Modal and Sheet Backgrounds**: Ensure overlays, menus, action sheets, and modal backgrounds update their colors correctly during theme changes.

---

## 4. Font Scaling & Accessibility QA

Users with accessibility settings enabled must be able to read and navigate the app.

- [ ] **Large Font Layout**: In the Android system settings, set the font size to "Largest". Open the app and check:
  - **No Text Clipping**: Texts should wrap or scale down properly, rather than being cut off.
  - **Button Tap Targets**: Make sure buttons remain tappable and do not shrink below `48dp x 48dp`.
  - **Text Overlap**: Ensure text labels do not overlap with other components or adjacent rows.
- [ ] **Screen Reader Support (Optional but recommended)**: Enable TalkBack and ensure key interactive elements have descriptive `accessibilityLabel` attributes.

---

## 5. Permission Flows (On-Demand)

Permissions must be requested only when absolutely necessary and contextually justified.

- [ ] **Camera Permission (QR Scanner)**:
  - Open the QR scanner feature.
  - Verify that the camera permission dialog is prompted only when the scanning screen is opened.
  - Reject permission and check that a friendly explanation and "Open Settings" button are rendered.
  - Grant permission and check that the scanner immediately starts.
- [ ] **Storage Permission (File Picker & Save)**:
  - Pick a file (PDF or Image) to process. Verify that storage permission is requested contextually if needed.
  - Save the output file. Verify that the file is written to the public Downloads/Documents directory or app sandbox, and the success toast appears.

---

## 6. Core Features Integration Smoke Test

Run a quick pass on each core utility:

- [ ] **PDF Tools**: Split, Merge, Compress, Unlock, Lock, Convert images to PDF.
- [ ] **QR Tools**: Scan code, generate text/URL QR, check history log.
- [ ] **Image Tools**: Compress, resize, convert format.
- [ ] **URL Shortener**: Generate short URL, copy, and test if it redirects correctly.

---

## 7. Pre-Build Release Checklist

Technical checks before generating the final production `.aab`:

- [ ] **Version Bump**: Ensure `version` (e.g., `1.0.1`) and `android.versionCode` (e.g., `2`) in `app.config.ts` and `package.json` are incremented from the previous release.
- [ ] **Environment Variables & Secrets**:
  - Verify that AdMob **production IDs** are configured in `app.config.ts` or EAS secrets.
  - Verify that Firebase `google-services.json` is the production version and is securely accessible during the build.
- [ ] **Remove Debug/Dev Permissions**: Check `android/app/src/main/AndroidManifest.xml` and ensure permissions like `SYSTEM_ALERT_WINDOW` or `RECORD_AUDIO` are removed if not strictly required in production (Play Store may flag these).
- [ ] **Code Quality**:
  - Run `npm run typecheck` to guarantee no TypeScript errors exist.
  - Run `npm run lint` to enforce style and syntax rules.
- [ ] **ProGuard & Minification**: Ensure `minifyEnabled enableProguardInReleaseBuilds` is set correctly in `android/app/build.gradle` if relying on ProGuard, or ensure the EAS `production` profile handles minification.

---

## 8. Google Play Console Listing & Policy Checklist

Check these Play Store specific requirements before uploading your bundle:

- [ ] **App Icon**: Ensure the Store Icon is high-res (512x512) and `assets/adaptive-icon.png` meets Google's design guidelines.
- [ ] **Store Assets**:
  - Feature Graphic (1024x500).
  - Screenshots for Phone (and 7-inch/10-inch tablets if supported).
  - App Short Description (up to 80 chars) and Long Description (up to 4000 chars) are updated for the new features.
- [ ] **Data Safety Form**:
  - Update the Data Safety section in the Play Console to declare data collected by Firebase Analytics, Crashlytics (Crash logs), and AdMob (Device IDs for advertising).
- [ ] **Privacy Policy**: Ensure a valid, accessible Privacy Policy URL is linked in the Play Console (required for apps requesting Camera and Storage permissions).
- [ ] **Advertising ID Declaration**: Check the "Advertising ID" section in Play Console and declare that your app uses it (AdMob requires this).
- [ ] **App Content Declarations**: Verify Target Audience (e.g., 13+ or 18+), News App status, and Data Safety in the Play Console.

---

## 9. Final Build & Upload Validation

- [ ] **Generate Production AAB**: Run `npm run build:android` (which maps to `eas build --platform android --profile production`) to generate the Android App Bundle (`.aab`).
- [ ] **App Signing Setup**: Ensure the build is signed with the correct production upload Keystore (EAS handles this if configured, verify via `eas credentials`).
- [ ] **Pre-Launch Report**: Upload the AAB to the "Internal Testing" or "Closed Testing" track first and review the automated Pre-launch report for crashes or accessibility issues on various devices.
- [ ] **Final App Bundle Smoke Test**: Download the app from the internal track via Play Console to a physical device and do one last smoke test (to verify ProGuard/R8 didn't break UI/logic).
