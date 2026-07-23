import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, SectionList, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TrashFilesStackParamList } from '../../navigation/types';
import { colors, spacing, radii } from '../../theme/colors';
import { loadTrashEntries, deleteTrashEntry } from '../../services/trashService';
import type { TrashEntry } from '../../types/models';

type Nav = NativeStackNavigationProp<TrashFilesStackParamList, 'TrashFiles'>;

interface Section {
  title: string;
  data: TrashEntry[];
}

function groupByDate(entries: TrashEntry[]): Section[] {
  const groups = new Map<string, TrashEntry[]>();
  for (const entry of entries) {
    const label = new Date(entry.capturedAt).toDateString();
    const list = groups.get(label) ?? [];
    list.push(entry);
    groups.set(label, list);
  }
  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

export default function TrashFilesScreen() {
  const navigation = useNavigation<Nav>();
  const [sections, setSections] = useState<Section[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSections(groupByDate(loadTrashEntries()));
    }, [])
  );

  const handleOpen = (entry: TrashEntry) => {
    if (entry.mediaType === 'video') {
      navigation.navigate('FullScreenVideoPlayer', {
        uri: entry.uri,
        title: entry.sourceName,
        packageName: entry.packageName,
        fileId: entry.id,
      });
    } else {
      navigation.navigate('FullScreenImageViewer', { uri: entry.uri, title: entry.sourceName });
    }
  };

  const handleDelete = (entry: TrashEntry) => {
    Alert.alert('Delete file', 'Remove this file from RecDel? This only removes it from RecDel, not from your device gallery.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTrashEntry(entry);
          setSections(groupByDate(loadTrashEntries()));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trash Files</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => handleOpen(item)} onLongPress={() => handleDelete(item)}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            <View style={styles.rowBody}>
              <Text style={styles.sourceName}>{item.sourceName}</Text>
              <Text style={styles.meta}>
                {item.mediaType === 'video' ? 'Video' : 'Image'} · {new Date(item.capturedAt).toLocaleTimeString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No Chat Found!</Text>
          </View>
        }
        contentContainerStyle={sections.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
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
  sectionHeader: {
    backgroundColor: colors.screenBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.screenBackground,
  },
  rowBody: {
    marginLeft: spacing.md,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
