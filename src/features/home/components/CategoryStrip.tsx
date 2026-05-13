/**
 * CategoryStrip — Horizontal category pills for quick category access
 */

import React from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText, QrCode, ImageIcon, Repeat2, Link2, type LucideIcon,
} from 'lucide-react-native';
import { CATEGORY_META } from '@constants/tools';
import { useTheme } from '@hooks/useTheme';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  pdf: FileText, qr: QrCode, image: ImageIcon,
  converter: Repeat2, 'url-shortener': Link2,
};

const CATEGORY_ORDER = ['pdf', 'qr', 'image', 'converter', 'url-shortener'];

export function CategoryStrip() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View className="mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {CATEGORY_ORDER.map((key) => {
          const meta = CATEGORY_META[key];
          const Icon = CATEGORY_ICONS[key];
          if (!meta || !Icon) return null;

          return (
            <Pressable
              key={key}
              className="flex-row items-center mr-1.5 px-2 py-1 rounded-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
              onPress={() => router.push('/(tabs)/tools' as never)}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              style={{ elevation: 1 }}
            >
              <Icon size={16} color={meta.color} />
              <Text className="text-sm font-medium text-text-primary dark:text-text-primary-dark ml-0.5">
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
