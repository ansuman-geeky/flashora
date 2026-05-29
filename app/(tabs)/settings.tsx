/**
 * Settings Tab Screen
 *
 * App settings: theme toggle, about, links.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, Platform, Share, Linking } from 'react-native';
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
  Clock,
  Share2,
  FileText,
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
        className="w-[36px] h-[36px] rounded-md items-center justify-center mr-1.5"
        style={{ backgroundColor: `${colors.primary}15` }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-onSurface dark:text-onSurface-dark">
          {label}
        </Text>
        {value && (
          <Text className="text-xs text-outline dark:text-onSurfaceVariant-dark mt-0.5">
            {value}
          </Text>
        )}
      </View>
      {rightElement ?? (
        onPress ? (
          <ChevronRight size={20} color={colors.onSurfaceVariant} />
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
      style={{ backgroundColor: colors.outlineVariant }}
    >
      {themes.map(({ mode, icon: Icon, label }) => {
        const isActive = themeMode === mode;
        return (
          <Pressable
            key={mode}
            className={`flex-1 flex-row items-center justify-center py-1.5 rounded-sm`}
            style={{
              backgroundColor: isActive
                ? colors.surface
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
              color={isActive ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
              style={{
                fontSize: 12,
                marginLeft: 4,
                fontWeight: isActive ? '600' : '400',
                color: isActive ? colors.primary : colors.onSurfaceVariant,
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
          <Text className="text-2xl font-bold text-onSurface dark:text-onSurface-dark">
            Settings
          </Text>
        </View>

        {/* Theme section */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-onSurfaceVariant dark:text-onSurfaceVariant-dark px-2 mb-1">
            APPEARANCE
          </Text>
          <ThemeSelector />
        </View>

        <Divider spacing="sm" className="mx-2" />

        {/* General section */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-onSurfaceVariant dark:text-onSurfaceVariant-dark px-2 mb-1 mt-1.5">
            GENERAL
          </Text>

          <SettingsRow
            icon={<Clock size={18} color={Colors.primary} />}
            label="Recent Activity"
            value="View your tool usage history"
            onPress={() => {
              router.push('/activity' as never);
            }}
          />
          <SettingsRow
            icon={<Shield size={18} color={Colors.primary} />}
            label="Privacy Policy"
            onPress={() => {
              router.push('/privacy' as never);
            }}
          />
          <SettingsRow
            icon={<FileText size={18} color={Colors.primary} />}
            label="Terms & Conditions"
            onPress={() => {
              router.push('/terms' as never);
            }}
          />
          <SettingsRow
            icon={<Share2 size={18} color={Colors.primary} />}
            label="Share App"
            value="Share Flashora with friends"
            onPress={async () => {
              try {
                await Share.share({
                  message: `Try Flashora – powerful PDF & Image tools app:\nhttps://play.google.com/store/apps/details?id=${APP_CONFIG.packageName}`,
                });
              } catch (error) {
                console.warn('Sharing failed:', error);
              }
            }}
          />
          <SettingsRow
            icon={<Mail size={18} color={Colors.primary} />}
            label="Contact Support"
            value="support@flashsuite.pro"
            onPress={() => {
              void Linking.openURL('mailto:support@flashsuite.pro?subject=Flashora Support Request');
            }}
          />
        </View>

        <Divider spacing="sm" className="mx-2" />

        {/* About section */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-onSurfaceVariant dark:text-onSurfaceVariant-dark px-2 mb-1 mt-1.5">
            ABOUT
          </Text>
          <SettingsRow
            icon={<Info size={18} color={Colors.primary} />}
            label={APP_CONFIG.name}
            value={`Version ${APP_CONFIG.version}`}
            onPress={() => {
              router.push('/about' as never);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
