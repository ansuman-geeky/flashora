import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Shadow } from '@design-system/tokens';
import { useTheme } from '@hooks/useTheme';
import { House, Wrench, ScanLine, Settings, LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const ICON_MAP: Record<string, LucideIcon> = {
  index: House,
  tools: Wrench,
  scanner: ScanLine,
  settings: Settings,
};

const LABEL_MAP: Record<string, string> = {
  index: 'Home',
  tools: 'Tools',
  scanner: 'Scanner',
  settings: 'Settings',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark, colors } = useTheme();
  const router = useRouter();

  const handleTabPress = useCallback((routeName: string, routeKey: string, isFocused: boolean) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      if (!isFocused) {
        navigation.navigate(routeName);
      }
    }
  }, [navigation, router]);

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? colors.surface : colors.bg,
          borderTopColor: colors.outlineVariant,
        }
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]!;
        const isFocused = state.index === index;
        const Icon = ICON_MAP[route.name] || House;
        const label = LABEL_MAP[route.name] || route.name;

        return (
          <Pressable
            key={route.key}
            onPress={() => handleTabPress(route.name, route.key, isFocused)}
            style={styles.tabButton}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
          >
            <View style={styles.iconContainer}>
              <Icon 
                size={isFocused ? 24 : 22} 
                color={isFocused ? colors.onSecondaryContainer : colors.onSurfaceVariant} 
                strokeWidth={isFocused ? 2.5 : 2}
              />
              {isFocused && (
                <View style={[styles.activeDot, { backgroundColor: colors.secondaryContainer, zIndex: -1, width: 64, height: 32, borderRadius: 16, bottom: 0 }]} />
              )}
            </View>
            <Text 
              style={[
                styles.label, 
                { 
                  color: isFocused ? colors.onSurface : colors.onSurfaceVariant,
                  fontWeight: isFocused ? '600' : '500',
                }
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    borderTopWidth: 1,
    ...Shadow.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
