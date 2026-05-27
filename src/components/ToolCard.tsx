/**
 * ToolCard — Card for displaying a tool in the grid/list
 *
 * Shows tool icon (colored background), name, and optional badge.
 * Used on: Home (quick actions), Tools grid.
 */

import React from 'react';
import { View, Text, Pressable, type ViewStyle } from 'react-native';
import { Heart } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
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
  name, description, icon, color,
  onPress, layout = 'grid', className = '', style,
  isFavorite = false, onToggleFavorite,
}: ToolCardProps) {
  const scale = useSharedValue(1);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
      scale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  if (layout === 'list') {
    return (
      <Card
        variant="flat"
        onPress={onPress}
        className={`flex-row items-center p-2 ${className}`}
        style={style}
        accessibilityLabel={name}
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
      accessibilityLabel={name}
    >
      {onToggleFavorite && (
        <Pressable
          onPress={handleFavoritePress}
          style={({ pressed }) => [
            { position: 'absolute', top: 0, right: 0, padding: 8, zIndex: 10 },
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Animated.View style={heartStyle}>
            <Heart
              size={18}
              color={isFavorite ? '#BA1A1A' : '#73777F'}
              fill={isFavorite ? '#BA1A1A' : 'transparent'}
            />
          </Animated.View>
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

    </Card>
  );
}
