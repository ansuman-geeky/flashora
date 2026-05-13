# Flashora

> **Fast. Smart. Utility.** — An all-in-one utility hub for Android.

## Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** 1.22+
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (for builds): `npm install -g eas-cli`
- **Android Studio** (for emulator) or a physical Android device with Expo Go

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/flashora.git
cd flashora
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy the template and fill in your values
cp .env.template .env
```

**Required variables:**
| Variable | Description | Where to Get |
|---|---|---|
| `ADMOB_ANDROID_APP_ID` | AdMob App ID | [AdMob Console](https://admob.google.com) |
| `GOOGLE_SERVICES_JSON` | Firebase config path | [Firebase Console](https://console.firebase.google.com) |
| `EAS_PROJECT_ID` | Expo project ID | [expo.dev](https://expo.dev) |

> **Note:** Test AdMob IDs are pre-configured for development. You only need real IDs for production builds.

### 4. Run the App

```bash
# Start the Expo dev server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on web (limited functionality)
npx expo start --web
```

### 5. Build for Production

```bash
# Create a development build
eas build --platform android --profile development

# Create a production build (AAB for Play Store)
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## Project Structure

```
flashora/
├── app/                    # Expo Router screens (thin UI layer)
├── src/
│   ├── components/         # Shared UI primitives
│   ├── design-system/      # Design tokens (colors, typography, spacing)
│   ├── features/           # Feature modules (pdf, qr, image, etc.)
│   ├── hooks/              # App-wide React hooks
│   ├── services/           # External integrations (Firebase, AdMob, API)
│   ├── store/              # Zustand state slices
│   ├── utils/              # Pure utility functions
│   ├── constants/          # Static config (tool manifest, ad units)
│   └── types/              # Shared TypeScript types
├── assets/                 # Images, fonts, splash screen
├── app.config.ts           # Expo configuration
├── tailwind.config.js      # NativeWind design tokens
└── tsconfig.json           # TypeScript strict mode config
```

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Expo SDK | 51 | Managed RN framework |
| React Native | 0.74 | Cross-platform UI |
| TypeScript | 5.x | Type safety (strict) |
| Expo Router | 3.x | File-based navigation |
| NativeWind | 4.x | Tailwind CSS for RN |
| Zustand | 4.x | Global state management |
| MMKV | 2.x | Fast persistent storage |
| Firebase | 20.x | Analytics, Crashlytics |
| AdMob | 14.x | Monetization |

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run Jest tests |
| `npm run lint` | ESLint check |
| `npm run build:android` | Production Android build |

## License

Private — All rights reserved.
