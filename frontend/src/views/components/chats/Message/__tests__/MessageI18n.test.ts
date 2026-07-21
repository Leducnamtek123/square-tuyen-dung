import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const fixedKeys = [
  'message.avatarAlt',
  'message.attachmentImageAlt',
  'message.downloadFile',
];

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('Chat Message i18n', () => {
  it('does not hard-code message accessibility copy in English', () => {
    [
      'alt="avatar 1"',
      'alt="attachment"',
      "'Download File'",
    ].forEach((copy) => {
      expect(source).not.toContain(copy);
    });
  });

  it('uses chat locale keys for message accessibility copy', () => {
    expect(source).toContain("useTranslation('chat')");
    fixedKeys.forEach((key) => {
      expect(source).toContain(key);
    });
  });

  it('has Vietnamese and English locale entries for message accessibility copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/vi/chat.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/en/chat.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      expect(readKey(vi, key)).toEqual(expect.any(String));
      expect(readKey(en, key)).toEqual(expect.any(String));
    });
  });
});
