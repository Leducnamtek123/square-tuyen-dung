import { readFileSync } from 'fs';
import { join } from 'path';

const readCommonSource = (relativePath: string) =>
  readFileSync(join(__dirname, '..', relativePath), 'utf8');

describe('common employer navigation routes', () => {
  it('standardizes employer links in the common header to 5 main items', () => {
    const source = readCommonSource('Header/index.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.INTRODUCE}`");
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.SERVICE}`");
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.PRICING}`");
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.SUPPORT}`");

    // 5 standardized employer header items
    expect(source).toContain("id: '1', label: t('nav.home', 'Trang chủ'), path: localizeRoutePath('/', i18n.language)");
    expect(source).toContain("id: '2', label: t('nav.aboutUs', 'Giới thiệu'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.INTRODUCE}`, i18n.language)");
    expect(source).toContain("id: '3', label: t('nav.servicesAndPricing', 'Dịch vụ & Bảng giá'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)");
    expect(source).toContain("id: '4', label: t('nav.findCandidates', 'Tìm ứng viên'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.PROFILE}`, i18n.language), requireAuth: true, isHighlight: true");
    expect(source).toContain("id: '5', label: t('nav.support', 'Hỗ trợ'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.SUPPORT}`, i18n.language)");
  });

  it('synchronizes LeftDrawer mobile drawer with root route active check and highlight support', () => {
    const source = readCommonSource('LeftDrawer/index.tsx');

    expect(source).toContain("page.path === '/'");
    expect(source).toContain("isItemActive");
    expect(source).toContain("isHighlight?: boolean");
  });

  it('contains all required employer navigation i18n keys in common.json', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(vi.nav.home).toBe('Trang chủ');
    expect(vi.nav.aboutUs).toBe('Giới thiệu');
    expect(vi.nav.servicesAndPricing).toBe('Dịch vụ & Bảng giá');
    expect(vi.nav.findCandidates).toBe('Tìm ứng viên');
    expect(vi.nav.support).toBe('Hỗ trợ');

    expect(en.nav.home).toBe('Home');
    expect(en.nav.aboutUs).toBe('About Us');
    expect(en.nav.servicesAndPricing).toBe('Services & Pricing');
    expect(en.nav.findCandidates).toBe('Find Candidates');
    expect(en.nav.support).toBe('Support');
  });

  it('localizes employer links in the common footer', () => {
    const source = `${readCommonSource('Footer/index.tsx')}\n${readCommonSource('Footer/EmployerFooter.tsx')}`;

    expect(source).toContain('localizeRoutePath');
    expect(source).not.toContain("route: `/${ROUTES.EMPLOYER.JOB_POST}`");
    expect(source).not.toContain("route: `/${ROUTES.EMPLOYER.PROFILE}`");
    expect(source).not.toContain("route: `/${ROUTES.EMPLOYER.DASHBOARD}`");
    expect(source).not.toContain("route: localizeRoutePath(`/${ROUTES.EMPLOYER.BLOG}`, lang)");
    expect(source).toContain("route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}?category=blog`, lang)");
  });
});
