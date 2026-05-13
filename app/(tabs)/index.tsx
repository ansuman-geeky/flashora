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
import { ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function HomeScreen() {
  const { colors } = useTheme();
  const { query, setQuery, results, isSearching, clearSearch } = useToolSearch();

  const handleClearSearch = () => {
    clearSearch();
    Keyboard.dismiss();
  };

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
