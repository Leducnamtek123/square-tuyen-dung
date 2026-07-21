import { getPortalBreadcrumbs } from '../portalBreadcrumbs';

const commonVi = require('../../i18n/locales/vi/common.json');
const commonEn = require('../../i18n/locales/en/common.json');

describe('getPortalBreadcrumbs', () => {
  it('returns employer question group breadcrumbs for canonical route', () => {
    expect(getPortalBreadcrumbs('/employer/question-groups')).toEqual([
      { namespace: 'common', labelKey: 'breadcrumbs.employer', href: '/employer/dashboard' },
      { namespace: 'employer', labelKey: 'questionGroupsCard.onlineInterview', href: '/employer/interviews' },
      { namespace: 'employer', labelKey: 'questionGroupsCard.questionGroups' },
    ]);
  });

  it('returns employer question group breadcrumbs for localized Vietnamese route', () => {
    expect(getPortalBreadcrumbs('/nha-tuyen-dung/bo-cau-hoi')).toEqual([
      { namespace: 'common', labelKey: 'breadcrumbs.employer', href: '/employer/dashboard' },
      { namespace: 'employer', labelKey: 'questionGroupsCard.onlineInterview', href: '/employer/interviews' },
      { namespace: 'employer', labelKey: 'questionGroupsCard.questionGroups' },
    ]);
  });

  it('matches dynamic employer interview detail routes', () => {
    expect(getPortalBreadcrumbs('/employer/interviews/123')).toEqual([
      { namespace: 'common', labelKey: 'breadcrumbs.employer', href: '/employer/dashboard' },
      { namespace: 'employer', labelKey: 'questionGroupsCard.onlineInterview', href: '/employer/interviews' },
      { namespace: 'employer', labelKey: 'interviewDetail.title' },
    ]);
  });

  it('returns admin question group breadcrumbs with a localized admin root', () => {
    expect(getPortalBreadcrumbs('/admin/question-groups')).toEqual([
      { namespace: 'common', labelKey: 'breadcrumbs.admin', href: '/admin/dashboard' },
      { namespace: 'admin', labelKey: 'sidebar.recruitmentAndInterviews', href: '/admin/jobs' },
      { namespace: 'admin', labelKey: 'sidebar.interviewQuestionSets' },
    ]);
  });

  it('returns admin interview preview breadcrumbs for the localized route', () => {
    expect(getPortalBreadcrumbs('/quan-tri/xem-truoc-giao-dien-phong-van')).toEqual([
      { namespace: 'common', labelKey: 'breadcrumbs.admin', href: '/admin/dashboard' },
      { namespace: 'admin', labelKey: 'sidebar.recruitmentAndInterviews', href: '/admin/jobs' },
      { namespace: 'admin', labelKey: 'sidebar.interviewPreview' },
    ]);
  });

  it('has admin portal root translations in supported locales', () => {
    expect(commonVi.breadcrumbs.admin).toBe('Quản trị');
    expect(commonEn.breadcrumbs.admin).toBe('Admin');
  });

  it('returns no breadcrumbs for routes outside employer/admin portals', () => {
    expect(getPortalBreadcrumbs('/not-a-portal-page')).toEqual([]);
  });
});
