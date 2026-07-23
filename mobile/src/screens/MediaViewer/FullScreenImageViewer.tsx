import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/colors';

type Nav = NativeStackNavigationProp<NotificationStackParamList, 'FullScreenImageViewer'>;
type Route = RouteProp<NotificationStackParamList, 'FullScreenImageViewer'>;

export default function FullScreenImageViewer() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { uri, title } = route.params;
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={4}
        minimumZoomScale={1}
        centerContent
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri }} style={{ width, height: height - 56 }} resizeMode="contain" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    height: 56,
    backgroundColor: colors.darkGreenHeader,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerIcon: {
    color: colors.white,
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    marginLeft: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
