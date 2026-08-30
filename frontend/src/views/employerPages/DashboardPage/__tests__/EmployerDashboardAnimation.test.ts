import { readFileSync } from 'fs';
import { join } from 'path';

const EMP_DASHBOARD_PAGE_PATH = join(__dirname, '..', 'index.tsx');

describe('Employer Dashboard Animation Resilience', () => {
  const source = readFileSync(EMP_DASHBOARD_PAGE_PATH, 'utf8');

  it('imports GSAP helper utilities and registers plugins safely', () => {
    expect(source).toContain('registerGsapPlugins');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS');
  });

  it('uses gsap.matchMedia for responsive timeline animations', () => {
    expect(source).toContain('gsap.matchMedia()');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isDesktop');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isMobile');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.reduceMotion');
  });

  it('uses clearProps: "all" to release inline styles after animation', () => {
    expect(source).toContain("clearProps: 'all'");
  });
});
