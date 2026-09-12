'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { TourConfig, TourStep, ProductTourContextType } from './types';
import { PRODUCT_TOURS_CONFIG } from '@/configs/productToursConfig';
import { ProductTourOverlay } from './ProductTourOverlay';

const STORAGE_PREFIX = 'infohr_product_tour_completed_';

const ProductTourContext = createContext<ProductTourContextType | null>(null);

export const ProductTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTour, setActiveTour] = useState<TourConfig | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const hasCompletedTour = useCallback((tourKey: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(`${STORAGE_PREFIX}${tourKey}`) === 'true';
    } catch {
      return false;
    }
  }, []);

  const markTourCompleted = useCallback((tourKey: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${tourKey}`, 'true');
    } catch {
      // Ignore localStorage write failure
    }
  }, []);

  const resetTour = useCallback((tourKey: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${tourKey}`);
    } catch {
      // Ignore
    }
  }, []);

  const startTour = useCallback(
    (tourKey: string, force = false) => {
      const config = PRODUCT_TOURS_CONFIG[tourKey];
      if (!config || config.steps.length === 0) return;

      if (!force && hasCompletedTour(tourKey)) {
        return;
      }

      setActiveTour(config);
      setCurrentStepIndex(0);
      setIsOpen(true);
    },
    [hasCompletedTour]
  );

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      markTourCompleted(activeTour.key);
      setIsOpen(false);
      setActiveTour(null);
    }
  }, [activeTour, currentStepIndex, markTourCompleted]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const closeTour = useCallback(() => {
    if (activeTour) {
      markTourCompleted(activeTour.key);
    }
    setIsOpen(false);
    setActiveTour(null);
  }, [activeTour, markTourCompleted]);

  const currentStep: TourStep | null = useMemo(() => {
    if (!activeTour || currentStepIndex < 0 || currentStepIndex >= activeTour.steps.length) {
      return null;
    }
    return activeTour.steps[currentStepIndex];
  }, [activeTour, currentStepIndex]);

  const contextValue = useMemo<ProductTourContextType>(
    () => ({
      activeTour,
      currentStepIndex,
      currentStep,
      isOpen,
      startTour,
      nextStep,
      prevStep,
      closeTour,
      hasCompletedTour,
      resetTour,
    }),
    [
      activeTour,
      currentStepIndex,
      currentStep,
      isOpen,
      startTour,
      nextStep,
      prevStep,
      closeTour,
      hasCompletedTour,
      resetTour,
    ]
  );

  return (
    <ProductTourContext.Provider value={contextValue}>
      {children}
      <ProductTourOverlay
        activeTour={activeTour}
        currentStepIndex={currentStepIndex}
        isOpen={isOpen}
        onNext={nextStep}
        onPrev={prevStep}
        onClose={closeTour}
      />
    </ProductTourContext.Provider>
  );
};

export const useProductTour = (): ProductTourContextType => {
  const context = useContext(ProductTourContext);
  if (!context) {
    throw new Error('useProductTour must be used within a ProductTourProvider');
  }
  return context;
};
