/**
 * ToolCard — Card for displaying a tool in the grid/list
 *
 * Shows tool icon (colored background), name, and optional badge.
 * Used on: Home (quick actions), Tools grid.
 */

import React from 'react';
import { View, Text, Pressable, type ViewStyle } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Card } from './Card';
import { Badge } from './Badge';

export interface ToolCardProps {
  /** Tool display name */
  name: string;
  /** Tool description */
  description?: string;
  /** Lucide icon element */
  icon: React.ReactNode;
  /** Category color hex for the icon background */
  color: string;
  /** Whether this is a premium-only tool */
  isPremium?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Layout mode */
  layout?: 'grid' | 'list';
  className?: string;
  style?: ViewStyle;
  /** Favorites management */
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ToolCard({
  name, description, icon, color, isPremium = false,
  onPress, layout = 'grid', className = '', style,
  isFavorite = false, onToggleFavorite,
}: ToolCardProps) {
  if (layout === 'list') {
    return (
      <Card
        variant="flat"
        onPress={onPress}
        className={`flex-row items-center p-2 ${className}`}
        style={style}
        accessibilityLabel={`${name}${isPremium ? ', premium' : ''}`}
      >
        {/* Icon */}
        <View
          className="w-[48px] h-[48px] rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </View>

        {/* Text */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-medium text-onSurface dark:text-onSurface-dark">
              {name}
            </Text>
            {isPremium && (
              <Badge label="PRO" variant="premium" size="sm" className="ml-2" />
            )}
          </View>
          {description && (
            <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-0.5" numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>
      </Card>
    );
  }

  // Grid layout
  return (
    <Card
      variant="flat"
      onPress={onPress}
      className={`items-center px-1 py-3 relative ${className}`}
      style={style}
      accessibilityLabel={`${name}${isPremium ? ', premium' : ''}`}
    >
      {onToggleFavorite && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          style={({ pressed }) => [
            { position: 'absolute', top: 8, right: 8, padding: 4, zIndex: 10 },
            pressed && { transform: [{ scale: 0.8 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            color={isFavorite ? '#BA1A1A' : '#73777F'}
            fill={isFavorite ? '#BA1A1A' : 'transparent'}
          />
        </Pressable>
      )}

      {/* Icon */}
      <View
        className="w-[56px] h-[56px] rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: `${color}15` }}
      >
        {icon}
      </View>

      {/* Name */}
      <Text
        className="text-sm font-medium text-onSurface dark:text-onSurface-dark text-center px-1"
        numberOfLines={2}
      >
        {name}
      </Text>

      {/* Premium badge */}
      {isPremium && (
        <Badge label="PRO" variant="premium" size="sm" className="mt-0.5" />
      )}
    </Card>
  );
}
