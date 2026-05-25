# Firebase Setup Guide for Flashora

This guide provides step-by-step instructions to configure Firebase Analytics, Crashlytics, and Remote Config in the Flashora app.

---

## Prerequisites
1. A Firebase account ([Firebase Console](https://console.firebase.google.com/)).
2. An Android App project registered on the Firebase console under the package name `com.flashora.app`.

---

## Step 1: Download `google-services.json`
1. Go to **Firebase Console** → Select your project.
2. Click the **Settings Gear Icon** next to Project Overview → **Project Settings**.
3. Under the **Your apps** section, select the Android app (`com.flashora.app`).
4. Click **Download google-services.json**.
5. Save the downloaded file to the root directory of the Flashora project:
   `c:\Users\ansum\Desktop\flashora\google-services.json`

---

## Step 2: Configure Remote Config Parameters
In the Firebase Console, go to **Remote Config** (under Engage) and add the following parameters:

| Parameter Key | Value Type | Default Value | Description |
|---|---|---|---|
| `ads_enabled` | `Boolean` | `true` | Enable or disable all ads in the app |
| `interstitial_frequency` | `Number` | `2` | Number of tool operations before showing interstitial ad |
| `rewarded_enabled` | `Boolean` | `true` | Enable rewarded ads for unlocking batch trials |
| `premium_price_inr` | `Number` | `149` | Monthly subscription price shown on Premium Tab |

Ensure you click **Publish changes** after adding these keys.

---

## Step 3: Enable Crashlytics
1. Go to **Crashlytics** (under Release & Monitor) in the Firebase console.
2. Click **Enable Crashlytics** or follow the setup wizard.
3. Crash logs will automatically stream from physical device/emulator builds to the console.

---

## Step 4: Verify the Setup
1. In development, run your app in the emulator/device.
2. In your terminal, look for the following logs indicating connection success:
   * `[RemoteConfig] Loaded Remote Config successfully`
   * `[Analytics] app_open`
