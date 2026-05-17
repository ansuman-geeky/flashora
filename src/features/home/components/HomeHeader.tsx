/**
 * HomeHeader — App branding + search bar
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { Input } from '@components/Input';
import { IconButton } from '@components/IconButton';
import { useTheme } from '@hooks/useTheme';

interface HomeHeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  isSearching: boolean;
  onClearSearch: () => void;
}

export function HomeHeader({
  query, onQueryChange, isSearching, onClearSearch,
}: HomeHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="px-2 pt-2 pb-1.5">
      {/* Branding row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Image
            source={require('../../../../assets/header-icon.png')}
            className="w-14 h-14 rounded-2xl"
            resizeMode="contain"
          />
          <View className="ml-3 justify-center">
            <Text className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
              Flashora-Scanner & PDF Tools
            </Text>
            <Text className="text-xs text-text-tertiary dark:text-text-secondary-dark">
              Fast. Smart. Utility.
            </Text>
          </View>
        </View>
      </View>

      {/* Search bar */}
      <Input
        variant="search"
        placeholder="Search tools..."
        value={query}
        onChangeText={onQueryChange}
        leftIcon={<Search size={18} color={colors.textTertiary} />}
        rightIcon={
          isSearching ? (
            <IconButton
              icon={<X size={16} color={colors.textTertiary} />}
              onPress={onClearSearch}
              size="sm"
              variant="ghost"
              accessibilityLabel="Clear search"
            />
          ) : undefined
        }
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
