import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, relativePath), 'utf8');
const readLocale = (locale: 'en' | 'vi') =>
  JSON.parse(readFileSync(join(__dirname, `../../i18n/locales/${locale}/common.json`), 'utf8'));

describe('ClientAppRoot global error toast i18n', () => {
  it('does not hard-code global error toast copy', () => {
    const source = readSource('../ClientAppRoot.tsx');

    expect(source).not.toContain('<strong>Đã có lỗi xảy ra.</strong> Vui lòng thử lại sau.');
    expect(source).not.toContain('<strong>Yêu cầu chưa thể xử lý.</strong> Vui lòng thử lại sau.');
    expect(source).toContain("useTranslation('common')");
    expect(source).toContain('systemError.occurred');
    expect(source).toContain('systemError.requestFailed');
    expect(source).toContain('systemError.tryAgain');
  });

  it('has global error toast locale entries in English and Vietnamese', () => {
    for (const locale of ['en', 'vi'] as const) {
      const common = readLocale(locale);

      expect(common.systemError.occurred).toEqual(expect.any(String));
      expect(common.systemError.requestFailed).toEqual(expect.any(String));
      expect(common.systemError.tryAgain).toEqual(expect.any(String));
    }
  });
});
