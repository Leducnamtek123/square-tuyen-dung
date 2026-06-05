import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const pageKeys = ['contact', 'faq', 'terms', 'privacy'];
const fieldKeys = ['title', 'subtitle', 'sections'];

describe('StaticInfoPage i18n', () => {
  it('does not keep hard-coded static page fallback content in source', () => {
    expect(source).not.toContain('const fallback');
    expect(source).not.toContain('defaultValue');
    expect(source).not.toContain('Frequently Asked Questions');
    expect(source).not.toContain('Privacy Policy');
    expect(source).not.toContain('Terms of Service');
  });

  it('has Vietnamese and English locale entries for static pages', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/public.json'), 'utf8'));

    pageKeys.forEach((pageKey) => {
      fieldKeys.forEach((fieldKey) => {
        expect(vi.static?.[pageKey]?.[fieldKey]).toBeTruthy();
        expect(en.static?.[pageKey]?.[fieldKey]).toBeTruthy();
      });
    });
  });
});
