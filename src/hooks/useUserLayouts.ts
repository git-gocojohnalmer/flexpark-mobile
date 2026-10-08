import { useCallback, useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import * as Location from 'expo-location';
import { db } from '../lib/firebase';
import type { ParkingLayout, ParkingSlot } from '../types/parking';
import {
  buildGoogleMapsEmbedUrl,
  buildMapsUrl,
  extractCoordinateFromLink,
  extractSpacesFromGrid,
  fetchOwnerLocation,
  mergeStatusesIntoGrid,
  mergeStatusSources,
  parseActiveLayouts,
  type RawLayout,
} from '../services/layoutService';

type SlotWithLayouts = ParkingSlot & { layouts: ParkingLayout[] };

interface UseAllLayoutsOptions {
  // Kept for API compatibility with existing screens. Real-time listeners do
  // not poll, so this option is intentionally ignored.
  refreshInterval?: number;
}

const getDistanceKm = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const useAllLayouts = (_options: UseAllLayoutsOptions = {}) => {
  const [rawLayouts, setRawLayouts] = useState<Record<string, RawLayout> | null>(null);
  const [sensorMap, setSensorMap] = useState<Record<string, string>>({});
  const [spotMap, setSpotMap] = useState<Record<string, string>>({});
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({});
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [ownerLocations, setOwnerLocations] = useState<
    Record<string, { name: string; link: string } | null>
  >({});
  const [layoutsReady, setLayoutsReady] = useState(false);
  const [sensorsReady, setSensorsReady] = useState(false);
  const [spotsReady, setSpotsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) setUserLocation(null);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!mounted) return;
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        if (mounted) setUserLocation(null);
      }
    };

    loadUserLocation();
    return () => {
      mounted = false;
    };
  }, []);

  // Listener: layouts (structure changes)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'layouts'),
      (snapshot) => {
        setRawLayouts(
          snapshot.exists() ? (snapshot.val() as Record<string, RawLayout>) : {}
        );
        setLayoutsReady(true);
        setError(null);
      },
      (err) => setError(err.message)
    );
    return () => unsub();
  }, []);

  // Listener: sensors (primary real-time status source)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'sensors'),
      (snapshot) => {
        const result: Record<string, string> = {};
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<
            string,
            { spotId?: string; slotId?: string; status?: string } | null
          >;
          for (const [sensorId, sensor] of Object.entries(data)) {
            const spotId = sensor?.spotId ?? sensor?.slotId ?? sensorId;
            if (sensor?.status) {
              result[spotId] = sensor.status;
            }
          }
        }
        setSensorMap(result);
        setSensorsReady(true);
      },
      (err) => setError(err.message)
    );
    return () => unsub();
  }, []);

  // Listener: spots (fallback for spots without sensors)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'spots'),
      (snapshot) => {
        const statusResult: Record<string, string> = {};
        const vehicleResult: Record<string, string> = {};
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<
            string,
            { status?: string; vehicleType?: string; spotId?: string } | null
          >;
          for (const [id, spot] of Object.entries(data)) {
            if (spot?.status) statusResult[id] = spot.status;
            if (spot?.vehicleType) vehicleResult[id] = spot.vehicleType;
            if (spot?.spotId && spot?.vehicleType) {
              vehicleResult[spot.spotId] = spot.vehicleType;
            }
          }
        }
        setSpotMap(statusResult);
        setVehicleMap(vehicleResult);
        setSpotsReady(true);
      },
      (err) => setError(err.message)
    );
    return () => unsub();
  }, []);

  // Resolve by occupancy severity, so occupied always wins over reserved/free.
  const statusMap = useMemo(
    () => mergeStatusSources(spotMap, sensorMap),
    [spotMap, sensorMap]
  );

  const activeLayouts = useMemo(() => parseActiveLayouts(rawLayouts), [rawLayouts]);

  // Stable key over the unique ownerIds present in active layouts
  const ownerIdsKey = useMemo(
    () =>
      Array.from(
        new Set(
          activeLayouts
            .map((l) => l.ownerId)
            .filter((id): id is string => Boolean(id))
        )
      )
        .sort()
        .join(','),
    [activeLayouts]
  );

  // Fetch owner location once per unique ownerId
  useEffect(() => {
    if (!ownerIdsKey) return;
    const ownerIds = ownerIdsKey.split(',').filter(Boolean);
    const missing = ownerIds.filter((id) => !(id in ownerLocations));
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const loc = await fetchOwnerLocation(id);
            return [id, loc] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      if (cancelled) return;
      setOwnerLocations((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerIdsKey, ownerLocations]);

  // Build one slot per active layout
  const slots = useMemo<SlotWithLayouts[]>(() => {
    return activeLayouts.map((layout) => {
      const mergedGrid = mergeStatusesIntoGrid(layout.grid, statusMap, vehicleMap);
      const spaces = extractSpacesFromGrid(mergedGrid, statusMap, vehicleMap);
      const available = spaces.filter((s) => s.status === 'Available').length;
      const reserved = spaces.filter((s) => s.status === 'Reserved').length;

      const ownerLoc = layout.ownerId ? ownerLocations[layout.ownerId] : null;
      const locationName = ownerLoc?.name || layout.layoutName;
      const coordinate = extractCoordinateFromLink(ownerLoc?.link);
      const embedUrl = buildGoogleMapsEmbedUrl(ownerLoc?.link, locationName, coordinate);

      const distanceText =
        userLocation && coordinate.latitude !== 0 && coordinate.longitude !== 0
          ? `${Math.max(getDistanceKm(userLocation, coordinate), 0.1).toFixed(1)} km`
          : '-- km';

      const enrichedLayout: ParkingLayout = { ...layout, grid: mergedGrid };

      return {
        id: layout.layoutId,
        locationName,
        status: available > 0 ? 'Available' : reserved > 0 ? 'Reserved' : 'Occupied',
        distance: distanceText,
        rate: 'Free',
        coordinate,
        mapLink: buildMapsUrl(coordinate, locationName),
        embedUrl,
        availableSlotCount: available,
        totalSlotCount: spaces.length,
        slots: spaces,
        layouts: [enrichedLayout],
      };
    });
  }, [activeLayouts, statusMap, vehicleMap, ownerLocations, userLocation]);

  const isLoading = !layoutsReady || !sensorsReady || !spotsReady;

  // No-op for FlatList.onRefresh compatibility — listeners stream updates.
  const refresh = useCallback(() => Promise.resolve(), []);

  return { slots, isLoading, error, refresh };
};
