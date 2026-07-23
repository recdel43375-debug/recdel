import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import type { MainTabsParamList } from './types';
import { colors } from '../theme/colors';
import NotificationStackNavigator from './NotificationStackNavigator';
import TrashFilesStackNavigator from './TrashFilesStackNavigator';
import StatusStackNavigator from './StatusStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICONS: Record<keyof MainTabsParamList, string> = {
  NotificationTab: '🔔',
  TrashFilesTab: '🗑️',
  StatusTab: '📷',
  SettingsTab: '⚙️',
};

export default function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryGreen,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>{TAB_ICONS[route.name as keyof MainTabsParamList]}</Text>,
      })}
    >
      <Tab.Screen name="NotificationTab" component={NotificationStackNavigator} options={{ title: t('tabs.notification') }} />
      <Tab.Screen name="TrashFilesTab" component={TrashFilesStackNavigator} options={{ title: t('tabs.trashFiles') }} />
      <Tab.Screen name="StatusTab" component={StatusStackNavigator} options={{ title: t('tabs.status') }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
