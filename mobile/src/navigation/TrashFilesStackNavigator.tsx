import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TrashFilesStackParamList } from './types';
import TrashFilesScreen from '../screens/TrashFiles/TrashFilesScreen';
import FullScreenVideoPlayer from '../screens/MediaViewer/FullScreenVideoPlayer';
import FullScreenImageViewer from '../screens/MediaViewer/FullScreenImageViewer';

const Stack = createNativeStackNavigator<TrashFilesStackParamList>();

export default function TrashFilesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrashFiles" component={TrashFilesScreen} />
      <Stack.Screen name="FullScreenVideoPlayer" component={FullScreenVideoPlayer} />
      <Stack.Screen name="FullScreenImageViewer" component={FullScreenImageViewer} />
    </Stack.Navigator>
  );
}
