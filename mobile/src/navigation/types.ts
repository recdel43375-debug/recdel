import type { StatusMediaType } from '../types/models';

export type NotificationStackParamList = {
  Home: undefined;
  ChooseApp: undefined;
  AppStatusViewer: { packageName: string; displayName: string };
  FullScreenVideoPlayer: { uri: string; title: string; packageName: string; fileId: string };
  FullScreenImageViewer: { uri: string; title?: string };
  RecoveredMessageDetail: { contactId: string; contactName: string; avatarUri?: string };
};

export type TrashFilesStackParamList = {
  TrashFiles: undefined;
  FullScreenVideoPlayer: { uri: string; title: string; packageName: string; fileId: string };
  FullScreenImageViewer: { uri: string; title?: string };
};

export type StatusStackParamList = {
  StatusHome: undefined;
  AppStatusViewer: { packageName: string; displayName: string };
  FullScreenVideoPlayer: { uri: string; title: string; packageName: string; fileId: string };
  FullScreenImageViewer: { uri: string; title?: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  LanguagePicker: undefined;
  Premium: undefined;
  WebViewLegal: { kind: 'privacy' | 'terms' | 'limitations' };
};

export type MainTabsParamList = {
  NotificationTab: undefined;
  TrashFilesTab: undefined;
  StatusTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Disclaimer: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export interface StatusMediaRouteParams {
  uri: string;
  title: string;
  packageName: string;
  fileId: string;
  mediaType: StatusMediaType;
}
