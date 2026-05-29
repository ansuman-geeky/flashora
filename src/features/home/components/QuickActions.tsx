/**
 * QuickActions — Horizontal row of most popular tools
 *
 * Shows 4 hand-picked tools for fastest access from home.
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FilePlus2,
  ScanLine,
  Minimize2,
  Link2,
} from 'lucide-react-native';
import { SectionHeader } from '@components/SectionHeader';
import { ToolCard } from '@components/ToolCard';
import { Colors } from '@design-system/tokens';
import { logEvent } from '@services/analytics';

const QUICK_ACTIONS = [
  { id: 'scanner', name: 'Doc Scanner', icon: ScanLine, color: Colors.scanner, route: '/(tabs)/scanner' },
  { id: 'pdf_merge', name: 'Merge PDF', icon: FilePlus2, color: Colors.pdf, route: '/pdf/merge' },
  { id: 'qr_scan', name: 'Scan QR', icon: ScanLine, color: Colors.qr, route: '/qr/scan' },
  { id: 'url_shorten', name: 'Shorten URL', icon: Link2, color: Colors.urlShortener, route: '/url-shortener/shorten' },
] as const;

export const QuickActions = React.memo(function QuickActions() {
  const router = useRouter();

  const handlePress = (id: string, route: string) => {
    logEvent('tool_open', { tool_id: id, source: 'quick_actions' });
    try {
      router.push(route as never);
    } catch (error) {
      console.warn('Route unmatched, falling back:', route);
      router.push('/(tabs)/tools' as never);
    }
  };

  return (
    <View className="mb-3">
      <SectionHeader title="Quick Actions" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        className="mt-0.5"
      >
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <View key={action.id} className="w-[90px] mr-1.5">
              <ToolCard
                name={action.name}
                icon={<Icon size={26} color={action.color} />}
                color={action.color}
                onPress={() => handlePress(action.id, action.route)}
                layout="grid"
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});
