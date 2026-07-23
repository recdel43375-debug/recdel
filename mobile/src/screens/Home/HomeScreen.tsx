import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from '../../navigation/types';
import { colors, spacing, radii } from '../../theme/colors';
import { appsStore } from '../../store/appsStore';
import { settingsStore } from '../../store/settingsStore';
import { notificationCaptureStore } from '../../services/notificationCaptureStore';
import { StatusReaderModule } from '../../native/StatusReaderModule';
import { NotificationCaptureModule } from '../../native/NotificationCaptureModule';
import { ForegroundServiceModule } from '../../native/ForegroundServiceModule';
import { SystemSettingsModule } from '../../native/SystemSettingsModule';
import type { ConversationSummary, MonitoredApp } from '../../types/models';
import PermissionRequiredModal from '../../components/PermissionRequiredModal';
import ExactAlarmDialog from '../../components/ExactAlarmDialog';

type Nav = NativeStackNavigationProp<NotificationStackParamList, 'Home'>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const [monitoredApps, setMonitoredApps] = useState<MonitoredApp[]>([]);
  const [feed, setFeed] = useState<ConversationSummary[]>([]);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [folderAccessGranted, setFolderAccessGranted] = useState(settingsStore.getSafFolderGranted());
  const [notificationAccessGranted, setNotificationAccessGranted] = useState(settingsStore.getNotificationAccessGranted());
  const [exactAlarmDialogVisible, setExactAlarmDialogVisible] = useState(false);

  const refresh = useCallback(() => {
    setMonitoredApps(appsStore.getMonitoredApps());
    notificationCaptureStore.getConversationFeed().then(setFeed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();

      let cancelled = false;
      (async () => {
        try {
          const hasFolder = await StatusReaderModule.hasFolderAccess();
          const hasNotif = await NotificationCaptureModule.hasNotificationAccess();
          if (cancelled) return;
          settingsStore.setSafFolderGranted(hasFolder);
          settingsStore.setNotificationAccessGranted(hasNotif);
          setFolderAccessGranted(hasFolder);
          setNotificationAccessGranted(hasNotif);
          if (!hasFolder || !hasNotif) {
            setPermissionModalVisible(true);
            return;
          }

          if (appsStore.getMonitoredApps().length > 0) {
            // Permissions are granted and there's something to watch — make
            // sure the persistent capture service is actually running.
            ForegroundServiceModule.start();
          }

          // Section 3.4: prompt for exact-alarm permission once notification
          // access is already granted, so background status re-checks stay reliable.
          if (!settingsStore.getExactAlarmGranted()) {
            const hasExactAlarm = await SystemSettingsModule.hasExactAlarmPermission();
            if (cancelled) return;
            if (hasExactAlarm) {
              settingsStore.setExactAlarmGranted(true);
            } else {
              setExactAlarmDialogVisible(true);
            }
          }
        } catch {
          // Native module not yet linked (e.g. running JS-only during development).
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [refresh])
  );

  useEffect(() => {
    const subscription = NotificationCaptureModule.subscribe(() => refresh());
    return () => subscription.remove();
  }, [refresh]);

  const handleRequestFolderAccess = async () => {
    try {
      const granted = await StatusReaderModule.requestFolderAccess();
      settingsStore.setSafFolderGranted(granted);
      setFolderAccessGranted(granted);
    } catch {
      // ignore in JS-only dev mode
    }
  };

  const handleRequestNotificationAccess = () => {
    try {
      NotificationCaptureModule.openNotificationAccessSettings();
    } catch {
      // ignore in JS-only dev mode
    }
  };

  const handleAppTilePress = (app: MonitoredApp) => {
    if (app.hasStatusFolder) {
      navigation.navigate('AppStatusViewer', { packageName: app.packageName, displayName: app.displayName });
    } else {
      navigation.navigate('RecoveredMessageDetail', { contactId: app.packageName, contactName: app.displayName });
    }
  };

  const renderListHeader = () => (
    <View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.appRow}
        contentContainerStyle={styles.appRowContent}
        data={monitoredApps}
        keyExtractor={(item) => item.packageName}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addAppTile} onPress={() => navigation.navigate('ChooseApp')} accessibilityRole="button">
            <View style={styles.addAppCircle}>
              <Text style={styles.addAppPlus}>+</Text>
            </View>
            <Text style={styles.appTileLabel}>{t('home.addApp')}</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.appTile} onPress={() => handleAppTilePress(item)} accessibilityRole="button">
            <View style={styles.appIconWrapper}>
              {item.iconUri ? (
                <Image source={{ uri: item.iconUri }} style={styles.appIcon} />
              ) : (
                <View style={[styles.appIcon, styles.appIconPlaceholder]} />
              )}
              {item.isMonitoring ? (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.appTileLabel} numberOfLines={1}>
              {item.displayName}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderEmpty = () =>
    monitoredApps.length === 0 || feed.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{t('home.noChatFound')}</Text>
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RecDel</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Premium" style={styles.headerIconButton}>
            <Text style={styles.headerIcon}>👑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('home.addApp')}
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('ChooseApp')}
          >
            <Text style={styles.headerIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={feed}
        keyExtractor={(item) => item.contactId}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationRow}
            onPress={() =>
              navigation.navigate('RecoveredMessageDetail', {
                contactId: item.contactId,
                contactName: item.contactName,
                avatarUri: item.avatarUri,
              })
            }
          >
            {item.avatarUri ? (
              <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{item.contactName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.conversationBody}>
              <View style={styles.conversationTopRow}>
                <Text style={styles.contactName} numberOfLines={1}>
                  {item.contactName}
                </Text>
                <Text style={styles.timestamp}>{formatTimestamp(item.lastMessageAt)}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {item.lastMessagePreview}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <PermissionRequiredModal
        visible={permissionModalVisible}
        folderAccessGranted={folderAccessGranted}
        notificationAccessGranted={notificationAccessGranted}
        onRequestFolderAccess={handleRequestFolderAccess}
        onRequestNotificationAccess={handleRequestNotificationAccess}
        onSkip={() => setPermissionModalVisible(false)}
      />

      <ExactAlarmDialog
        visible={exactAlarmDialogVisible}
        onNotNow={() => setExactAlarmDialogVisible(false)}
        onOpenSettings={() => {
          setExactAlarmDialogVisible(false);
          try {
            SystemSettingsModule.openExactAlarmSettings();
          } catch {
            // ignore in JS-only dev mode
          }
        }}
      />
    </View>
  );
}

function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${period}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  header: {
    height: 56,
    backgroundColor: colors.darkGreenHeader,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconButton: {
    marginLeft: spacing.md,
  },
  headerIcon: {
    color: colors.white,
    fontSize: 20,
  },
  appRow: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
  },
  appRowContent: {
    paddingHorizontal: spacing.md,
  },
  addAppTile: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 64,
  },
  addAppCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.dashedBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAppPlus: {
    fontSize: 24,
    color: colors.dashedBorder,
  },
  appTile: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 64,
  },
  appIconWrapper: {
    position: 'relative',
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
  },
  appIconPlaceholder: {
    backgroundColor: colors.screenBackground,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.checkmarkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  checkBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  appTileLabel: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  conversationBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  preview: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
