import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../RangePickerCustom/index.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('RangePickerCustom i18n', () => {
  it('does not hard-code the refresh aria label', () => {
    expect(source).not.toContain('aria-label="refresh"');
    expect(source).toContain("t('actions.refresh')");
  });

  it('has Vietnamese and English locale entries for refresh action', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(readKey(vi, 'actions.refresh')).toEqual(expect.any(String));
    expect(readKey(en, 'actions.refresh')).toEqual(expect.any(String));
  });
});
