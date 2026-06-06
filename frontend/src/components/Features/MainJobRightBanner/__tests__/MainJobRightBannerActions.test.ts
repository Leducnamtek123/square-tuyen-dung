import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

describe('MainJobRightBanner actions', () => {
  it('does not render placeholder anchor links for banners without a buttonLink', () => {
    expect(source).not.toContain('href={banner.buttonLink || "#"}');
    expect(source).toContain('banner.buttonLink ?');
  });
});
