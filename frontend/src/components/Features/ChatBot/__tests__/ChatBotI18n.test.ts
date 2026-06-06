import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('chatbot i18n', () => {
  it('does not hard-code the chatbot panel aria label', () => {
    expect(source).not.toContain('aria-label="Square AI Chat"');
    expect(source).not.toContain("|| 'Thử lại'");
    expect(source).toContain("t('chat:chatbot.panelAria')");
    expect(source).toContain("t('chat:chatbot.retry')");
  });

  it('has Vietnamese and English locale entries for the chatbot panel', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/chat.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/chat.json'), 'utf8'));

    expect(readKey(vi, 'chatbot.panelAria')).toEqual(expect.any(String));
    expect(readKey(en, 'chatbot.panelAria')).toEqual(expect.any(String));
  });
});
