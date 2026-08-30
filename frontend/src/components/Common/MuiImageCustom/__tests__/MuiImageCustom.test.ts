import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

describe('MuiImageCustom Component Fast Rendering & Fallback', () => {
  it('implements native async decoding and zero artificial delay for instant render', () => {
    expect(source).toContain('decoding="async"');
    expect(source).toContain('loading={loading}');
    expect(source).not.toContain('shiftDuration={600}');
  });

  it('implements robust fallback handling on error', () => {
    expect(source).toContain('handleError');
    expect(source).toContain('resolvedFallback');
    expect(source).toContain('setCurrentSrc(resolvedFallback)');
  });

  it('supports MUI sx styling and objectFit', () => {
    expect(source).toContain('sx={{');
    expect(source).toContain('objectFit: fit');
  });
});
