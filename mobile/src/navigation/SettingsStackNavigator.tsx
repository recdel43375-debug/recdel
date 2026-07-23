import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from './types';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import LanguagePickerScreen from '../screens/Settings/LanguagePickerScreen';
import PremiumScreen from '../screens/Settings/PremiumScreen';
import WebViewLegalScreen from '../screens/Settings/WebViewLegalScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LanguagePicker" component={LanguagePickerScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="WebViewLegal" component={WebViewLegalScreen} />
    </Stack.Navigator>
  );
}
