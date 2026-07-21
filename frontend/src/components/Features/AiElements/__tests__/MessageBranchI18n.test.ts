import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../message.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('AI message branch i18n', () => {
  it('does not hard-code branch navigation aria labels', () => {
    expect(source).not.toContain('aria-label="Previous branch"');
    expect(source).not.toContain('aria-label="Next branch"');
    expect(source).toContain("t('aiElements.previousBranch')");
    expect(source).toContain("t('aiElements.nextBranch')");
  });

  it('has Vietnamese and English locale entries for branch navigation', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(readKey(vi, 'aiElements.previousBranch')).toEqual(expect.any(String));
    expect(readKey(en, 'aiElements.previousBranch')).toEqual(expect.any(String));
    expect(readKey(vi, 'aiElements.nextBranch')).toEqual(expect.any(String));
    expect(readKey(en, 'aiElements.nextBranch')).toEqual(expect.any(String));
  });
});
