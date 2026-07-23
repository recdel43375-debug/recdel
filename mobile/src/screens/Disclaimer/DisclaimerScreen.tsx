import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '../../theme/colors';
import { settingsStore } from '../../store/settingsStore';
import { api } from '../../services/api';

interface Props {
  onAccepted: () => void;
}

export default function DisclaimerScreen({ onAccepted }: Props) {
  const { t } = useTranslation();

  const handleAccept = () => {
    settingsStore.setHasAcceptedDisclaimer(true);
    api.sendTelemetryEvent('disclaimer_accepted');
    onAccepted();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconGlyph}>🗑️</Text>
        </View>
        <Text style={styles.appName}>{t('disclaimer.title')}</Text>
      </View>

      <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
        <Text style={styles.paragraph}>{t('disclaimer.body1')}</Text>
        <Text style={styles.paragraph}>{t('disclaimer.body2')}</Text>
        <Text style={styles.paragraph}>{t('disclaimer.body3')}</Text>
        <Text style={styles.paragraph}>{t('disclaimer.body4')}</Text>
      </ScrollView>

      <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} accessibilityRole="button">
        <Text style={styles.acceptButtonText}>{t('disclaimer.accept')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.disclaimerBackground,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconBadge: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconGlyph: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
  },
  cardContent: {
    padding: spacing.lg,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  acceptButton: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  acceptButtonText: {
    color: colors.primaryGreen,
    fontSize: 16,
    fontWeight: '700',
  },
});
