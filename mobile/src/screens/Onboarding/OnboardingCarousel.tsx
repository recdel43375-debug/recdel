import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '../../theme/colors';
import { settingsStore } from '../../store/settingsStore';
import { api } from '../../services/api';

interface Props {
  onDone: () => void;
}

const SLIDES = [
  { key: 'slide1', glyph: '💬', titleKey: 'onboarding.slide1Title', subtitleKey: 'onboarding.slide1Subtitle' },
  { key: 'slide2', glyph: '🖼️', titleKey: 'onboarding.slide2Title', subtitleKey: 'onboarding.slide2Subtitle' },
  { key: 'slide3', glyph: '🎬', titleKey: 'onboarding.slide3Title', subtitleKey: 'onboarding.slide3Subtitle' },
] as const;

export default function OnboardingCarousel({ onDone }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const finish = () => {
    settingsStore.setHasSeenOnboarding(true);
    api.sendTelemetryEvent('onboarding_completed');
    onDone();
  };

  const goTo = (nextIndex: number) => {
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setIndex(nextIndex);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topRow}>
        <View />
        <TouchableOpacity onPress={finish} accessibilityRole="button">
          <Text style={styles.skip}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width }]}>
            <View style={styles.illustration}>
              <Text style={styles.illustrationGlyph}>{slide.glyph}</Text>
            </View>
            <Text style={styles.title}>{t(slide.titleKey)}</Text>
            <Text style={styles.subtitle}>{t(slide.subtitleKey)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((slide, i) => (
          <View key={slide.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.bottomRow}>
        {index > 0 ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => goTo(index - 1)}>
            <Text style={styles.secondaryButtonText}>{t('onboarding.previous')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.secondaryButton} />
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={() => (isLast ? finish() : goTo(index + 1))}>
          <Text style={styles.primaryButtonText}>{isLast ? t('onboarding.finish') : t('onboarding.next')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skip: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustration: {
    width: 220,
    height: 220,
    borderRadius: radii.lg,
    backgroundColor: colors.screenBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  illustrationGlyph: {
    fontSize: 96,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primaryGreen,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 100,
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
