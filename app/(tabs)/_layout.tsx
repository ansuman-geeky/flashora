/**
 * Tabs Layout — Bottom tab navigator with custom floating tab bar
 *
 * 5 tabs: Home, Tools, Activity, Premium, Settings
 * Uses CustomTabBar for floating pill design.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Extra bottom padding to account for floating tab bar
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarAccessibilityLabel: 'Tools tab',
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarAccessibilityLabel: 'Activity tab',
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: 'Premium',
          tabBarAccessibilityLabel: 'Premium tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs>
  );
}
