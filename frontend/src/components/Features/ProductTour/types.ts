export type TourStepPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface TourStep {
  id: string;
  /**
   * CSS selector or data-tour attribute to highlight
   * e.g. '[data-tour="interview-hints"]' or '#tour-controls'
   */
  target: string;
  title: string;
  content: string;
  placement?: TourStepPlacement;
  /** Optional custom action before stepping into this item */
  beforeStep?: () => Promise<void> | void;
}

export interface TourConfig {
  key: string;
  title: string;
  steps: TourStep[];
  /** If true, start automatically on first page visit if not previously seen */
  autoStartFirstVisit?: boolean;
  /** Force light or dark theme for the tour card, defaults to 'light' (or auto for dark routes) */
  themeMode?: 'light' | 'dark' | 'auto';
}

export interface ProductTourContextType {
  activeTour: TourConfig | null;
  currentStepIndex: number;
  currentStep: TourStep | null;
  isOpen: boolean;
  startTour: (tourKey: string, force?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  closeTour: () => void;
  hasCompletedTour: (tourKey: string) => boolean;
  resetTour: (tourKey: string) => void;
}
