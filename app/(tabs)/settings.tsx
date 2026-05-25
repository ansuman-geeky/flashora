/**
 * Settings Tab Screen
 *
 * App settings: theme toggle, about, links.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Moon,
  Sun,
  Info,
  Shield,
  Mail,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { Card } from '@components/Card';
import { Divider } from '@components/Divider';
import { useAppStore } from '@store/useAppStore';
import { useTheme } from '@hooks/useTheme';
import { APP_CONFIG } from '@constants/config';

/** Settings row component */
function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      className="flex-row items-center py-1.5 px-2"
      onPress={onPress}
      disabled={!onPress && !rightElement}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
    >
      <View
        className="w-[36px] h-[36px] rounded-md bg-primary-muted dark:bg-surface-dark items-center justify-center mr-1.5"
        style={{ backgroundColor: isDark ? Colors.surfaceRaisedDark : Colors.primaryMuted }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-text-primary dark:text-text-primary-dark">
          {label}
        </Text>
        {value && (
          <Text className="text-xs text-text-tertiary dark:text-text-secondary-dark mt-0.5">
            {value}
          </Text>
        )}
      </View>
      {rightElement ?? (
        onPress ? (
          <ChevronRight size={20} color={colors.textTertiary} />
        ) : null
      )}
    </Pressable>
  );
}

/** Theme selector — Light / Dark toggle only */
function ThemeSelector() {
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const { colors, isDark } = useTheme();

  const themes: { mode: 'light' | 'dark'; icon: any; label: string }[] = [
    { mode: 'light', icon: Sun, label: 'Light' },
    { mode: 'dark', icon: Moon, label: 'Dark' },
  ];

  return (
    <View
      className="mx-2 flex-row gap-0.5 rounded-md p-0.5"
      style={{ backgroundColor: isDark ? Colors.borderDark : Colors.border }}
    >
      {themes.map(({ mode, icon: Icon, label }) => {
        const isActive = themeMode === mode;
        return (
          <Pressable
            key={mode}
            className={`flex-1 flex-row items-center justify-center py-1.5 rounded-sm`}
            style={{
              backgroundColor: isActive
                ? isDark ? Colors.surfaceRaisedDark : Colors.surface
                : 'transparent',
              elevation: isActive ? 1 : 0,
            }}
            onPress={() => setThemeMode(mode)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            accessibilityLabel={`${label} theme`}
          >
            <Icon
              size={14}
              color={isActive ? Colors.primary : colors.textSecondary}
            />
            <Text
              style={{
                fontSize: 12,
                marginLeft: 4,
                fontWeight: isActive ? '600' : '400',
                color: isActive ? Colors.primary : colors.textSecondary,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-2 pt-2 pb-1.5">
          <Text className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Settings
          </Text>
        </View>

        {/* Theme section */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark px-2 mb-1">
            APPEARANCE
          </Text>
          <ThemeSelector />
        </View>

        <Divider spacing="sm" className="mx-2" />

        {/* General section */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark px-2 mb-1 mt-1.5">
            GENERAL
          </Text>
          <SettingsRow
            icon={<Star size={18} color={Colors.primary} />}
            label="Premium"
            value="Manage your subscription"
            onPress={() => {
              router.push('/(tabs)/premium');
            }}
          />
          <SettingsRow
            icon={<Shield size={18} color={Colors.primary} />}
            label="Privacy Policy"
            onPress={() => {
              // Open privacy policy URL
            }}
          />
          <SettingsRow
            icon={<Mail size={18} color={Colors.primary} />}
            label="Contact Support"
            value="flashora@support.com"
            onPress={() => {
              // Open email client
            }}
          />
        </View>

        <Divider spacing="sm" className="mx-2" />

        {/* About section */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark px-2 mb-1 mt-1.5">
            ABOUT
          </Text>
          <SettingsRow
            icon={<Info size={18} color={Colors.primary} />}
            label={APP_CONFIG.name}
            value={`Version ${APP_CONFIG.version}`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
