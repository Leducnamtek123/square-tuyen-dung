import { readFileSync } from 'fs';
import { join } from 'path';

const subHeaderSource = readFileSync(join(__dirname, '../SubHeader/index.tsx'), 'utf8');
const dialogSource = readFileSync(join(__dirname, '../SubHeaderDialog/index.tsx'), 'utf8');

describe('SubHeader i18n', () => {
  it('does not hide missing navigation labels with hard-coded fallback copy', () => {
    expect(subHeaderSource).not.toContain("defaultValue: 'Next'");
    expect(dialogSource).not.toContain("defaultValue: 'Hot'");

    expect(subHeaderSource).toContain("t('next')");
    expect(dialogSource).toContain("t('common.hot')");
  });

  it('uses localized close aria labels in the career dialog', () => {
    expect(dialogSource).not.toContain('aria-label="close"');
    expect(dialogSource).toContain("aria-label={t('actions.close')}");
  });

  it('has Vietnamese and English locale entries for the fixed labels', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(vi.next).toEqual(expect.any(String));
    expect(en.next).toEqual(expect.any(String));
    expect(vi.common.hot).toEqual(expect.any(String));
    expect(en.common.hot).toEqual(expect.any(String));
    expect(vi.actions.close).toEqual(expect.any(String));
    expect(en.actions.close).toEqual(expect.any(String));
  });
});
