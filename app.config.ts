import { ExpoConfig, ConfigContext } from 'expo/config';
import fs from 'fs';

export default ({ config }: ConfigContext): ExpoConfig => {
  const hasGoogleServices = fs.existsSync('./google-services.json');

  return {
    name: 'Flashora',
    slug: 'flashora',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'flashora',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0D0F14',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.flashora.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0D0F14',
      },
      package: 'com.flashora.app',
      versionCode: 1,
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
      ],
      googleServicesFile: hasGoogleServices ? './google-services.json' : process.env.GOOGLE_SERVICES_JSON,
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission: 'Flashora needs camera access to scan QR codes.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Flashora needs access to your photos for image processing.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: 'Flashora needs access to save processed files to your gallery.',
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      'expo-document-picker',
      {
        iCloudContainerEnvironment: 'Production',
      },
    ],
    [
      '@react-native-firebase/app',
    ],
    [
      '@react-native-firebase/crashlytics',
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
        iosAppId: process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '',
    },
  },
  // Note: New Architecture is enabled via the 'newArchEnabled' flag
  // in app.json or via EXPO_USE_METRO_WORKSPACE_ROOT=1 environment variable.
  // For EAS builds, set "newArchEnabled": true in app.json.
  };
};
