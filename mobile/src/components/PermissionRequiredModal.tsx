import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '../theme/colors';

interface Props {
  visible: boolean;
  folderAccessGranted: boolean;
  notificationAccessGranted: boolean;
  onRequestFolderAccess: () => void;
  onRequestNotificationAccess: () => void;
  onSkip: () => void;
}

export default function PermissionRequiredModal({
  visible,
  folderAccessGranted,
  notificationAccessGranted,
  onRequestFolderAccess,
  onRequestNotificationAccess,
  onSkip,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('home.permissionRequiredTitle')}</Text>
          <Text style={styles.body}>{t('home.permissionRequiredBody')}</Text>

          <PermissionRow label={t('home.folderAccess')} checked={folderAccessGranted} onPress={onRequestFolderAccess} />
          <PermissionRow label={t('home.notificationAccess')} checked={notificationAccessGranted} onPress={onRequestNotificationAccess} />

          <TouchableOpacity onPress={onSkip} style={styles.skipLink} accessibilityRole="button">
            <Text style={styles.skipText}>{t('home.skipForNow')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function PermissionRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked ? <Text style={styles.checkmark}>✓</Text> : null}</View>
      <Text style={styles.rowLabel}>{label}</Text>
    </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  skipLink: {
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
