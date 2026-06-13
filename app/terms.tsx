import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { useTheme } from '@hooks/useTheme';

export default function TermsConditionsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Terms & Conditions" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-onSurface dark:text-onSurface-dark mb-2">
          Terms & Conditions of Service
        </Text>
        <Text className="text-xs text-outline dark:text-onSurfaceVariant-dark mb-4">
          Last updated: May 2026
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          1. Terms Agreement
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-4">
          By downloading and using Flashora, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the application.
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          2. License and Acceptable Use
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-4">
          Flashora grants you a personal, non-exclusive, non-transferable, revocable license to use the app for personal or professional utilities. You agree not to use the application to process illegal materials, violate the rights of others, or engage in malicious behavior.
        </Text>
        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          3. Disclaimer of Warranties
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-4">
          Flashora is provided "as is" and "as available" without warranties of any kind, either express or implied. Since all processing runs locally on your device hardware, we cannot guarantee performance speeds or document accuracy for damaged/unreadable input files.
        </Text>
        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark mt-2 mb-1.5">
          4. Contact Support
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark leading-5 mb-2">
          For payment inquiries, licensing questions, or terms feedback, please reach out to us at:
        </Text>
        <Text className="text-sm font-semibold text-primary">
          support@flashsuite.pro
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
