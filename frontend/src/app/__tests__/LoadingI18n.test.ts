import { readFileSync } from 'fs';
import { join } from 'path';

describe('app loading screen i18n', () => {
  it('uses common loading locale instead of hard-coded Vietnamese text', () => {
    const source = readFileSync(join(__dirname, '../loading.tsx'), 'utf8');

    expect(source).not.toContain('Đang tải');
    expect(source).toContain("'use client'");
    expect(source).toContain("useTranslation('common')");
    expect(source).toContain("t('loading')");
  });
});
