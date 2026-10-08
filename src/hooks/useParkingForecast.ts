import { useEffect, useState } from 'react';
import { fetchParkingForecast } from '../services/parkingService';
import type { ParkingForecast } from '../types/parking';

type UseParkingForecastResult = {
  forecast: ParkingForecast | null;
  isLoading: boolean;
  error: string | null;
};

export const useParkingForecast = (layoutId: string): UseParkingForecastResult => {
  const [forecast, setForecast] = useState<ParkingForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setForecast(null);
    setIsLoading(true);
    setError(null);

    fetchParkingForecast(layoutId)
      .then((result) => {
        if (!cancelled) setForecast(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load parking forecast');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [layoutId]);

  return {
    forecast,
    isLoading,
    error,
  };
};

type UseParkingForecastsResult = {
  forecasts: Record<string, ParkingForecast>;
  isLoading: boolean;
  error: string | null;
};

const hasInsufficientForecastData = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';

  return /(?:insufficient|not enough|no)\s+(?:historical\s+)?(?:parking\s+)?(?:sensor\s+)?(?:data|records|history|readings)|no\s+(?:sensor\s+)?history/i.test(message);
};

export const useParkingForecasts = (layoutIds: string[]): UseParkingForecastsResult => {
  const [forecasts, setForecasts] = useState<Record<string, ParkingForecast>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const layoutIdsKey = layoutIds.join('|');

  useEffect(() => {
    let cancelled = false;
    const uniqueLayoutIds = Array.from(new Set(layoutIds));

    setForecasts({});
    setError(null);

    if (uniqueLayoutIds.length === 0) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);

    Promise.allSettled(uniqueLayoutIds.map((layoutId) => fetchParkingForecast(layoutId)))
      .then((results) => {
        if (cancelled) return;

        const nextForecasts: Record<string, ParkingForecast> = {};
        const failedLayouts: string[] = [];
        let hasInsufficientDataError = false;

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            nextForecasts[result.value.layoutId] = result.value;
          } else {
            failedLayouts.push(uniqueLayoutIds[index]);
            hasInsufficientDataError = hasInsufficientDataError || hasInsufficientForecastData(result.reason);
          }
        });

        setForecasts(nextForecasts);
        if (failedLayouts.length > 0) {
          setError(
            hasInsufficientDataError
              ? 'Unavailable because there is not enough parking history yet.'
              : `Unable to load the forecast for ${failedLayouts.length} layout${failedLayouts.length === 1 ? '' : 's'}.`
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [layoutIdsKey]);

  return { forecasts, isLoading, error };
};
