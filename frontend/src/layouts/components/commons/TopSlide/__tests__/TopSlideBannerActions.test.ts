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

  it('keeps the hero card aligned with the banner frame', () => {
    expect(source).toContain('const HERO_FRAME_MAX_WIDTH');
    expect(source).toContain('maxWidth: HERO_FRAME_MAX_WIDTH');
    expect(source).toContain('<Box sx={heroFrameSx}>');
    expect(source).not.toContain('px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 }');
  });

  it('renders the hero copy and search as an overlay on the banner image', () => {
    expect(source).toContain('height: { xs: 700, sm: 560, md: 500, lg: 540 }');
    expect(source).toContain('rgba(4, 22, 49, 0.88)');
    expect(source).toContain('<HomeSearch variant="hero" />');
    expect(source).not.toContain('<Card');
    expect(source).not.toContain('heroPrimaryCta');
    expect(source).not.toContain('heroSecondaryCta');
  });
});
