# AdMob Setup Guide for Flashora

This guide provides instructions to wire up production Google AdMob App and Ad Unit IDs in the Flashora app.

---

## AdMob Unit Definitions

The app supports 4 types of AdMob units. In development, the app automatically defaults to Google's official Test Ad IDs to prevent policy violations.

| Ad Type | Placement | Trigger | Fallback Test Ad ID |
|---|---|---|---|
| **App Open** | Cold Launch | App foreground after 4 hours | `ca-app-pub-3940256099942544/9257395921` |
| **Native Banner** | Home Screen | Bottom banner (always visible) | `ca-app-pub-3940256099942544/2247696110` |
| **Interstitial** | PDF/Tool screens | Shown after successful action | `ca-app-pub-3940256099942544/1033173712` |
| **Rewarded** | Scanner/PDF pages | Simulated/watch to unlock | `ca-app-pub-3940256099942544/5224354917` |

---

## Environment Setup for Production

To configure real/production AdMob units, update your `.env` file (copied from `.env.template`):

```bash
# Android App ID (mandatory)
ADMOB_ANDROID_APP_ID=ca-app-pub-2287719258467717~5886691039

# Ad Unit IDs
ADMOB_APP_OPEN_ID=your-production-app-open-id
ADMOB_NATIVE_BANNER_ID=your-production-banner-id
ADMOB_INTERSTITIAL_ID=your-production-interstitial-id
ADMOB_REWARDED_ID=your-production-rewarded-id
```

---

## Rules to Remember
1. **Never** click on your own live/production ads.
2. During local development, always use the default **Test IDs** (already configured as default values).
3. Production IDs should only be bundled when executing a production build (`eas build --profile production`).
