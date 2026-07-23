import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from '../../navigation/types';
import { colors, spacing, radii } from '../../theme/colors';
import { notificationCaptureStore } from '../../services/notificationCaptureStore';
import type { CapturedMessage } from '../../types/models';

type Nav = NativeStackNavigationProp<NotificationStackParamList, 'RecoveredMessageDetail'>;
type Route = RouteProp<NotificationStackParamList, 'RecoveredMessageDetail'>;

function relativeDay(ms: number): string {
  const date = new Date(ms);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
}

function MessageCard({ message }: { message: CapturedMessage }) {
  return (
    <View style={styles.card}>
      {message.type === 'text' || message.type === 'emoji' ? <Text style={styles.messageText}>{message.text}</Text> : null}
      {message.type === 'reaction' ? (
        <Text style={styles.messageText}>
          Reacted {message.reactionEmoji} to "{message.quotedSnippet}"
        </Text>
      ) : null}
      {message.type === 'media' ? (
        <View>
          {message.thumbnailUri ? <Image source={{ uri: message.thumbnailUri }} style={styles.mediaThumb} /> : null}
          <Text style={styles.messageText}>{message.text ?? 'Media received'}</Text>
        </View>
      ) : null}
      {message.type === 'voice' ? <Text style={styles.messageText}>🎤 Voice message received</Text> : null}
      <Text style={styles.timestamp}>{relativeDay(message.capturedAt)}</Text>
    </View>
  );
}

export default function RecoveredMessageDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { contactId, contactName, avatarUri } = route.params;

  const [messages, setMessages] = useState<CapturedMessage[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<CapturedMessage>>(null);
  const hasScrolledToEnd = useRef(false);

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      const { messages: pageMessages, hasMore: more } = await notificationCaptureStore.readMessagesPage(contactId, pageToLoad);
      setMessages((prev) => [...pageMessages, ...prev]);
      setHasMore(more);
    },
    [contactId]
  );

  useEffect(() => {
    setLoading(true);
    loadPage(0).finally(() => setLoading(false));
  }, [loadPage]);

  const handleStartReached = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{contactName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.contactName} numberOfLines={1}>
          {contactName}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primaryGreen} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageCard message={item} />}
          contentContainerStyle={styles.listContent}
          onStartReached={handleStartReached}
          onStartReachedThreshold={0.3}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onContentSizeChange={() => {
            if (!hasScrolledToEnd.current && messages.length > 0) {
              hasScrolledToEnd.current = true;
              listRef.current?.scrollToEnd({ animated: false });
            }
          }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No captured messages yet.</Text>
            </View>
          }
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  backArrow: {
    color: colors.white,
    fontSize: 22,
    marginRight: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.white,
    fontWeight: '700',
  },
  contactName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  mediaThumb: {
    width: 160,
    height: 160,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
