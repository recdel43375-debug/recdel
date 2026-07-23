export interface MonitoredApp {
  packageName: string;
  displayName: string;
  iconUri?: string;
  hasStatusFolder: boolean;
  isMonitoring: boolean;
  addedAt: number;
}

export interface InstalledApp {
  packageName: string;
  displayName: string;
  iconUri?: string;
}

export type CapturedMessageType = 'text' | 'emoji' | 'reaction' | 'media' | 'voice';

interface CapturedMessageBase {
  id: string;
  contactId: string;
  type: CapturedMessageType;
  capturedAt: number;
}

export interface TextMessage extends CapturedMessageBase {
  type: 'text' | 'emoji';
  text: string;
}

export interface ReactionMessage extends CapturedMessageBase {
  type: 'reaction';
  reactionEmoji: string;
  quotedSnippet: string;
}

export interface MediaMessage extends CapturedMessageBase {
  type: 'media';
  text?: string;
  thumbnailUri?: string;
}

export interface VoiceMessage extends CapturedMessageBase {
  type: 'voice';
}

export type CapturedMessage = TextMessage | ReactionMessage | MediaMessage | VoiceMessage;

export interface ConversationSummary {
  contactId: string;
  packageName: string;
  contactName: string;
  avatarUri?: string;
  lastMessageAt: number;
  lastMessagePreview: string;
}

export type StatusMediaType = 'image' | 'video';

export interface StatusFileEntry {
  id: string;
  uri: string;
  fileName: string;
  mediaType: StatusMediaType;
  mtime: number;
  sizeBytes: number;
  saved: boolean;
  savedUri?: string;
}

export interface TrashEntry {
  id: string;
  packageName: string;
  sourceName: string;
  mediaType: StatusMediaType | 'thumbnail';
  uri: string;
  capturedAt: number;
}
