import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '../theme/colors';

interface Props {
  visible: boolean;
  onNotNow: () => void;
  onOpenSettings: () => void;
}

export default function ExactAlarmDialog({ visible, onNotNow, onOpenSettings }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onNotNow}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('exactAlarm.title')}</Text>
          <Text style={styles.body}>{t('exactAlarm.body')}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onNotNow} style={styles.textButton} accessibilityRole="button">
              <Text style={styles.textButtonLabel}>{t('exactAlarm.notNow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenSettings} style={styles.primaryButton} accessibilityRole="button">
              <Text style={styles.primaryButtonLabel}>{t('exactAlarm.openSettings')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  textButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  textButtonLabel: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginLeft: spacing.sm,
  },
  primaryButtonLabel: {
    color: colors.white,
    fontWeight: '700',
  },
});
