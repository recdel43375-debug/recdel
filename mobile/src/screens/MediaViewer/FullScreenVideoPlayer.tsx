import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Video, { VideoRef, OnLoadData, OnProgressData } from 'react-native-video';
import Slider from '@react-native-community/slider';
import Share from 'react-native-share';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/colors';
import { saveStatusFile } from '../../services/statusService';
import type { StatusFileEntry } from '../../types/models';

type Nav = NativeStackNavigationProp<NotificationStackParamList, 'FullScreenVideoPlayer'>;
type Route = RouteProp<NotificationStackParamList, 'FullScreenVideoPlayer'>;

const SEEK_SECONDS = 10;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FullScreenVideoPlayer() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { uri, title, packageName, fileId } = route.params;

  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [savedUri, setSavedUri] = useState<string | null>(null);

  const seekBy = (delta: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + delta));
    videoRef.current?.seek(target);
    setCurrentTime(target);
  };

  const handleLoad = (data: OnLoadData) => setDuration(data.duration);
  const handleProgress = (data: OnProgressData) => {
    if (!scrubbing) setCurrentTime(data.currentTime);
  };

  const handleDownload = async () => {
    if (savedUri) return;
    const entry: StatusFileEntry = {
      id: fileId,
      uri,
      fileName: title,
      mediaType: 'video',
      mtime: Date.now(),
      sizeBytes: 0,
      saved: false,
    };
    const result = await saveStatusFile(packageName, entry);
    setSavedUri(result.savedUri ?? null);
  };

  const handleShare = async () => {
    try {
      await Share.open({ url: savedUri ?? uri, type: 'video/mp4' });
    } catch {
      // user cancelled share sheet
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity onPress={handleDownload} hitSlop={12} style={styles.headerRightIcon}>
            <Text style={styles.headerIcon}>{savedUri ? '✓' : '⬇'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} hitSlop={12}>
            <Text style={styles.headerIcon}>⤴</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode="contain"
        paused={paused}
        onLoad={handleLoad}
        onProgress={handleProgress}
        repeat
      />

      <TouchableOpacity style={styles.tapCatcher} activeOpacity={1} onPress={() => setPaused((p) => !p)}>
        <View style={styles.centerControls}>
          <TouchableOpacity onPress={() => seekBy(-SEEK_SECONDS)} hitSlop={16}>
            <Text style={styles.controlGlyph}>◄◄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPaused((p) => !p)} hitSlop={16} style={styles.playPauseButton}>
            <Text style={styles.playPauseGlyph}>{paused ? '▶' : '❚❚'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => seekBy(SEEK_SECONDS)} hitSlop={16}>
            <Text style={styles.controlGlyph}>►►</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={styles.scrubberRow}>
        <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={currentTime}
          minimumTrackTintColor={colors.primaryGreen}
          maximumTrackTintColor={colors.scrubberTrack}
          thumbTintColor={colors.primaryGreen}
          onSlidingStart={() => setScrubbing(true)}
          onSlidingComplete={(value) => {
            setScrubbing(false);
            videoRef.current?.seek(value);
            setCurrentTime(value);
          }}
        />
        <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    height: 56,
    backgroundColor: colors.darkGreenHeader,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerIcon: {
    color: colors.white,
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    marginHorizontal: spacing.md,
  },
  headerRightIcons: {
    flexDirection: 'row',
  },
  headerRightIcon: {
    marginRight: spacing.md,
  },
  video: {
    flex: 1,
  },
  tapCatcher: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 56,
    bottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlGlyph: {
    color: colors.white,
    fontSize: 22,
    marginHorizontal: spacing.xl,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseGlyph: {
    color: colors.white,
    fontSize: 26,
  },
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  timeLabel: {
    color: colors.white,
    fontSize: 12,
    width: 40,
    textAlign: 'center',
  },
});
