import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet, Share, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { colors, spacing, radii } from '../../theme/colors';
import { settingsStore, DEFAULT_DOWNLOAD_PATH } from '../../store/settingsStore';
import { NotificationCaptureModule } from '../../native/NotificationCaptureModule';
import { StatusReaderModule } from '../../native/StatusReaderModule';
import { ForegroundServiceModule } from '../../native/ForegroundServiceModule';
import { SUPPORTED_LANGUAGES } from '../../i18n';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.recdel.app';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const [notificationEnabled, setNotificationEnabled] = useState(settingsStore.getNotificationToggle());
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(settingsStore.getAutoSaveToggle());
  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === settingsStore.getLanguage())?.label ?? 'English';

  const toggleNotification = (value: boolean) => {
    setNotificationEnabled(value);
    settingsStore.setNotificationToggle(value);
  };

  const toggleAutoSave = (value: boolean) => {
    setAutoSaveEnabled(value);
    settingsStore.setAutoSaveToggle(value);
  };

  const handleRestartServices = () => {
    ForegroundServiceModule.restart();
  };

  const handlePermissions = async () => {
    try {
      await StatusReaderModule.requestFolderAccess();
      NotificationCaptureModule.openNotificationAccessSettings();
    } catch {
      // Native module unavailable in JS-only dev preview.
    }
  };

  const handleShareApp = () => {
    Share.share({ message: `Check out RecDel: ${PLAY_STORE_URL}` });
  };

  const handleRateUs = () => {
    Linking.openURL(PLAY_STORE_URL);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <SectionLabel label={t('settings.downloadLocation')} />
      <View style={styles.card}>
        <Text style={styles.downloadPath}>{settingsStore.getDownloadPath() || DEFAULT_DOWNLOAD_PATH}</Text>
      </View>

      <SectionLabel label={t('settings.advanceSettings')} />
      <View style={styles.card}>
        <ToggleRow label={t('settings.notification')} value={notificationEnabled} onChange={toggleNotification} />
        <Divider />
        <ToggleRow label={t('settings.autoSave')} value={autoSaveEnabled} onChange={toggleAutoSave} />
        <Divider />
        <ChevronRow label={t('settings.restartServices')} onPress={handleRestartServices} />
        <Divider />
        <ChevronRow label={t('settings.permissions')} subtitle={t('settings.permissionsDescription')} onPress={handlePermissions} />
        <Divider />
        <ChevronRow label={t('settings.chooseLanguage')} value={currentLanguage} onPress={() => navigation.navigate('LanguagePicker')} />
      </View>

      <SectionLabel label={t('settings.generalSettings')} />
      <View style={styles.card}>
        <ChevronRow label={t('settings.rememberLimitations')} onPress={() => navigation.navigate('WebViewLegal', { kind: 'limitations' })} />
        <Divider />
        <ChevronRow label={t('settings.shareApp')} onPress={handleShareApp} />
        <Divider />
        <ChevronRow label={t('settings.rateUs')} onPress={handleRateUs} />
        <Divider />
        <ChevronRow label={t('settings.privacyPolicy')} onPress={() => navigation.navigate('WebViewLegal', { kind: 'privacy' })} />
        <Divider />
        <ChevronRow label={t('settings.termsAndConditions')} onPress={() => navigation.navigate('WebViewLegal', { kind: 'terms' })} />
      </View>
    </ScrollView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primaryGreen }} />
    </View>
  );
}

function ChevronRow({ label, subtitle, value, onPress }: { label: string; subtitle?: string; value?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowTextGroup}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  header: {
    height: 56,
    backgroundColor: colors.darkGreenHeader,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowTextGroup: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  downloadPath: {
    padding: spacing.md,
    fontSize: 13,
    color: colors.textMuted,
  },
});
