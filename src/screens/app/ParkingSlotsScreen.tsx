import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ParkingSlotsScreenProps } from '../../types/navigation';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { ParkingGrid } from '../../components/dashboard/ParkingGrid';
import { VehicleIcon } from '../../components/dashboard/VehicleIcon';
import { useParkingForecasts } from '../../hooks/useParkingForecast';
import { useAllLayouts } from '../../hooks/useUserLayouts';

const ParkingSlotsScreen = ({ route }: ParkingSlotsScreenProps) => {
  const { slot: initialSlot } = route.params;
  // Polling every 2 seconds for real-time updates
  const { slots } = useAllLayouts({ refreshInterval: 2000 });

  // Match by layoutId (slot.id is the layoutId in the new architecture)
  const slot = slots.find((s) => s.id === initialSlot.id) ?? initialSlot;

  const availableCount = slot.availableSlotCount;
  const totalCount = slot.totalSlotCount;
  const reservedCount = slot.slots.filter((parkingSpace) => parkingSpace.status === 'Reserved').length;
  const occupiedCount = Math.max(totalCount - availableCount - reservedCount, 0);
  const availabilityRatio = totalCount > 0 ? availableCount / totalCount : 0;
  const availabilityPercent = Math.round(availabilityRatio * 100);
  const layoutIds = slot.layouts?.map((layout) => layout.layoutId) ?? [];
  const { forecasts, isLoading: isForecastLoading, error: forecastError } =
    useParkingForecasts(layoutIds);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.summaryHeaderRow}>
            <View style={styles.summaryIntro}>
              <View style={styles.titleRow}>
                <Ionicons name="car-sport" size={22} color={colors.primary} />
                <Text style={styles.title}>{slot.locationName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressPanel}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressTitle}>Occupancy Overview</Text>
              <Text style={styles.progressValue}>{availabilityPercent}% available</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${availabilityPercent}%` }]} />
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricCardPrimary]}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              </View>
              <Text style={styles.metricValue}>{availableCount}</Text>
              <Text style={styles.metricLabel}>Available</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="time-outline" size={18} color={colors.warning} />
              </View>
              <Text style={styles.metricValue}>{reservedCount}</Text>
              <Text style={styles.metricLabel}>Reserved</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="close-circle" size={18} color={colors.danger} />
              </View>
              <Text style={styles.metricValue}>{occupiedCount}</Text>
              <Text style={styles.metricLabel}>Occupied</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="grid" size={18} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>{totalCount}</Text>
              <Text style={styles.metricLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.forecastPanel}>
            {isForecastLoading ? (
              <Text style={styles.forecastStatusText}>Loading forecast...</Text>
            ) : Object.keys(forecasts).length > 0 ? (
              <>
                <View style={styles.forecastHeader}>
                  <View style={styles.forecastTitleRow}>
                    <View style={styles.forecastTitleCopy}>
                      <Text style={styles.forecastTitle}>Parking Forecast</Text>
                      <Text style={styles.forecastTiming}>Per active layout</Text>
                    </View>
                  </View>
                </View>

                {Object.values(forecasts).map((forecast) => {
                  const occupancyPercent = Math.round(
                    Math.min(Math.max(forecast.predictedOccupancy, 0), 1) * 100
                  );

                  return (
                    <View key={forecast.layoutId} style={styles.forecastLayoutRow}>
                      <View style={styles.forecastLayoutHeading}>
                        {/* <Text style={styles.forecastLayoutId}>{forecast.layoutId}</Text> */}
                        <Text style={styles.forecastTiming}>
                          Next {forecast.horizonMinutes} min
                        </Text>
                      </View>
                      <View style={styles.forecastValuesRow}>
                        <View>
                          <Text style={styles.forecastOccupancyValue}>{occupancyPercent}%</Text>
                          <Text style={styles.forecastOccupancyLabel}>expected occupancy</Text>
                        </View>
                        <View style={styles.forecastValueBlock}>
                          <Text style={styles.forecastInsightValue}>
                            {forecast.predictedAvailableSlots}
                          </Text>
                          <Text style={styles.forecastInsightLabel}>spaces available</Text>
                        </View>
                        <View style={styles.forecastValueBlock}>
                          <Text style={styles.forecastInsightValue}>{forecast.trainingRecords}</Text>
                          <Text style={styles.forecastInsightLabel}>training records</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
                {forecastError ? (
                  <Text style={styles.forecastStatusText}>{forecastError}</Text>
                ) : null}

              </>
            ) : forecastError ? (
              <>
                <Text style={styles.forecastTitle}>Parking Forecast</Text>
                <Text style={[styles.forecastStatusText, styles.forecastUnavailableText]}>
                  {forecastError}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {slot.layouts && slot.layouts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Parking Layout</Text>
                <Text style={styles.sectionSubtitle}>Visual grid view of parking spaces</Text>
              </View>
            </View>
            {slot.layouts.map((layout) => (
              <ParkingGrid
                key={layout.layoutId}
                layoutName={layout.layoutName}
                totalRows={layout.totalRows}
                totalColumns={layout.totalColumns}
                grid={layout.grid}
              />
            ))}
          </>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Parking Spaces</Text>
            <Text style={styles.sectionSubtitle}>See all individual parking spaces</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.availableDot]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.occupiedDot]} />
              <Text style={styles.legendText}>Occupied</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.reservedDot]} />
              <Text style={styles.legendText}>Reserved</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {slot.slots.map((parkingSpace) => {
            const isAvailable = parkingSpace.status === 'Available';
            const isReserved = parkingSpace.status === 'Reserved';

            return (
              <View key={parkingSpace.id} style={styles.slotCard}>
                <View style={[styles.slotInnerCard, isAvailable ? styles.availableCard : isReserved ? styles.reservedCard : styles.occupiedCard]}>
                  <View style={styles.slotTopRow}>
                    <View style={[styles.slotStatusIcon, isAvailable ? styles.slotStatusIconAvailable : isReserved ? styles.slotStatusIconReserved : styles.slotStatusIconOccupied]}>
                      {isReserved ? (
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={colors.warning}
                        />
                      ) : (
                        <VehicleIcon
                          vehicleType={parkingSpace.vehicleType}
                          size={16}
                          color={isAvailable ? colors.success : colors.danger}
                        />
                      )}
                    </View>
                    <Text style={[styles.slotPill, isAvailable ? styles.availablePillText : isReserved ? styles.reservedPillText : styles.occupiedPillText]}>
                      {parkingSpace.status}
                    </Text>
                  </View>

                  <View style={styles.slotContent}>
                    <Text style={styles.slotEyebrow}>Space</Text>
                    <Text style={[styles.slotLabel, isAvailable ? styles.availableText : isReserved ? styles.reservedText : styles.occupiedText]}>
                      {parkingSpace.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  summaryHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryIntro: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: typography.title,
    fontWeight: '700',
  },
  progressPanel: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  progressLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  progressValue: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
    minWidth: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    flexBasis: '48%',
    flexGrow: 1,
    padding: spacing.md,
  },
  metricCardPrimary: {
    backgroundColor: colors.successLight,
  },
  metricIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 32,
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  forecastPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  forecastLayoutRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  forecastLayoutHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  forecastLayoutId: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body,
    fontWeight: '800',
  },
  forecastValuesRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  forecastValueBlock: {
    flex: 1,
  },
  forecastHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  forecastTitleRow: {
    flex: 1,
  },
  forecastTitleCopy: {
    flex: 1,
  },
  forecastTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  forecastTiming: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  forecastStatusText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  forecastUnavailableText: {
    marginTop: spacing.xs,
  },
  forecastVisualRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  occupancyMeterBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  occupancyMeterTrack: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 116,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 18,
  },
  occupancyMeterFill: {
    backgroundColor: colors.darkSoft,
    borderRadius: radius.pill,
    minHeight: 4,
    width: '100%',
  },
  occupancyMeterCopy: {
    width: 92,
  },
  forecastOccupancyValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  forecastOccupancyLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: 1,
  },
  forecastInsights: {
    flex: 1,
    gap: spacing.lg,
  },
  forecastInsightRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  forecastInsightCopy: {
    flex: 1,
  },
  forecastInsightLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  forecastInsightValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginTop: 2,
  },
  stabilityLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  stabilityTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 6,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  stabilityFill: {
    backgroundColor: colors.slate,
    borderRadius: radius.pill,
    height: '100%',
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  availableDot: {
    backgroundColor: colors.success,
  },
  occupiedDot: {
    backgroundColor: colors.danger,
  },
  reservedDot: {
    backgroundColor: colors.warning,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  slotCard: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  slotInnerCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 124,
    justifyContent: 'space-between',
  },
  slotTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  slotStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotStatusIconAvailable: {
    backgroundColor: colors.white,
  },
  slotStatusIconOccupied: {
    backgroundColor: colors.white,
  },
  slotStatusIconReserved: {
    backgroundColor: colors.white,
  },
  slotContent: {
    marginTop: spacing.lg,
  },
  slotEyebrow: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  slotLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  slotPill: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  availableCard: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  occupiedCard: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  reservedCard: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  availableText: {
    color: colors.success,
  },
  occupiedText: {
    color: colors.danger,
  },
  reservedText: {
    color: colors.warning,
  },
  availablePillText: {
    color: colors.success,
  },
  occupiedPillText: {
    color: colors.danger,
  },
  reservedPillText: {
    color: colors.warning,
  },
});

export default ParkingSlotsScreen;
