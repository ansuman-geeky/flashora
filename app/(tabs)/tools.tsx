/**
 * Tools Tab Screen
 *
 * Displays all tools in a categorized grid.
 * Navigates to tool-specific stack screens.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  FileText,
  QrCode,
  ImageIcon,
  Repeat2,
  Link2,
  FilePlus2,
  Scissors,
  Minimize2,
  ImagePlus,
  FileImage,
  ArrowUpDown,
  Lock,
  ScanLine,
  Scaling,
  Crop,
  ShieldOff,
  ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react-native';
import { SectionHeader } from '@components/SectionHeader';
import { ToolCard } from '@components/ToolCard';
import { getToolsByCategory, CATEGORY_META } from '@constants/tools';
import { useTheme } from '@hooks/useTheme';
import { useAppStore } from '@store/useAppStore';
import type { Tool } from '@app-types/tool';

/** Map icon string names to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  'file-text': FileText,
  'qr-code': QrCode,
  image: ImageIcon,
  'repeat-2': Repeat2,
  'link-2': Link2,
  'file-plus-2': FilePlus2,
  scissors: Scissors,
  'minimize-2': Minimize2,
  'image-plus': ImagePlus,
  'file-image': FileImage,
  'arrow-up-down': ArrowUpDown,
  lock: Lock,
  'scan-line': ScanLine,
  scaling: Scaling,
  crop: Crop,
  'shield-off': ShieldOff,
  'arrow-left-right': ArrowLeftRight,
};

function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? FileText;
}

export default function ToolsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const handleToolPress = useCallback(
    (tool: Tool) => {
      router.push(tool.route as never);
    },
    [router]
  );

  const categories = Object.keys(CATEGORY_META);

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View className="px-2 pt-2 pb-1.5">
        <Text className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          Tools
        </Text>
        <Text className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
          All your utilities in one place
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => {
          const meta = CATEGORY_META[category];
          const tools = getToolsByCategory(category);

          if (!meta || tools.length === 0) return null;

          return (
            <View key={category} className="mb-3">
              <SectionHeader title={meta.label} />
              <View className="flex-row flex-wrap px-1.5">
                {tools.map((tool) => {
                  const Icon = getIconComponent(tool.icon);
                  return (
                    <View key={tool.id} className="w-1/3 p-0.5">
                      <ToolCard
                        name={tool.name}
                        icon={<Icon size={24} color={tool.color} />}
                        color={tool.color}
                        isPremium={tool.isPremium}
                        onPress={() => handleToolPress(tool)}
                        layout="grid"
                        isFavorite={favorites.includes(tool.id)}
                        onToggleFavorite={() => toggleFavorite(tool.id)}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
