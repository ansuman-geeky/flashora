/**
 * Activity Tab Screen
 *
 * Shows tool usage history grouped by date.
 * EmptyState shown when no history exists.
 */

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { EmptyState } from '@components/EmptyState';
import { useHistoryStore } from '@store/useHistoryStore';
import { useTheme } from '@hooks/useTheme';

export default function ActivityScreen() {
  const { colors } = useTheme();
  const entries = useHistoryStore((s) => s.entries);

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View className="px-2 pt-2 pb-1.5" style={{ flex: 0 }}>
        <Text className="text-xl font-bold text-onSurface dark:text-onSurface-dark">
          Activity
        </Text>
        <Text className="text-xs text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-0.5">
          Your recent tool usage
        </Text>
      </View>

      {entries.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={32} color={Colors.primary} />}
          title="No Activity Yet"
          description="Your tool usage history will appear here. Start using a tool to see your activity."
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-surface dark:bg-surface-dark border border-outlineVariant dark:border-outlineVariant-dark rounded-md p-2 mb-1">
              <View className="flex-1">
                <Text className="text-base font-medium text-onSurface dark:text-onSurface-dark">
                  {item.toolName}
                </Text>
                <Text className="text-xs text-outline dark:text-onSurfaceVariant-dark mt-0.5">
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
              <View
                className="px-1.5 py-0.5 rounded-sm"
                style={{
                  backgroundColor: item.success ? Colors.accentMuted : Colors.errorMuted,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: item.success ? Colors.accent : Colors.error }}
                >
                  {item.success ? 'Success' : 'Failed'}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
