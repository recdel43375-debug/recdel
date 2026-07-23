import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatusStackParamList } from '../../navigation/types';
import { colors, spacing, radii } from '../../theme/colors';
import { appsStore } from '../../store/appsStore';
import type { MonitoredApp } from '../../types/models';

type Nav = NativeStackNavigationProp<StatusStackParamList, 'StatusHome'>;

/** Shortcut/alias into AppStatusViewer for status-capable monitored apps (Section 3.3 "Status" tab). */
export default function StatusHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [statusApps, setStatusApps] = useState<MonitoredApp[]>([]);

  useFocusEffect(
    useCallback(() => {
      setStatusApps(appsStore.getMonitoredApps().filter((a) => a.hasStatusFolder));
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status</Text>
      </View>

      {statusApps.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Add a status-capable app (e.g. WhatsApp) from Choose App to view statuses here.</Text>
        </View>
      ) : (
        <FlatList
          data={statusApps}
          keyExtractor={(item) => item.packageName}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('AppStatusViewer', { packageName: item.packageName, displayName: item.displayName })}
            >
              {item.iconUri ? (
                <Image source={{ uri: item.iconUri }} style={styles.icon} />
              ) : (
                <View style={[styles.icon, styles.iconPlaceholder]} />
              )}
              <Text style={styles.label}>{item.displayName}</Text>
            </TouchableOpacity>
          )}
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
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
  },
  iconPlaceholder: {
    backgroundColor: colors.border,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
});
