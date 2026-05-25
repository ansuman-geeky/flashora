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

- [ ] **Check package.json Version**: Ensure `version` and `android.versionCode` in `app.json` / `app.config.ts` are incremented.
- [ ] **EAS Secrets**: Verify that AdMob production IDs and Firebase keys are configured in EAS secrets.
- [ ] **Strict Typecheck**: Run `npm run typecheck` to guarantee no TS errors exist.
- [ ] **Lint Checks**: Run `npm run lint` to enforce style and syntax rules.
- [ ] **Production Env Check**: Ensure the build configuration uses real keys instead of Test IDs.
