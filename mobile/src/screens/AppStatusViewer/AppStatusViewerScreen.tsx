import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/colors';
import GreenHeader from '../../components/GreenHeader';
import StatusGrid from '../../components/StatusGrid';
import { loadLiveStatusFiles, loadSavedStatusFiles, saveStatusFile } from '../../services/statusService';
import { api } from '../../services/api';
import type { StatusFileEntry } from '../../types/models';

type Nav = NativeStackNavigationProp<NotificationStackParamList, 'AppStatusViewer'>;
type Route = RouteProp<NotificationStackParamList, 'AppStatusViewer'>;

type TabKey = 'photos' | 'videos' | 'saved';

function showSavedToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}

export default function AppStatusViewerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { packageName, displayName } = route.params;

  const [tab, setTab] = useState<TabKey>('photos');
  const [photos, setPhotos] = useState<StatusFileEntry[]>([]);
  const [videos, setVideos] = useState<StatusFileEntry[]>([]);
  const [saved, setSaved] = useState<StatusFileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, v] = await Promise.all([
        loadLiveStatusFiles(packageName, 'image'),
        loadLiveStatusFiles(packageName, 'video'),
      ]);
      setPhotos(p);
      setVideos(v);
      setSaved(loadSavedStatusFiles(packageName));
    } catch {
      // Native module unavailable (JS-only dev preview) — leave lists empty.
    } finally {
      setLoading(false);
    }
  }, [packageName]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleDownload = async (entry: StatusFileEntry) => {
    if (entry.saved) return;
    const updated = await saveStatusFile(packageName, entry);
    setPhotos((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setVideos((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setSaved(loadSavedStatusFiles(packageName));
    showSavedToast(t('statusViewer.fileSaved'));
    api.sendTelemetryEvent('status_saved_count');
  };

  const openItem = (entry: StatusFileEntry) => {
    if (entry.mediaType === 'video') {
      navigation.navigate('FullScreenVideoPlayer', {
        uri: entry.savedUri ?? entry.uri,
        title: entry.fileName,
        packageName,
        fileId: entry.id,
      });
    } else {
      navigation.navigate('FullScreenImageViewer', { uri: entry.savedUri ?? entry.uri, title: entry.fileName });
    }
  };

  return (
    <View style={styles.container}>
      <GreenHeader
        title={displayName}
        onBack={() => navigation.goBack()}
        rightSlot={
          <View style={styles.headerIcons}>
            <Text style={styles.headerIcon}>👑</Text>
            <Text style={[styles.headerIcon, styles.filterIcon]}>⏷</Text>
          </View>
        }
      />

      <View style={styles.tabRow}>
        <TabButton label={t('statusViewer.photos')} active={tab === 'photos'} onPress={() => setTab('photos')} />
        <TabButton label={t('statusViewer.videos')} active={tab === 'videos'} onPress={() => setTab('videos')} />
        <TabButton label={t('statusViewer.savedStatus')} active={tab === 'saved'} onPress={() => setTab('saved')} />
      </View>

      {tab === 'photos' && (
        <StatusGrid data={photos} loading={loading} onPressItem={openItem} onPressDownload={handleDownload} emptyLabel={t('home.noChatFound')} />
      )}
      {tab === 'videos' && (
        <StatusGrid
          data={videos}
          loading={loading}
          showPlayOverlay
          onPressItem={openItem}
          onPressDownload={handleDownload}
          emptyLabel={t('home.noChatFound')}
        />
      )}
      {tab === 'saved' && <StatusGrid data={saved} onPressItem={openItem} onPressDownload={() => {}} emptyLabel={t('home.noChatFound')} />}
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    color: colors.white,
    fontSize: 18,
    marginLeft: spacing.md,
  },
  filterIcon: {
    fontSize: 16,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primaryGreen,
  },
  tabLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  tabLabelActive: {
    color: colors.primaryGreen,
  },
});
