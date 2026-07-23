/**
 * RecDel — Android status-saver / notification-based deleted message
 * capture utility. See RecDel_Requirement_Spec.md for the full product spec.
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import { api } from './src/services/api';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    api.sendTelemetryEvent('app_opened');
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
