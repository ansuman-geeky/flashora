/**
 * RecentTools — Shows recently used tools from history
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, FileText, QrCode, ImageIcon, Repeat2, Link2, ScanLine, type LucideIcon } from 'lucide-react-native';
import { SectionHeader } from '@components/SectionHeader';
import { Card } from '@components/Card';
import { EmptyState } from '@components/EmptyState';
import { Colors } from '@design-system/tokens';
import { useTheme } from '@hooks/useTheme';
import { useRecentTools } from '../hooks/useRecentTools';
import { logEvent } from '@services/analytics';
import { formatRelativeDate } from '@utils/formatters';
import type { ToolCategory } from '@app-types/tool';

/** Category → icon mapping */
const CATEGORY_ICONS: Record<ToolCategory, LucideIcon> = {
  pdf: FileText,
  qr: QrCode,
  image: ImageIcon,
  converter: Repeat2,
  'url-shortener': Link2,
  scanner: ScanLine,
};

export const RecentTools = React.memo(function RecentTools() {
  const router = useRouter();
  const { colors } = useTheme();
  const recentTools = useRecentTools(6);

  const handlePress = (toolId: string, route: string) => {
    logEvent('tool_open', { tool_id: toolId, source: 'recent_tools' });
    router.push(route as never);
  };

  return (
    <View className="mb-3">
      <SectionHeader
        title="Recent"
        action={
          recentTools.length > 0
            ? { label: 'See all', onPress: () => router.push('/(tabs)/activity' as never) }
            : undefined
        }
      />

      {recentTools.length === 0 ? (
        <View className="mx-2">
          <Card variant="flat" className="py-4">
            <View className="items-center">
              <Clock size={28} color={colors.onSurfaceVariant} />
              <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-1 text-center">
                No recent activity yet.{'\n'}Your used tools will appear here.
              </Text>
            </View>
          </Card>
        </View>
      ) : (
        <View className="px-2">
          {recentTools.map((entry) => {
            const CategoryIcon = CATEGORY_ICONS[entry.tool.category];
            return (
              <Card
                key={entry.tool.id}
                variant="flat"
                onPress={() => handlePress(entry.tool.id, entry.tool.route)}
                className="flex-row items-center p-2 mb-1"
                accessibilityLabel={entry.tool.name}
              >
                <View
                  className="w-[40px] h-[40px] rounded-md items-center justify-center mr-1.5"
                  style={{ backgroundColor: `${entry.tool.color}15` }}
                >
                  <CategoryIcon size={20} color={entry.tool.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-onSurface dark:text-onSurface-dark">
                    {entry.tool.name}
                  </Text>
                  <Text className="text-xs text-outline dark:text-onSurfaceVariant-dark">
                    {formatRelativeDate(entry.lastUsed)} · Used {entry.useCount}×
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
});
