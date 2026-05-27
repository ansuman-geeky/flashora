import React from 'react';
import { View, ScrollView, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { useTheme } from '@hooks/useTheme';

export default function AboutUsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="About Us" />
      <ScrollView
        contentContainerStyle={{ padding: 16, alignItems: 'center', paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-[80px] h-[80px] rounded-lg bg-primary-muted items-center justify-center mb-3 mt-4">
          <Image
            source={require('../assets/icon.png')}
            style={{ width: 64, height: 64, borderRadius: 12 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-xl font-bold text-onSurface dark:text-onSurface-dark">
          Flashora
        </Text>
        <Text className="text-sm text-outline dark:text-onSurfaceVariant-dark mb-4">
          Version 1.0.0
        </Text>

        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark text-center leading-5 mb-4 px-2">
          Flashora is an offline-first, privacy-focused utility toolbox designed to streamline your daily document, image, and QR code tasks. Built with performance and security in mind, Flashora does not rely on third-party cloud uploads, meaning your files stay strictly on your device.
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark self-start mt-4 mb-2">
          Our Mission
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark self-start leading-5 mb-4">
          We believe that basic document utilities should be fast, private, and accessible without expensive cloud subscription barriers. Our local-first engineering ensures your scans, PDFs, and edits remain 100% confidential.
        </Text>

        <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark self-start mt-2 mb-2">
          Features Portfolio
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark self-start leading-5 mb-4">
          • **Doc Scanner**: Scan physical files and auto-crop pages with high resolution.{'\n'}
          • **PDF Toolkit**: Seamlessly merge, split, compress, protect, and convert files locally.{'\n'}
          • **Image Editor**: Compress, resize, crop, and convert images instantly.{'\n'}
          • **QR Engine**: Scan and generate custom QR codes for networks, URLs, and text.{'\n'}
          • **URL Shortener**: Shorten links directly using TinyURL API.
        </Text>

        <Text className="text-xs text-outline dark:text-onSurfaceVariant-dark text-center mt-6">
          © 2026 Flashsuite. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
