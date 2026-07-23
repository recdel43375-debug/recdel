import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/colors';
import GreenHeader from '../../components/GreenHeader';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Premium'>;

// Non-functional placeholder route (Section 4.5). Reserved for a future
// paywall: unlimited saved statuses, more monitored apps, ad removal.
export default function PremiumScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <GreenHeader title={t('premium.title')} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.glyph}>👑</Text>
        <Text style={styles.message}>{t('premium.comingSoon')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  glyph: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
