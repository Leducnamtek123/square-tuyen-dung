import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
  safeScrollTriggerRefresh,
} from '../gsapHelpers';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

describe('gsapHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports correct media condition strings for desktop, mobile and reduced motion', () => {
    expect(GSAP_MEDIA_CONDITIONS.isDesktop).toBe('(min-width: 769px)');
    expect(GSAP_MEDIA_CONDITIONS.isMobile).toBe('(max-width: 768px)');
    expect(GSAP_MEDIA_CONDITIONS.reduceMotion).toBe('(prefers-reduced-motion: reduce)');
  });

  it('registers GSAP plugins safely without throwing', () => {
    expect(() => registerGsapPlugins()).not.toThrow();
  });

  it('calls ScrollTrigger.refresh safely via safeScrollTriggerRefresh', () => {
    const originalWindow = (global as any).window;
    (global as any).window = {
      requestAnimationFrame: (cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      },
      cancelAnimationFrame: () => {},
    };

    const refreshSpy = jest.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => {});

    safeScrollTriggerRefresh(0);

    expect(refreshSpy).toHaveBeenCalled();

    refreshSpy.mockRestore();
    if (originalWindow !== undefined) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }
  });
});
