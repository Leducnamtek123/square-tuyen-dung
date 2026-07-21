import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, relativePath), 'utf8');

describe('error pages i18n', () => {
  it('does not hard-code the global error document language to Vietnamese', () => {
    const source = readSource('../global-error.tsx');

    expect(source).toContain('i18n.language');
    expect(source).not.toContain('<html lang="vi">');
  });
});
