/**
 * Home Tab Screen — Full implementation
 *
 * Sections:
 * 1. HomeHeader (branding + search bar)
 * 2. Search results (when searching)
 * 3. Quick Actions (4 curated tools)
 * 4. Category strip (horizontal pills)
 * 5. Recent Tools (from history)
 * 6. Native ad banner (bottom)
 */

import React from 'react';
import { ScrollView, Keyboard, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  HomeHeader,
  QuickActions,
  RecentTools,
  SearchResults,
  CategoryStrip,
  NativeAdBanner,
} from '@features/home';
import { useToolSearch } from '@features/home/hooks/useToolSearch';
import { logEvent } from '@services/analytics';
import { useTheme } from '@hooks/useTheme';
import { useAppStore } from '@store/useAppStore';
import { TOOLS_BY_ID } from '@constants/tools';
import { ToolCard } from '@components/ToolCard';
import { SectionHeader } from '@components/SectionHeader';
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

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { query, setQuery, results, isSearching, clearSearch } = useToolSearch();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const handleClearSearch = () => {
    clearSearch();
    Keyboard.dismiss();
  };

  // Resolve favorite tool details
  const favoriteTools = favorites
    .map((id) => TOOLS_BY_ID[id])
    .filter((tool): tool is NonNullable<typeof tool> => !!tool);

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header + Search */}
        <HomeHeader
          query={query}
          onQueryChange={setQuery}
          isSearching={isSearching}
          onClearSearch={handleClearSearch}
        />

        {isSearching ? (
          /* Search mode — show filtered results */
          <SearchResults results={results} query={query} />
        ) : (
          /* Default mode — show home sections */
          <>
            {/* Quick Actions */}
            <QuickActions />

            {/* Category Strip */}
            <CategoryStrip />

            {/* Favorites Section (Only shown if user has favorited tools) */}
            {favoriteTools.length > 0 && (
              <View className="mb-3">
                <SectionHeader title="Favorites" />
                <View className="flex-row flex-wrap px-1.5">
                  {favoriteTools.map((tool) => {
                    const Icon = ICON_MAP[tool.icon] ?? FileText;
                    return (
                      <View key={tool.id} className="w-1/3 p-0.5">
                        <ToolCard
                          name={tool.name}
                          icon={<Icon size={24} color={tool.color} />}
                          color={tool.color}
                          isPremium={tool.isPremium}
                          onPress={() => router.push(tool.route as never)}
                          layout="grid"
                          isFavorite={true}
                          onToggleFavorite={() => toggleFavorite(tool.id)}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Recent Tools */}
            <RecentTools />

            {/* Native Ad Banner */}
            <NativeAdBanner />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
