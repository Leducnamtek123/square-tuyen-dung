import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../ChatWindowComposer.tsx'), 'utf8');

const fixedKeys = [
  'composer.attachFile',
  'composer.chooseEmoji',
  'composer.sendMessage',
];

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('ChatWindowComposer i18n', () => {
  it('does not hard-code chat composer aria labels in English', () => {
    [
      'aria-label="Attach file"',
      'aria-label="Choose emoji"',
      'aria-label="Send message"',
    ].forEach((copy) => {
      expect(source).not.toContain(copy);
    });
  });

  it('uses chat locale keys for composer aria labels', () => {
    expect(source).toContain("useTranslation('chat')");
    fixedKeys.forEach((key) => {
      expect(source).toContain(key);
    });
  });

  it('has Vietnamese and English locale entries for composer aria labels', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/vi/chat.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/en/chat.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      expect(readKey(vi, key)).toEqual(expect.any(String));
      expect(readKey(en, key)).toEqual(expect.any(String));
    });
  });
});
