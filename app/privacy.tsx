import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { useTheme } from '@hooks/useTheme';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Privacy Policy" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-onSurface dark:text-onSurface-dark mb-2">
          Your Privacy Matters
        </Text>
        <Text className="text-xs text-outline dark:text-onSurfaceVariant-dark mb-4">
          Last updated: May 2026
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          1. 100% Client-Side Processing
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-4">
          Flashora is designed as an offline-first, client-side utility hub. All document scanning, PDF merging, PDF splitting, image compression, and text conversions are performed directly on your device. We do NOT upload your personal documents, images, or metadata to any remote servers.
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          2. No Personal Data Collection
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-4">
          We do not require user accounts, logins, or registration to use Flashora. We do not collect or store your name, email address, physical address, or phone number.
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          3. Anonymous Usage Diagnostics
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-4">
          To maintain app performance and prevent crashes, we collect anonymized usage analytics (via Google Firebase Analytics) and crash logs (via Firebase Crashlytics). This information contains no identifying details and is used solely to debug errors and monitor aggregate app features usage.
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          4. Device Permissions
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-4">
          Flashora requests device permissions only when necessary for local processing (e.g. Camera access for scanning docs, Storage access to save/load files). You can revoke these permissions at any time via your device settings.
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          5. Contact Support
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-2">
          If you have any questions or feedback regarding our privacy practices, please contact us at:
        </Text>
        <Text className="text-sm font-semibold text-primary">
          support@flashsuite.pro
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
