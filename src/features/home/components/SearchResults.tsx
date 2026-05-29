/**
 * SearchResults — Displays filtered tool results during search
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText, QrCode, ImageIcon, Repeat2, Link2,
  FilePlus2, Scissors, Minimize2, ImagePlus, FileImage,
  ArrowUpDown, Lock, ScanLine, Scaling, Crop, ShieldOff,
  ArrowLeftRight, type LucideIcon,
} from 'lucide-react-native';
import { ToolCard } from '@components/ToolCard';
import { EmptyState } from '@components/EmptyState';
import { Colors } from '@design-system/tokens';
import { logEvent } from '@services/analytics';
import { Search } from 'lucide-react-native';
import { useTheme } from '@hooks/useTheme';
import type { Tool } from '@app-types/tool';

const ICON_MAP: Record<string, LucideIcon> = {
  'file-text': FileText, 'qr-code': QrCode, image: ImageIcon,
  'repeat-2': Repeat2, 'link-2': Link2, 'file-plus-2': FilePlus2,
  scissors: Scissors, 'minimize-2': Minimize2, 'image-plus': ImagePlus,
  'file-image': FileImage, 'arrow-up-down': ArrowUpDown, lock: Lock,
  'scan-line': ScanLine, scaling: Scaling, crop: Crop,
  'shield-off': ShieldOff, 'arrow-left-right': ArrowLeftRight,
};

interface SearchResultsProps {
  results: Tool[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = (tool: Tool) => {
    logEvent('tool_open', { tool_id: tool.id, source: 'search' });
    router.push(tool.route as never);
  };

  if (results.length === 0) {
    return (
      <EmptyState
        icon={<Search size={28} color={colors.onSurfaceVariant} />}
        title="No results"
        description={`No tools match "${query}". Try a different search term.`}
      />
    );
  }

  return (
    <View className="px-2 pt-1">
      <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mb-1">
        {results.length} result{results.length !== 1 ? 's' : ''}
      </Text>
      {results.map((tool) => {
        const Icon = ICON_MAP[tool.icon] ?? FileText;
        return (
          <View key={tool.id} className="mb-1">
            <ToolCard
              name={tool.name}
              description={tool.description}
              icon={<Icon size={22} color={tool.color} />}
              color={tool.color}
              onPress={() => handlePress(tool)}
              layout="list"
            />
          </View>
        );
      })}
    </View>
  );
}
