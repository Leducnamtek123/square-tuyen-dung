'use client';

import { useEffect } from 'react';
import { useProductTour } from './ProductTourContext';

/**
 * Automatically starts the given tour on page mount if the user has not completed it yet.
 * @param tourKey Key of the tour in PRODUCT_TOURS_CONFIG
 * @param delayMs Delay in ms before starting to allow DOM to render (default 600ms)
 */
export function useTourAutoStart(tourKey: string, delayMs = 600) {
  const { startTour, hasCompletedTour } = useProductTour();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (hasCompletedTour(tourKey)) return;

    const timer = setTimeout(() => {
      startTour(tourKey, false);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [tourKey, delayMs, startTour, hasCompletedTour]);
}
