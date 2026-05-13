/**
 * HomeHeader — App branding + search bar
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Zap, Search, X } from 'lucide-react-native';
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
          <View className="w-[36px] h-[36px] rounded-md bg-primary items-center justify-center">
            <Zap size={20} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View className="ml-1.5">
            <Text className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
              Flashora
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
