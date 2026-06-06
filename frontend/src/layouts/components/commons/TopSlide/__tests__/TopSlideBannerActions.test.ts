import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

describe('TopSlide banner actions', () => {
  it('does not render clickable home banners when buttonLink is missing', () => {
    expect(source).not.toContain('href={value?.buttonLink}');
    expect(source).not.toContain("<SwiperSlide key={value.id} style={{ cursor: 'pointer' }}>");
    expect(source).toContain('value.buttonLink ?');
  });
});
