import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('BackdropLoading i18n', () => {
  it('does not hard-code the loading image alt text in English', () => {
    expect(source).not.toContain('alt="Loading ..."');
  });

  it('uses the common loading locale key for loading alt text', () => {
    expect(source).toContain("useTranslation('common')");
    expect(source).toContain("t('loading')");
  });

  it('has Vietnamese and English locale entries for loading alt text', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(readKey(vi, 'loading')).toEqual(expect.any(String));
    expect(readKey(en, 'loading')).toEqual(expect.any(String));
  });
});
