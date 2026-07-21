import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

describe('TopSlide banner actions', () => {
  it('does not render clickable home banners when buttonLink is missing', () => {
    expect(source).not.toContain('href={value?.buttonLink}');
    expect(source).not.toContain("<SwiperSlide key={value.id} style={{ cursor: 'pointer' }}>");
    expect(source).not.toContain('item.isShowButton && ctaHref ?');
  });

  it('keeps home banners as image-only media with responsive crop ratios', () => {
    expect(source).not.toContain("item.description || 'Square'");
    expect(source).not.toContain('item.buttonText ||');
    expect(source).toContain('component="picture"');
  });

  it('keeps the hero as a full-bleed mockup section with constrained content', () => {
    expect(source).toContain('const HERO_CONTAINER_MAX_WIDTH = 1280');
    expect(source).toContain("width: '100vw'");
    expect(source).toContain("mx: 'calc(50% - 50vw)'");
    expect(source).not.toContain('px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 }');
  });

  it('renders the hero copy and search as an overlay on the banner image', () => {
    expect(source).toContain('const HERO_HEADER_OFFSET');
    expect(source).toContain('calc(100svh - ${HERO_HEADER_OFFSET.xs})');
    expect(source).toContain('minHeight: { xs: 560, md: 650 }');
    expect(source).toContain('rgba(4, 48, 104, 0.95)');
    expect(source).toContain('<HomeSearch variant="hero" />');
    expect(source).not.toContain('<Card');
    expect(source).not.toContain('heroPrimaryCta');
    expect(source).not.toContain('heroSecondaryCta');
  });
});
