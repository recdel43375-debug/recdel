import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from '../../navigation/types';
import { colors, spacing, radii } from '../../theme/colors';
import GreenHeader from '../../components/GreenHeader';
import { InstalledAppsModule } from '../../native/InstalledAppsModule';
import { NotificationCaptureModule } from '../../native/NotificationCaptureModule';
import { appsStore } from '../../store/appsStore';
import { hasStatusFolderCapability } from '../../constants/statusCapableApps';
import { api } from '../../services/api';
import type { InstalledApp } from '../../types/models';

type Nav = NativeStackNavigationProp<NotificationStackParamList, 'ChooseApp'>;

export default function ChooseAppScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(appsStore.getMonitoredApps().map((a) => a.packageName))
  );

  useEffect(() => {
    InstalledAppsModule.listInstalledApps().then(setApps);
  }, []);

  const toggle = (packageName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(packageName)) {
        next.delete(packageName);
      } else {
        next.add(packageName);
      }
      return next;
    });
  };

  const handleDone = () => {
    const appsByPackage = new Map(apps.map((a) => [a.packageName, a]));
    appsStore.setMonitoredApps(Array.from(selected), (pkg) => {
      const meta = appsByPackage.get(pkg);
      return {
        displayName: meta?.displayName ?? pkg,
        iconUri: meta?.iconUri,
        hasStatusFolder: hasStatusFolderCapability(pkg),
      };
    });
    try {
      NotificationCaptureModule.setMonitoredPackages(Array.from(selected));
    } catch {
      // Native module unavailable in JS-only dev preview.
    }
    api.sendTelemetryEvent('app_added_to_monitor');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <GreenHeader title={t('chooseApp.title')} onBack={() => navigation.goBack()} />

      <FlatList
        data={apps}
        keyExtractor={(item) => item.packageName}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.packageName);
          return (
            <TouchableOpacity style={styles.tile} onPress={() => toggle(item.packageName)} accessibilityRole="checkbox" accessibilityState={{ checked: isSelected }}>
              <View style={styles.iconWrapper}>
                {item.iconUri ? (
                  <Image source={{ uri: item.iconUri }} style={styles.icon} />
                ) : (
                  <View style={[styles.icon, styles.iconPlaceholder]} />
                )}
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <Text style={styles.radioCheck}>✓</Text> : null}
                </View>
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.displayName}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.doneButton} onPress={handleDone} accessibilityRole="button">
        <Text style={styles.doneButtonText}>{t('chooseApp.done')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  grid: {
    padding: spacing.md,
  },
  tile: {
    flex: 1 / 4,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconWrapper: {
    position: 'relative',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
  },
  iconPlaceholder: {
    backgroundColor: colors.border,
  },
  radio: {
    position: 'absolute',
    bottom: -4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.darkGreenHeader,
    borderColor: colors.darkGreenHeader,
  },
  radioCheck: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
