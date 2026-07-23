import React from 'react';
import { View, Image, TouchableOpacity, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';
import type { StatusFileEntry } from '../types/models';

interface Props {
  data: StatusFileEntry[];
  loading?: boolean;
  showPlayOverlay?: boolean;
  onPressItem: (item: StatusFileEntry) => void;
  onPressDownload: (item: StatusFileEntry) => void;
  emptyLabel: string;
}

const NUM_COLUMNS = 3;

export default function StatusGrid({ data, loading, showPlayOverlay, onPressItem, onPressDownload, emptyLabel }: Props) {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryGreen} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.tile} onPress={() => onPressItem(item)} activeOpacity={0.85}>
          <Image source={{ uri: item.uri }} style={styles.thumbnail} />
          {showPlayOverlay ? (
            <View style={styles.playOverlay}>
              <Text style={styles.playGlyph}>▶</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.downloadOverlay}
            onPress={(e) => {
              e.stopPropagation();
              onPressDownload(item);
            }}
            hitSlop={8}
          >
            <Text style={styles.downloadGlyph}>{item.saved ? '✓' : '⬇'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const TILE_SIZE = '32%';

const styles = StyleSheet.create({
  grid: {
    padding: spacing.xs,
  },
  tile: {
    width: TILE_SIZE,
    aspectRatio: 1,
    margin: '0.66%',
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.screenBackground,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: colors.white,
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
  downloadOverlay: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadGlyph: {
    color: colors.white,
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
