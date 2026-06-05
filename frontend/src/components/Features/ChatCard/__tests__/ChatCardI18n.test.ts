import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('ChatCard i18n', () => {
  it('does not hard-code the chat icon aria-label in English', () => {
    expect(source).not.toContain('show new notifications');
    expect(source).toContain('chatCard.openChat');
  });

  it('has Vietnamese and English locale entries for the chat icon aria-label', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(readKey(vi, 'chatCard.openChat')).toEqual(expect.any(String));
    expect(readKey(en, 'chatCard.openChat')).toEqual(expect.any(String));
  });
});
