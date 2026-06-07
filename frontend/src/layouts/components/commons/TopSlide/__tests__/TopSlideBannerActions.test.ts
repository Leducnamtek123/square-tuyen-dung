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
    expect(source).toContain("aspectRatio: { xs: '1 / 1', sm: '16 / 5' }");
  });
});
