import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from './types';
import HomeScreen from '../screens/Home/HomeScreen';
import ChooseAppScreen from '../screens/ChooseApp/ChooseAppScreen';
import AppStatusViewerScreen from '../screens/AppStatusViewer/AppStatusViewerScreen';
import FullScreenVideoPlayer from '../screens/MediaViewer/FullScreenVideoPlayer';
import FullScreenImageViewer from '../screens/MediaViewer/FullScreenImageViewer';
import RecoveredMessageDetailScreen from '../screens/RecoveredMessageDetail/RecoveredMessageDetailScreen';

const Stack = createNativeStackNavigator<NotificationStackParamList>();

export default function NotificationStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ChooseApp" component={ChooseAppScreen} />
      <Stack.Screen name="AppStatusViewer" component={AppStatusViewerScreen} />
      <Stack.Screen name="FullScreenVideoPlayer" component={FullScreenVideoPlayer} />
      <Stack.Screen name="FullScreenImageViewer" component={FullScreenImageViewer} />
      <Stack.Screen name="RecoveredMessageDetail" component={RecoveredMessageDetailScreen} />
    </Stack.Navigator>
  );
}
