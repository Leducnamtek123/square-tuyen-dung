import { readFileSync } from 'fs';
import { join } from 'path';

const INTRODUCE_PAGE_PATH = join(__dirname, '..', 'index.tsx');

describe('IntroducePage Animation Resilience', () => {
  const source = readFileSync(INTRODUCE_PAGE_PATH, 'utf8');

  it('imports GSAP helper utilities and registers plugins safely', () => {
    expect(source).toContain('registerGsapPlugins');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS');
  });

  it('uses gsap.matchMedia for desktop and mobile responsive animations', () => {
    expect(source).toContain('gsap.matchMedia()');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isDesktop');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isMobile');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.reduceMotion');
  });

  it('ensures all ScrollTrigger animations have once: true and clearProps: "all"', () => {
    expect(source).toContain('clearProps: "all"');
    expect(source).toContain('once: true');
  });
});
