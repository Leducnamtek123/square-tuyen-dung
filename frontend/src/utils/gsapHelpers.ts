import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Standard GSAP responsive breakpoints and conditions for matchMedia
 */
export const GSAP_MEDIA_CONDITIONS = {
  isDesktop: '(min-width: 769px)',
  isMobile: '(max-width: 768px)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
} as const;

let pluginsRegistered = false;

/**
 * Safely registers GSAP plugins on the client-side once.
 */
export const registerGsapPlugins = (): void => {
  if (typeof window === 'undefined' || pluginsRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  pluginsRegistered = true;
};

let refreshRafId: number | null = null;
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Safely debounces ScrollTrigger.refresh() using requestAnimationFrame.
 * Essential when dynamic content (React Query data, images, accordions, lazy components)
 * shifts page layout and triggers need recalculation.
 */
export const safeScrollTriggerRefresh = (delayMs = 60): void => {
  if (typeof window === 'undefined') return;

  if (refreshTimeoutId !== null) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }

  if (refreshRafId !== null) {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(refreshRafId);
    }
    refreshRafId = null;
  }

  const executeRefresh = () => {
    ScrollTrigger.refresh();
    refreshRafId = null;
    refreshTimeoutId = null;
  };

  const scheduleRaf = () => {
    if (typeof requestAnimationFrame === 'function') {
      refreshRafId = requestAnimationFrame(executeRefresh);
    } else {
      executeRefresh();
    }
  };

  if (delayMs > 0) {
    refreshTimeoutId = setTimeout(scheduleRaf, delayMs);
  } else {
    scheduleRaf();
  }
};
