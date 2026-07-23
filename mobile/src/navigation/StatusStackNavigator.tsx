import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StatusStackParamList } from './types';
import StatusHomeScreen from '../screens/StatusHome/StatusHomeScreen';
import AppStatusViewerScreen from '../screens/AppStatusViewer/AppStatusViewerScreen';
import FullScreenVideoPlayer from '../screens/MediaViewer/FullScreenVideoPlayer';
import FullScreenImageViewer from '../screens/MediaViewer/FullScreenImageViewer';

const Stack = createNativeStackNavigator<StatusStackParamList>();

export default function StatusStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatusHome" component={StatusHomeScreen} />
      <Stack.Screen name="AppStatusViewer" component={AppStatusViewerScreen} />
      <Stack.Screen name="FullScreenVideoPlayer" component={FullScreenVideoPlayer} />
      <Stack.Screen name="FullScreenImageViewer" component={FullScreenImageViewer} />
    </Stack.Navigator>
  );
}
