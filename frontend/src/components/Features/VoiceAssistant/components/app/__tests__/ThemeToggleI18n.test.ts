import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../theme-toggle.tsx'), 'utf8');

const fixedKeys = [
  'voiceAi.theme.toggle',
  'voiceAi.theme.dark',
  'voiceAi.theme.light',
  'voiceAi.theme.system',
];

describe('Voice assistant ThemeToggle i18n', () => {
  it('does not hard-code screen reader theme labels in English', () => {
    [
      'Color scheme toggle',
      'Enable dark color scheme',
      'Enable light color scheme',
      'Enable system color scheme',
    ].forEach((text) => {
      expect(source).not.toContain(text);
    });
  });

  it('uses interview locale keys for theme labels', () => {
    expect(source).toContain("useTranslation('interview')");
    fixedKeys.forEach((key) => {
      expect(source).toContain(key);
    });
  });

  it('has Vietnamese and English locale entries for theme labels', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../../i18n/locales/vi/interview.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../../i18n/locales/en/interview.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      const path = key.split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
