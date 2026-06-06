import { ROUTES } from './routeConfig';
import { localizeRoutePath } from './routeLocalization';

export type PortalBreadcrumbNamespace = 'admin' | 'common' | 'employer';

export type PortalBreadcrumbItem = {
  namespace: PortalBreadcrumbNamespace;
  labelKey: string;
  href?: string;
};

type BreadcrumbRoute = {
  pattern: string;
  items: PortalBreadcrumbItem[];
};

const routePath = (route: string) => `/${route}`;

const employerRoot: PortalBreadcrumbItem = {
  namespace: 'common',
  labelKey: 'breadcrumbs.employer',
  href: routePath(ROUTES.EMPLOYER.DASHBOARD),
};

const employerOnlineInterview: PortalBreadcrumbItem = {
  namespace: 'employer',
  labelKey: 'questionGroupsCard.onlineInterview',
  href: routePath(ROUTES.EMPLOYER.INTERVIEW_LIST),
};

const employerCandidateManagement: PortalBreadcrumbItem = {
  namespace: 'employer',
  labelKey: 'sidebar.candidateManagement',
  href: routePath(ROUTES.EMPLOYER.APPLIED_PROFILE),
};

const employerAccountManagement: PortalBreadcrumbItem = {
  namespace: 'employer',
  labelKey: 'sidebar.accountManagement',
  href: routePath(ROUTES.EMPLOYER.COMPANY),
};

const adminRoot: PortalBreadcrumbItem = {
  namespace: 'common',
  labelKey: 'breadcrumbs.admin',
  href: routePath(ROUTES.ADMIN.DASHBOARD),
};

const adminSystem: PortalBreadcrumbItem = {
  namespace: 'admin',
  labelKey: 'sidebar.systemAndUsers',
  href: routePath(ROUTES.ADMIN.USERS),
};

const adminCategories: PortalBreadcrumbItem = {
  namespace: 'admin',
  labelKey: 'sidebar.generalCategories',
  href: routePath(ROUTES.ADMIN.CAREERS),
};

const adminContent: PortalBreadcrumbItem = {
  namespace: 'admin',
  labelKey: 'sidebar.contentManagement',
  href: routePath(ROUTES.ADMIN.BANNERS),
};

const adminProfiles: PortalBreadcrumbItem = {
  namespace: 'admin',
  labelKey: 'sidebar.infoAndProfiles',
  href: routePath(ROUTES.ADMIN.COMPANIES),
};

const adminRecruitment: PortalBreadcrumbItem = {
  namespace: 'admin',
  labelKey: 'sidebar.recruitmentAndInterviews',
  href: routePath(ROUTES.ADMIN.JOBS),
};

const item = (
  namespace: PortalBreadcrumbNamespace,
  labelKey: string,
  href?: string
): PortalBreadcrumbItem => ({
  namespace,
  labelKey,
  ...(href ? { href } : {}),
});

const employerRoute = (
  route: string,
  leaf: PortalBreadcrumbItem,
  parent?: PortalBreadcrumbItem
): BreadcrumbRoute => ({
  pattern: routePath(route),
  items: parent ? [employerRoot, parent, leaf] : [employerRoot, leaf],
});

const adminRoute = (
  route: string,
  leaf: PortalBreadcrumbItem,
  parent?: PortalBreadcrumbItem
): BreadcrumbRoute => ({
  pattern: routePath(route),
  items: parent ? [adminRoot, parent, leaf] : [adminRoot, leaf],
});

const breadcrumbRoutes: BreadcrumbRoute[] = [
  employerRoute(ROUTES.EMPLOYER.DASHBOARD, item('employer', 'sidebar.dashboard')),
  employerRoute(ROUTES.EMPLOYER.AGENT_ASSISTANTS, item('employer', 'sidebar.agentAssistants')),
  employerRoute(ROUTES.EMPLOYER.JOB_POST, item('employer', 'sidebar.jobPostList')),
  employerRoute(ROUTES.EMPLOYER.APPLIED_PROFILE, item('employer', 'sidebar.appliedApplications'), employerCandidateManagement),
  employerRoute(ROUTES.EMPLOYER.SAVED_PROFILE, item('employer', 'sidebar.savedProfiles'), employerCandidateManagement),
  employerRoute(ROUTES.EMPLOYER.PROFILE, item('employer', 'sidebar.findCandidates'), employerCandidateManagement),
  employerRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, item('employer', 'sidebar.findCandidates'), employerCandidateManagement),
  employerRoute(ROUTES.EMPLOYER.INTERVIEW_LIST, item('employer', 'sidebar.interviewList'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.INTERVIEW_LIVE, item('employer', 'sidebar.interviewLive'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.INTERVIEW_HISTORY, item('employer', 'interviewHistory.title'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.INTERVIEW_SESSION, item('employer', 'interviewLive.title'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.INTERVIEW_CREATE, item('employer', 'interviewCreateCard.title.scheduleOnlineInterview'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.INTERVIEW_EDIT, item('employer', 'interviewCreateCard.title.scheduleOnlineInterview'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.INTERVIEW_DETAIL, item('employer', 'interviewDetail.title'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.QUESTION_BANK, item('employer', 'sidebar.questionBank'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.QUESTION_GROUPS, item('employer', 'questionGroupsCard.questionGroups'), employerOnlineInterview),
  employerRoute(ROUTES.EMPLOYER.NOTIFICATION, item('employer', 'sidebar.notifications')),
  employerRoute(ROUTES.EMPLOYER.COMPANY, item('employer', 'sidebar.companyInfo'), employerAccountManagement),
  employerRoute(ROUTES.EMPLOYER.VERIFICATION, item('employer', 'sidebar.employerVerification'), employerAccountManagement),
  employerRoute(ROUTES.EMPLOYER.ACCOUNT, item('employer', 'sidebar.account'), employerAccountManagement),
  employerRoute(ROUTES.EMPLOYER.SETTING, item('employer', 'sidebar.settings'), employerAccountManagement),
  employerRoute(ROUTES.EMPLOYER.BLOG, item('employer', 'blog.title')),
  employerRoute(ROUTES.EMPLOYER.BLOG_CREATE, item('employer', 'blog.form.createTitle')),
  employerRoute(ROUTES.EMPLOYER.BLOG_DETAIL, item('employer', 'blog.form.editTitle')),
  employerRoute(ROUTES.EMPLOYER.CONTACT, item('employer', 'support.directSupport.title')),
  employerRoute(ROUTES.EMPLOYER.FAQ, item('employer', 'support.faq.title')),
  employerRoute(ROUTES.EMPLOYER.TERMS_OF_SERVICE, item('common', 'footer.tos')),
  employerRoute(ROUTES.EMPLOYER.PRIVACY_POLICY, item('common', 'footer.privacy')),

  adminRoute('admin', item('admin', 'sidebar.systemOverview')),
  adminRoute(ROUTES.ADMIN.DASHBOARD, item('admin', 'sidebar.systemOverview')),
  adminRoute(ROUTES.ADMIN.AGENT_ASSISTANTS, item('admin', 'sidebar.agentAssistants')),
  adminRoute(ROUTES.ADMIN.USERS, item('admin', 'sidebar.usersAndPermissions'), adminSystem),
  adminRoute(ROUTES.ADMIN.SETTINGS, item('admin', 'sidebar.systemConfiguration'), adminSystem),
  adminRoute(ROUTES.ADMIN.AUDIT_LOGS, item('admin', 'sidebar.auditLogs'), adminSystem),
  adminRoute(ROUTES.ADMIN.CAREERS, item('admin', 'sidebar.careersManagement'), adminCategories),
  adminRoute(ROUTES.ADMIN.CITIES, item('admin', 'sidebar.citiesManagement'), adminCategories),
  adminRoute(ROUTES.ADMIN.DISTRICTS, item('admin', 'sidebar.districtsManagement'), adminCategories),
  adminRoute(ROUTES.ADMIN.WARDS, item('admin', 'sidebar.wardsManagement'), adminCategories),
  adminRoute(ROUTES.ADMIN.BANNERS, item('admin', 'sidebar.bannersManagement'), adminContent),
  adminRoute(ROUTES.ADMIN.BANNER_TYPES, item('admin', 'sidebar.bannerTypes'), adminContent),
  adminRoute(ROUTES.ADMIN.FEEDBACKS, item('admin', 'sidebar.feedbacksManagement'), adminContent),
  adminRoute(ROUTES.ADMIN.ARTICLE_CREATE, item('admin', 'sidebar.articlesManagement'), adminContent),
  adminRoute(ROUTES.ADMIN.ARTICLE_DETAIL, item('admin', 'sidebar.articlesManagement'), adminContent),
  adminRoute(ROUTES.ADMIN.ARTICLES, item('admin', 'sidebar.articlesManagement'), adminContent),
  adminRoute(ROUTES.ADMIN.CHAT, item('admin', 'sidebar.chatWithEmployers'), adminContent),
  adminRoute(ROUTES.ADMIN.COMPANIES, item('admin', 'sidebar.companyManagement'), adminProfiles),
  adminRoute(ROUTES.ADMIN.COMPANY_VERIFICATIONS, item('admin', 'sidebar.companyVerifications'), adminProfiles),
  adminRoute(ROUTES.ADMIN.PROFILES, item('admin', 'sidebar.candidateProfiles'), adminProfiles),
  adminRoute(ROUTES.ADMIN.RESUMES, item('admin', 'sidebar.resumeManagement'), adminProfiles),
  adminRoute(ROUTES.ADMIN.JOBS, item('admin', 'sidebar.jobPosts'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.QUESTIONS, item('admin', 'sidebar.questionBank'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.QUESTION_GROUPS, item('admin', 'sidebar.interviewQuestionSets'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.TRUST_REPORTS, item('admin', 'sidebar.trustReports'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.JOB_ACTIVITY, item('admin', 'sidebar.activityLogs'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.INTERVIEWS, item('admin', 'sidebar.interviewSchedule'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.VOICE_PROFILES, item('admin', 'sidebar.voiceProfiles'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.JOB_NOTIFICATIONS, item('admin', 'sidebar.jobNotifications'), adminRecruitment),
  adminRoute(ROUTES.ADMIN.INTERVIEW_PREVIEW, item('admin', 'sidebar.interviewPreview'), adminRecruitment),
];

const normalizePathname = (pathname: string): string => {
  const [pathWithoutHash] = pathname.split('#');
  const [pathWithoutQuery] = pathWithoutHash.split('?');
  const pathWithSlash = pathWithoutQuery.startsWith('/') ? pathWithoutQuery : `/${pathWithoutQuery}`;
  const canonicalPath = localizeRoutePath(pathWithSlash, 'en');
  const normalizedPath = canonicalPath.replace(/\/+$/, '');

  return normalizedPath || '/';
};

const patternToRegex = (pattern: string): RegExp => {
  const escapedPattern = normalizePathname(pattern)
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        return '[^/]+';
      }

      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');

  return new RegExp(`^${escapedPattern}$`);
};

export const getPortalBreadcrumbs = (pathname: string): PortalBreadcrumbItem[] => {
  const normalizedPathname = normalizePathname(pathname);
  const route = breadcrumbRoutes.find((candidate) => patternToRegex(candidate.pattern).test(normalizedPathname));

  return route?.items ?? [];
};
