import RNFS from 'react-native-fs';
import type { CapturedMessage, ConversationSummary } from '../types/models';

const CONVERSATIONS_DIR = `${RNFS.DocumentDirectoryPath}/conversations`;
const CONVERSATION_INDEX_PATH = `${RNFS.DocumentDirectoryPath}/conversation_index.json`;

// The native NotificationListenerService (Kotlin) is the primary writer of
// both the per-conversation JSONL logs and this index — capture must keep
// working even when the JS/RN instance isn't running (app backgrounded or
// killed by an OEM battery manager). JS reads the same files and only
// writes here itself as a fallback path. Because both runtimes touch these
// files, contact ids are sanitized identically on both sides (see
// NotificationCaptureModule.kt's `sanitizeContactId`) rather than relying
// on encodeURIComponent, which Kotlin's URLEncoder doesn't reproduce byte-for-byte.
function sanitizeContactId(contactId: string): string {
  return contactId.replace(/[^A-Za-z0-9_-]/g, '_');
}

function logPathFor(contactId: string) {
  return `${CONVERSATIONS_DIR}/${sanitizeContactId(contactId)}.jsonl`;
}

async function ensureDir() {
  const exists = await RNFS.exists(CONVERSATIONS_DIR);
  if (!exists) {
    await RNFS.mkdir(CONVERSATIONS_DIR);
  }
}

async function readConversationIndex(): Promise<Record<string, ConversationSummary>> {
  try {
    const raw = await RNFS.readFile(CONVERSATION_INDEX_PATH, 'utf8');
    return JSON.parse(raw) as Record<string, ConversationSummary>;
  } catch {
    return {};
  }
}

async function writeConversationIndex(index: Record<string, ConversationSummary>) {
  await RNFS.writeFile(CONVERSATION_INDEX_PATH, JSON.stringify(index), 'utf8');
}

function previewFor(message: CapturedMessage): string {
  switch (message.type) {
    case 'text':
    case 'emoji':
      return message.text;
    case 'reaction':
      return `Reacted ${message.reactionEmoji} to "${message.quotedSnippet}"`;
    case 'media':
      return message.text ?? 'Sent media';
    case 'voice':
      return 'Voice message received';
    default:
      return '';
  }
}

export const notificationCaptureStore = {
  /**
   * Appends a newly captured notification to that contact's log file and
   * updates the feed index. Normally the native listener service does this
   * directly; this is kept as a JS-side fallback (and for tests).
   */
  async appendMessage(
    contactId: string,
    packageName: string,
    contactName: string,
    avatarUri: string | undefined,
    message: CapturedMessage
  ): Promise<void> {
    await ensureDir();
    const path = logPathFor(contactId);
    const line = JSON.stringify(message) + '\n';
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.appendFile(path, line, 'utf8');
    } else {
      await RNFS.writeFile(path, line, 'utf8');
    }

    const index = await readConversationIndex();
    index[contactId] = {
      contactId,
      packageName,
      contactName,
      avatarUri,
      lastMessageAt: message.capturedAt,
      lastMessagePreview: previewFor(message),
    };
    await writeConversationIndex(index);
  },

  /** Reverse-chronological feed for the Notification tab (Section 3.3 / 3.7). */
  async getConversationFeed(): Promise<ConversationSummary[]> {
    const index = await readConversationIndex();
    return Object.values(index).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },

  /**
   * Chronological, paginated read of a single conversation's append log
   * (Section 3.8: "paginate by reading in chunks rather than one giant
   * JSON blob"). `page` is 0-indexed, most recent page first.
   */
  async readMessagesPage(contactId: string, page: number, pageSize = 30): Promise<{ messages: CapturedMessage[]; hasMore: boolean }> {
    const path = logPathFor(contactId);
    const exists = await RNFS.exists(path);
    if (!exists) return { messages: [], hasMore: false };

    const raw = await RNFS.readFile(path, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    const all: CapturedMessage[] = lines.map((l) => JSON.parse(l));

    const totalPages = Math.ceil(all.length / pageSize);
    const pageFromEnd = totalPages - 1 - page; // page 0 = most recent chunk
    if (pageFromEnd < 0) return { messages: [], hasMore: false };

    const start = pageFromEnd * pageSize;
    const end = Math.min(start + pageSize, all.length);
    return {
      messages: all.slice(start, end),
      hasMore: pageFromEnd > 0,
    };
  },

  async clearConversation(contactId: string): Promise<void> {
    const path = logPathFor(contactId);
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
    const index = await readConversationIndex();
    delete index[contactId];
    await writeConversationIndex(index);
  },
};
