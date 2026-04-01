import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../../theme';

type ParkingSpace = {
  id: string;
  label: string;
  status: 'Available' | 'Occupied';
};

type ParkingSlot = {
  id: string;
  locationName: string;
  status: 'Available' | 'Occupied';
  distance: string;
  rate: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  availableSlotCount: number;
  totalSlotCount: number;
  slots: ParkingSpace[];
};

type ParkingSlotCardProps = {
  slot: ParkingSlot;
  onPressLink: () => void;
  onPressViewSlots: () => void;
};

const ParkingSlotCard = ({
  slot,
  onPressLink,
  onPressViewSlots,
}: ParkingSlotCardProps) => {
  const isAvailable = slot.status === 'Available';
  const totalSlots = Math.max(slot.totalSlotCount, 0);
  const availableSlots = Math.min(Math.max(slot.availableSlotCount, 0), totalSlots);
  const occupiedSlots = Math.max(totalSlots - availableSlots, 0);
  const availabilityRatio = totalSlots > 0 ? availableSlots / totalSlots : 0;
  const availabilityWidth = Math.max(availabilityRatio * 100, 6);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleSection}>
          <View style={styles.locationIconWrap}>
            <MaterialCommunityIcons
              color={colors.primary}
              name="parking"
              size={18}
            />
          </View>

          <View style={styles.titleTextWrap}>
            <Text style={styles.eyebrow}>Smart Parking Zone</Text>
            <Text style={styles.locationName}>{slot.locationName}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            isAvailable ? styles.availablePill : styles.occupiedPill,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isAvailable ? styles.availableDot : styles.occupiedDot,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isAvailable ? styles.availableText : styles.occupiedText,
            ]}
          >
            {slot.status}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricLabelRow}>
            <Feather color={colors.textSecondary} name="map-pin" size={14} />
            <Text style={styles.metricLabel}>Distance</Text>
          </View>
          <Text style={styles.metricValue}>{slot.distance}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricLabelRow}>
            <Feather color={colors.textSecondary} name="credit-card" size={14} />
            <Text style={styles.metricLabel}>Rate</Text>
          </View>
          <Text style={styles.metricValue}>{slot.rate}</Text>
        </View>
      </View>

      <View style={styles.availabilityCard}>
        <View style={styles.availabilityHeader}>
          <View>
            <Text style={styles.summaryLabel}>Live Availability</Text>
            <Text style={styles.summaryValue}>
              {availableSlots} of {totalSlots} slots available
            </Text>
          </View>

          <View style={styles.capacityChip}>
            <Text style={styles.capacityChipText}>{occupiedSlots} occupied</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${availabilityWidth}%` }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressCaption}>Available</Text>
          <Text style={styles.progressCaption}>{Math.round(availabilityRatio * 100)}% capacity ready</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onPressViewSlots}
          style={({ pressed }) => [
            styles.actionButton,
            styles.viewSlotsButton,
            pressed && styles.primaryPressed,
          ]}
        >
          <Feather color={colors.white} name="grid" size={16} />
          <Text style={styles.viewSlotsText}>View Slots</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onPressLink}
          style={({ pressed }) => [
            styles.actionButton,
            styles.linkButton,
            pressed && styles.secondaryPressed,
          ]}
        >
          <Feather color={colors.primary} name="navigation" size={16} />
          <Text style={styles.linkText}>Link</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  locationIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  titleTextWrap: {
    flex: 1,
  },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  locationName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  availablePill: {
    backgroundColor: colors.successLight,
  },
  occupiedPill: {
    backgroundColor: colors.dangerLight,
  },
  statusDot: {
    borderRadius: radius.pill,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  availableDot: {
    backgroundColor: colors.success,
  },
  occupiedDot: {
    backgroundColor: colors.danger,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  availableText: {
    color: colors.success,
  },
  occupiedText: {
    color: colors.danger,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flex: 1,
    padding: spacing.md,
  },
  metricLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 6,
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  availabilityCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  availabilityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  capacityChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  capacityChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 10,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressCaption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  viewSlotsButton: {
    backgroundColor: colors.primary,
  },
  linkButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  viewSlotsText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  secondaryPressed: {
    backgroundColor: colors.background,
  },
});

export default ParkingSlotCard;