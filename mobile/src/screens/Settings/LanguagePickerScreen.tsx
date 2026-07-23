import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { colors, spacing, radii } from '../../theme/colors';
import GreenHeader from '../../components/GreenHeader';
import { settingsStore } from '../../store/settingsStore';
import { setAppLanguage, SUPPORTED_LANGUAGES } from '../../i18n';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'LanguagePicker'>;

export default function LanguagePickerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState(settingsStore.getLanguage());

  const handleSelect = (code: string) => {
    setSelected(code);
    setAppLanguage(code);
  };

  return (
    <View style={styles.container}>
      <GreenHeader title={t('settings.chooseLanguage')} onBack={() => navigation.goBack()} />
      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => handleSelect(item.code)}>
            <Text style={styles.label}>{item.label}</Text>
            {selected === item.code ? <Text style={styles.check}>✓</Text> : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  list: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  check: {
    color: colors.primaryGreen,
    fontSize: 16,
    fontWeight: '700',
  },
});
