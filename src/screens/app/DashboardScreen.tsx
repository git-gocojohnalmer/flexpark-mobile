import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '../../components/dashboard/Header';
import ParkingSlotCard from '../../components/dashboard/ParkingSlotCard';
import { useAuth } from '../../hooks/useAuth';
import { useAllLayouts } from '../../hooks/useUserLayouts';
import type { AppStackParamList } from '../../types/navigation';
import type { ParkingSlot } from '../../types/parking';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

const DashboardScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const { slots, isLoading, error, refresh } = useAllLayouts();

  const totalAvailableSpaces = slots.reduce((sum, s) => sum + s.availableSlotCount, 0);
  const totalCapacity = slots.reduce((sum, s) => sum + s.totalSlotCount, 0);
  const openLocations = slots.filter((s) => s.availableSlotCount > 0).length;
  const nearestSpot = slots[0] ?? null;
  const occupancyRate =
    totalCapacity === 0
      ? 0
      : Math.round(((totalCapacity - totalAvailableSpaces) / totalCapacity) * 100);

  const stats = [
    {
      id: 'spaces',
      label: 'Open spaces',
      value: isLoading ? '...' : totalAvailableSpaces.toString(),
      icon: 'car-sport-outline' as const,
      accentColor: '#8B5CF6',
    },
    {
      id: 'locations',
      label: 'Live locations',
      value: isLoading ? '...' : openLocations.toString(),
      icon: 'location-outline' as const,
      accentColor: '#06B6D4',
    },
    {
      id: 'capacity',
      label: 'Occupancy',
      value: isLoading ? '...' : `${occupancyRate}%`,
      icon: 'speedometer-outline' as const,
      accentColor: '#22C55E',
    },
  ];

  const renderItem = ({ item }: { item: ParkingSlot }) => (
    <ParkingSlotCard
      slot={item}
      onPressLink={async () => {
        const mapsUrl = item.mapLink ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationName)}`;
        await Linking.openURL(mapsUrl);
      }}
      onPressViewSlots={() => navigation.navigate('ParkingSlots', { slot: item })}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.emptyText}>Loading your parking area...</Text>
        </>
      ) : (
        <Text style={styles.emptyText}>No parking area configured</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={isLoading}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Header 
              name={user?.firstName ?? 'Driver'} 
              onPressSettings={() => navigation.navigate('EditAccount')} 
            />

            <View style={styles.heroCard}>
              <View style={styles.heroGlowPrimary} />
              <View style={styles.heroGlowSecondary} />

              <Text style={styles.heroTitle}>Parking operations</Text>
              <Text style={styles.heroSubtitle}>
                Monitor availability, spot status, and layout health across active parking zones.
              </Text>

              <View style={styles.heroHighlightsRow}>
                <View style={styles.heroHighlightCard}>
                  <Text style={styles.heroHighlightValue}>
                    {isLoading ? '...' : totalAvailableSpaces}
                  </Text>
                  <Text style={styles.heroHighlightLabel}>open spaces</Text>
                </View>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable 
                  onPress={refresh} 
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.id} style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: `${stat.accentColor}18` }]}>
                    <Ionicons name={stat.icon} size={18} color={stat.accentColor} />
                  </View>
                  <Text style={stat.value === '...' ? styles.statValueLoading : styles.statValue}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.listHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Nearby live parking</Text>
                <Text style={styles.sectionSubtitle}>
                  {isLoading
                    ? 'Loading parking locations...'
                    : `${totalAvailableSpaces} open spaces available`}
                </Text>
              </View>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.dark,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.card,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -35,
    left: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: spacing.xs,
    maxWidth: '82%',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: typography.body,
    lineHeight: 20,
    marginBottom: spacing.md,
    maxWidth: '92%',
  },
  heroHighlightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroHighlightCard: {
    flex: 1,
  },
  heroHighlightValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroHighlightLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: typography.caption,
    fontWeight: '600',
  },
  errorBanner: {
    marginTop: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statValueLoading: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 16,
  },
  listHeaderRow: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
    maxWidth: 240,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;