import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/colors';
import GreenHeader from '../../components/GreenHeader';
import { api } from '../../services/api';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'WebViewLegal'>;
type Route = RouteProp<SettingsStackParamList, 'WebViewLegal'>;

const LIMITATIONS_TEXT = `Remember & Limitations

RecDel captures notification content only while active, and only for apps you explicitly select. It never reads WhatsApp's (or any app's) encrypted database.

- Only messages, media, and reactions sent by the other party can be recovered — Android never generates a notification for your own outgoing messages, so RecDel cannot capture or reconstruct anything you send.
- Only content received after you enable Notification Access is recoverable. Deletions that happened before that point cannot be recovered.
- Voice notes can only be logged as "voice message received" — the notification itself does not carry a playable audio file.
- Live WhatsApp statuses can only be saved while they're still available in WhatsApp's cache (before expiry or deletion) and while RecDel has folder access.
- Aggressive OEM battery managers (MIUI, ColorOS, etc.) may kill the background listener; use "Restart Services" in Settings if capture stops working.

All data captured by RecDel stays on your device. Nothing is uploaded to a server.`;

export default function WebViewLegalScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { kind } = route.params;

  const [content, setContent] = useState(kind === 'limitations' ? LIMITATIONS_TEXT : '');
  const [loading, setLoading] = useState(kind !== 'limitations');

  useEffect(() => {
    if (kind === 'limitations') return;
    const fetcher = kind === 'privacy' ? api.getPrivacyPolicy : api.getTerms;
    fetcher()
      .then((res) => setContent(res.content))
      .catch(() => setContent('Unable to load this content right now. Please check your connection and try again.'))
      .finally(() => setLoading(false));
  }, [kind]);

  const title =
    kind === 'privacy' ? t('settings.privacyPolicy') : kind === 'terms' ? t('settings.termsAndConditions') : t('settings.rememberLimitations');

  return (
    <View style={styles.container}>
      <GreenHeader title={title} onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primaryGreen} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.text}>{content}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  text: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.textPrimary,
  },
});
