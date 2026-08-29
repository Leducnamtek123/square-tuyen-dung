/**
 * ============================================================================
 * routeConfig.ts - Single source of truth for ALL application routes
 * ============================================================================
 *
 * Every route path (EN ↔ VI), portal prefix, and Next.js rewrite rule is
 * derived from the data structures defined in this file.
 *
 * Other modules should import from here:
 *   - constants.ts      → ROUTES
 *   - routeLocalization  → segment map
 *   - next.config.mjs    → rewrites array
 *   - portalRouting       → portal prefixes
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1. Segment Map - Maps every Vietnamese slug ↔ English slug
// ---------------------------------------------------------------------------

export const SEGMENT_MAP = {
  // Auth
  'dang-nhap': 'login',
  'dang-ky': 'register',
  'quen-mat-khau': 'forgot-password',
  'cap-nhat-mat-khau': 'reset-password',
  'xac-nhan-email': 'email-verification-required',

  // Job Seeker - Public
  'viec-lam': 'jobs',
  'cong-ty': 'companies',
  've-chung-toi': 'about-us',
  'viec-lam-theo-nganh-nghe': 'jobs-by-career',
  'viec-lam-theo-tinh-thanh': 'jobs-by-city',
  'viec-lam-theo-hinh-thuc-lam-viec': 'jobs-by-type',
  'danh-sach-mau-cv': 'cv-templates',
  'mau-cv': 'cv-templates',
  'tao-cv': 'cv-builder',

  // Job Seeker - Private
  'bang-dieu-khien': 'dashboard',
  'ho-so': 'profile',
  'ho-so-tung-buoc': 'online-profile',
  'ho-so-dinh-kem': 'attached-profile',
  'quan-ly-cv': 'my-cvs',
  'viec-lam-cua-toi': 'my-jobs',
  'cong-ty-cua-toi': 'my-company',
  'phong-van-cua-toi': 'my-interviews',
  'thong-bao': 'notifications',
  'tai-khoan': 'account',
  'ket-noi-voi-nha-tuyen-dung': 'chat',
  'tin-tuc': 'blog',

  // Employer
  'nha-tuyen-dung': 'employer',
  'gioi-thieu': 'introduce',
  'dich-vu': 'service',
  'bao-gia': 'pricing',
  'ho-tro': 'support',
  'blog-tuyen-dung': 'blog',
  'tin-tuyen-dung': 'job-posts',
  'tro-ly-agent': 'agent-assistants',
  'ho-so-ung-tuyen': 'applied-profiles',
  'ho-so-da-luu': 'saved-profiles',
  'danh-sach-ung-vien': 'candidates',
  'tim-ung-vien': 'candidates',
  'chi-tiet-ung-vien': 'candidate-detail',
  'cai-dat': 'settings',
  'ket-noi-voi-ung-vien': 'chat',
  'danh-sach-phong-van': 'interviews',
  'phong-van-ung-vien-truc-tiep': 'interviews/live',
  'thu-vien-video-phong-van': 'interviews/history',
  'phong-van-truc-tiep': 'interviews',
  'len-lich-phong-van': 'interviews/create',
  'chi-tiet-phong-van': 'interviews',
  'sua-lich-phong-van': 'interviews',
  'ngan-hang-cau-hoi': 'question-bank',
  'bo-cau-hoi': 'question-groups',
  'xac-thuc-nha-tuyen-dung': 'verification',

  // Admin
  'quan-tri': 'admin',
  'quan-ly-nguoi-dung': 'users',
  'quan-ly-tin-tuyen-dung': 'jobs',
  'kho-cau-hoi': 'questions',
  'quan-ly-bo-cau-hoi': 'question-groups',
  'quan-ly-phong-van': 'interviews',
  'quan-ly-giong-noi-ai': 'voice-profiles',
  'cai-dat-he-thong': 'settings',
  'quan-ly-nganh-nghe': 'careers',
  'quan-ly-tinh-thanh': 'cities',
  'quan-ly-quan-huyen': 'districts',
  'quan-ly-phuong-xa': 'wards',
  'quan-ly-cong-ty': 'companies',
  'quan-ly-ho-so-ung-vien': 'profiles',
  'quan-ly-cv-resume': 'resumes',
  'nhat-ky-tin-tuyen-dung': 'job-activity',
  'thong-bao-viec-lam': 'job-notifications',
  'phong-van-cong-ty-truc-tiep': 'interviews/live',
  'quan-ly-loai-banner': 'banner-types',
  'quan-ly-banner': 'banners',
  'quan-ly-danh-gia': 'feedbacks',
  'tin-tuc-blog': 'articles',
  'tao-moi': 'create',
  'xac-thuc-cong-ty': 'company-verifications',
  'bao-cao-tin-cay': 'trust-reports',
  'nhat-ky-he-thong': 'audit-logs',
  'tro-ly-agent-quan-tri': 'agent-assistants',
  'xem-truoc-giao-dien-phong-van': 'interview-preview',
  'he-thong-giao-dien': 'components',
  'component': 'components',

  // Interview (candidate)
  'phong-van': 'interview',
  'room': 'room',

  // Misc & Legal Policies
  'lien-he': 'contact',
  'cau-hoi-thuong-gap': 'faq',
  'dieu-khoan-dich-vu': 'terms-of-service',
  'chinh-sach-bao-mat': 'privacy-policy',
  'thoa-thuan-su-dung': 'thoa-thuan-su-dung',
  'dieu-khoan-su-dung': 'terms-of-service',
  'quy-dinh-bao-mat': 'quy-dinh-bao-mat',
  'tuan-thu-va-su-dong-y-cua-khach-hang': 'tuan-thu-va-su-dong-y-cua-khach-hang',
  'so-do-trang-web': 'so-do-trang-web',
  'chinh-sach-bao-hanh': 'chinh-sach-bao-hanh',
  'quy-dinh-dang-tin': 'quy-dinh-dang-tin',
} as const;

// Reverse map: English → Vietnamese
export const EN_TO_VI_MAP: Record<string, string> = {};
export const VI_TO_EN_MAP: Record<string, string> = {};

for (const [vi, en] of Object.entries(SEGMENT_MAP)) {
  VI_TO_EN_MAP[vi] = en;
  // Only set first occurrence to avoid overwrites from duplicates
  if (!(en in EN_TO_VI_MAP)) {
    EN_TO_VI_MAP[en] = vi;
  }
}

// ---------------------------------------------------------------------------
// 2. ROUTES constant - Structured route paths (English-only, canonical)
// ---------------------------------------------------------------------------

export const ROUTES = {
  AUTH: {
    EMAIL_VERIFICATION: 'email-verification-required',
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password/:token',
  },
  EMPLOYER_AUTH: {
    LOGIN: 'employer/login',
    REGISTER: 'employer/register',
    FORGOT_PASSWORD: 'employer/forgot-password',
    RESET_PASSWORD: 'employer/reset-password/:token',
  },
  ADMIN_AUTH: {
    LOGIN: 'admin/login',
    FORGOT_PASSWORD: 'admin/forgot-password',
    RESET_PASSWORD: 'admin/reset-password/:token',
  },
  ERROR: {
    NOT_FOUND: '*',
    FORBIDDEN: 'forbidden',
  },
  JOB_SEEKER: {
    HOME: '',
    JOBS: 'jobs',
    JOB_DETAIL: 'jobs/:slug',
    COMPANY: 'companies',
    COMPANY_DETAIL: 'companies/:slug',
    ABOUT_US: 'about-us',
    CV_TEMPLATES: 'cv-templates',
    CV_BUILDER: 'cv-builder',
    JOBS_BY_CAREER: 'jobs-by-career',
    JOBS_BY_CITY: 'jobs-by-city',
    JOBS_BY_TYPE: 'jobs-by-type',
    NEWS: 'blog',
    NEWS_DETAIL: 'blog/:slug',
    DASHBOARD: 'dashboard',
    PROFILE: 'profile',
    STEP_PROFILE: 'online-profile/:slug',
    ATTACHED_PROFILE: 'attached-profile/:slug',
    MY_JOB: 'my-jobs',
    MY_CVS: 'my-cvs',
    PUBLIC_CV: 'cv/:slug',
    MY_COMPANY: 'my-company',
    MY_INTERVIEWS: 'my-interviews',
    NOTIFICATION: 'notifications',
    ACCOUNT: 'account',
    CHAT: 'chat',
    CONTACT: 'contact',
    FAQ: 'faq',
    TERMS_OF_SERVICE: 'terms-of-service',
    PRIVACY_POLICY: 'privacy-policy',
    TERMS_HTML: 'thoa-thuan-su-dung.html',
    PRIVACY_HTML: 'quy-dinh-bao-mat.html',
    CONSENT_HTML: 'tuan-thu-va-su-dong-y-cua-khach-hang.html',
    SITEMAP_HTML: 'so-do-trang-web.html',
  },
  EMPLOYER: {
    INTRODUCE: 'employer/introduce',
    SERVICE: 'employer/service',
    PRICING: 'employer/pricing',
    SUPPORT: 'employer/support',
    BLOG: 'employer/blog',
    BLOG_CREATE: 'employer/blog/create',
    BLOG_DETAIL: 'employer/blog/:id',
    DASHBOARD: 'employer/dashboard',
    AGENT_ASSISTANTS: 'employer/agent-assistants',
    JOB_POST: 'employer/job-posts',
    APPLIED_PROFILE: 'employer/applied-profiles',
    SAVED_PROFILE: 'employer/saved-profiles',
    PROFILE: 'employer/candidates',
    PROFILE_DETAIL: 'employer/candidates/:slug',
    COMPANY: 'employer/company',
    NOTIFICATION: 'employer/notifications',
    ACCOUNT: 'employer/account',
    SETTING: 'employer/settings',
    CHAT: 'employer/chat',
    INTERVIEW_LIST: 'employer/interviews',
    INTERVIEW_LIVE: 'employer/interviews/live',
    INTERVIEW_HISTORY: 'employer/interviews/history',
    INTERVIEW_SESSION: 'employer/interviews/session/:id',
    INTERVIEW_CREATE: 'employer/interviews/create',
    INTERVIEW_DETAIL: 'employer/interviews/:id',
    INTERVIEW_EDIT: 'employer/interviews/:id/edit',
    QUESTION_BANK: 'employer/question-bank',
    QUESTION_GROUPS: 'employer/question-groups',
    VERIFICATION: 'employer/verification',
    CONTACT: 'employer/contact',
    FAQ: 'employer/faq',
    TERMS_OF_SERVICE: 'employer/terms-of-service',
    PRIVACY_POLICY: 'employer/privacy-policy',
    TERMS_HTML: 'employer/thoa-thuan-su-dung.html',
    PRIVACY_HTML: 'employer/chinh-sach-bao-mat.html',
    WARRANTY_HTML: 'employer/chinh-sach-bao-hanh.html',
    POSTING_RULES_HTML: 'employer/quy-dinh-dang-tin.html',
    HRM: 'employer/hrm',
    HRM_DASHBOARD: 'employer/hrm/dashboard',
    HRM_EMPLOYEES: 'employer/hrm/employees',
    HRM_ONBOARDING: 'employer/hrm/onboarding',
    HRM_DEPARTMENTS: 'employer/hrm/departments',
    HRM_CONTRACTS: 'employer/hrm/contracts',
    HRM_LEAVES: 'employer/hrm/leaves',
    HRM_ORG_CHART: 'employer/hrm/org-chart',
  },
  JOBSEEKER_INTERVIEW: {
    LOGIN: 'interview/login',
    INTERVIEW: 'interview/:id',
    INTERVIEW_ROOM: 'interview/:id',
  },
  // CANDIDATE is an alias for JOBSEEKER_INTERVIEW (backward compatibility)
  CANDIDATE: {
    LOGIN: 'interview/login',
    INTERVIEW: 'interview/:id',
    INTERVIEW_ROOM: 'interview/:id',
  },
  ADMIN: {
    DASHBOARD: 'admin/dashboard',
    HRM: 'admin/hrm',
    HRM_DASHBOARD: 'admin/hrm/dashboard',
    HRM_EMPLOYEES: 'admin/hrm/employees',
    HRM_ONBOARDING: 'admin/hrm/onboarding',
    HRM_DEPARTMENTS: 'admin/hrm/departments',
    HRM_CONTRACTS: 'admin/hrm/contracts',
    HRM_LEAVES: 'admin/hrm/leaves',
    HRM_ORG_CHART: 'admin/hrm/org-chart',
    AGENT_ASSISTANTS: 'admin/agent-assistants',
    USERS: 'admin/users',
    JOBS: 'admin/jobs',
    QUESTIONS: 'admin/questions',
    QUESTION_GROUPS: 'admin/question-groups',
    INTERVIEWS: 'admin/interviews',
    VOICE_PROFILES: 'admin/voice-profiles',
    SETTINGS: 'admin/settings',
    CAREERS: 'admin/careers',
    CITIES: 'admin/cities',
    DISTRICTS: 'admin/districts',
    WARDS: 'admin/wards',
    COMPANIES: 'admin/companies',
    PROFILES: 'admin/profiles',
    RESUMES: 'admin/resumes',
    JOB_ACTIVITY: 'admin/job-activity',
    JOB_NOTIFICATIONS: 'admin/job-notifications',
    COMPANY_VERIFICATIONS: 'admin/company-verifications',
    TRUST_REPORTS: 'admin/trust-reports',
    AUDIT_LOGS: 'admin/audit-logs',
    BANNERS: 'admin/banners',
    BANNER_TYPES: 'admin/banner-types',
    FEEDBACKS: 'admin/feedbacks',
    CONTACT_MESSAGES: 'admin/contact-messages',
    CHAT: 'admin/chat',
    ARTICLES: 'admin/articles',
    ARTICLE_CREATE: 'admin/articles/create',
    ARTICLE_DETAIL: 'admin/articles/:id',
    PROFILE_DETAIL: 'admin/profiles/:id',
    INTERVIEW_PREVIEW: 'admin/interview-preview',
    COMPONENTS: 'admin/components',
  },
} as const;

// ---------------------------------------------------------------------------
// 3. Rewrite rules - Generated from SEGMENT_MAP for next.config.mjs
// ---------------------------------------------------------------------------

type RewriteRule = { source: string; destination: string };

/**
 * Generate all Next.js rewrite rules from the segment map.
 * This replaces the 80+ hand-written rules in next.config.mjs.
 */
export function generateRewrites(): RewriteRule[] {
  const rules: RewriteRule[] = [];

  // ── Job Seeker (root level) ──
  const jobSeekerRewrites: [string, string, boolean?][] = [
    // Auth
    ['/dang-nhap', '/login'],
    ['/dang-ky', '/register'],
    ['/quen-mat-khau', '/forgot-password'],
    ['/xac-nhan-email', '/email-verification-required'],
    ['/cap-nhat-mat-khau/:path*', '/reset-password/:path*'],
    // Public pages
    ['/viec-lam', '/jobs'],
    ['/viec-lam/:slug', '/jobs/:slug'],
    ['/cong-ty', '/companies'],
    ['/cong-ty/:slug', '/companies/:slug'],
    ['/ve-chung-toi', '/about-us'],
    ['/danh-sach-mau-cv', '/cv-templates'],
    ['/mau-cv', '/cv-templates'],
    ['/tao-cv', '/cv-builder'],
    ['/tao-cv/:path*', '/cv-builder/:path*'],
    ['/viec-lam-theo-nganh-nghe', '/jobs-by-career'],
    ['/viec-lam-theo-tinh-thanh', '/jobs-by-city'],
    ['/viec-lam-theo-hinh-thuc-lam-viec', '/jobs-by-type'],
    // Private pages
    ['/bang-dieu-khien', '/dashboard'],
    ['/ho-so', '/profile'],
    ['/ho-so-tung-buoc/:slug', '/online-profile/:slug'],
    ['/ho-so-dinh-kem/:slug', '/attached-profile/:slug'],
    ['/viec-lam-cua-toi', '/my-jobs'],
    ['/cong-ty-cua-toi', '/my-company'],
    ['/phong-van-cua-toi', '/my-interviews'],
    ['/thong-bao', '/notifications'],
    ['/tai-khoan', '/account'],
    ['/ket-noi-voi-nha-tuyen-dung', '/chat'],
    ['/tin-tuc', '/blog'],
    ['/tin-tuc/:slug', '/blog/:slug'],
    ['/lien-he', '/contact'],
    ['/cau-hoi-thuong-gap', '/faq'],
    ['/dieu-khoan-dich-vu', '/terms-of-service'],
    ['/chinh-sach-bao-mat', '/privacy-policy'],
    ['/thoa-thuan-su-dung.html', '/legal/thoa-thuan-su-dung'],
    ['/dieu-khoan-su-dung.html', '/legal/thoa-thuan-su-dung'],
    ['/quy-dinh-bao-mat.html', '/legal/quy-dinh-bao-mat'],
    ['/chinh-sach-bao-mat.html', '/legal/quy-dinh-bao-mat'],
    ['/tuan-thu-va-su-dong-y-cua-khach-hang.html', '/legal/tuan-thu-va-su-dong-y-cua-khach-hang'],
    ['/so-do-trang-web.html', '/legal/so-do-trang-web'],
    ['/chinh-sach-bao-hanh.html', '/legal/chinh-sach-bao-hanh'],
    ['/quy-dinh-dang-tin.html', '/legal/quy-dinh-dang-tin'],
    ['/:slug.html', '/legal/:slug'],
  ];

  // ── Employer (/nha-tuyen-dung → /employer) ──
  const employerRewrites: [string, string][] = [
    ['/nha-tuyen-dung/thoa-thuan-su-dung.html', '/employer/legal/thoa-thuan-su-dung'],
    ['/nha-tuyen-dung/chinh-sach-bao-mat.html', '/employer/legal/quy-dinh-bao-mat'],
    ['/nha-tuyen-dung/chinh-sach-bao-hanh.html', '/employer/legal/chinh-sach-bao-hanh'],
    ['/nha-tuyen-dung/quy-dinh-dang-tin.html', '/employer/legal/quy-dinh-dang-tin'],
    ['/employer/:slug.html', '/employer/legal/:slug'],
    ['/nha-tuyen-dung/:slug.html', '/employer/legal/:slug'],
    ['/nha-tuyen-dung/login', '/employer/login'],
    ['/nha-tuyen-dung/register', '/employer/register'],
    ['/nha-tuyen-dung/forgot-password', '/employer/forgot-password'],
    ['/nha-tuyen-dung/reset-password/:path*', '/employer/reset-password/:path*'],
    ['/nha-tuyen-dung/gioi-thieu', '/employer/introduce'],
    ['/nha-tuyen-dung/dich-vu', '/employer/service'],
    ['/nha-tuyen-dung/bao-gia', '/employer/pricing'],
    ['/nha-tuyen-dung/ho-tro', '/employer/support'],
    ['/nha-tuyen-dung/blog-tuyen-dung', '/employer/blog'],
    ['/nha-tuyen-dung', '/employer/dashboard'],
    ['/nha-tuyen-dung/bang-dieu-khien', '/employer/dashboard'],
    ['/nha-tuyen-dung/tro-ly-agent', '/employer/agent-assistants'],
    ['/nha-tuyen-dung/tin-tuyen-dung', '/employer/job-posts'],
    ['/nha-tuyen-dung/ho-so-ung-tuyen', '/employer/applied-profiles'],
    ['/nha-tuyen-dung/ho-so-da-luu', '/employer/saved-profiles'],
    ['/nha-tuyen-dung/danh-sach-ung-vien', '/employer/candidates'],
    ['/nha-tuyen-dung/danh-sach-ung-vien/:slug', '/employer/candidates/:slug'],
    ['/nha-tuyen-dung/chi-tiet-ung-vien/:slug', '/employer/candidates/:slug'],
    ['/nha-tuyen-dung/cong-ty', '/employer/company'],
    ['/nha-tuyen-dung/thong-bao', '/employer/notifications'],
    ['/nha-tuyen-dung/tai-khoan', '/employer/account'],
    ['/nha-tuyen-dung/cai-dat', '/employer/settings'],
    ['/nha-tuyen-dung/ket-noi-voi-ung-vien', '/employer/chat'],
    ['/nha-tuyen-dung/danh-sach-phong-van', '/employer/interviews'],
    ['/nha-tuyen-dung/danh-sach-phong-van/:id', '/employer/interviews/:id'],
    ['/nha-tuyen-dung/danh-sach-phong-van/:id/edit', '/employer/interviews/:id/edit'],
    ['/nha-tuyen-dung/thu-vien-video-phong-van', '/employer/interviews/history'],
    ['/nha-tuyen-dung/ngan-hang-cau-hoi', '/employer/question-bank'],
    ['/nha-tuyen-dung/xac-thuc-nha-tuyen-dung', '/employer/verification'],
    ['/nha-tuyen-dung/hrm', '/employer/hrm/dashboard'],
    ['/nha-tuyen-dung/hrm/dashboard', '/employer/hrm/dashboard'],
    ['/nha-tuyen-dung/hrm/bang-dieu-khien', '/employer/hrm/dashboard'],
    ['/nha-tuyen-dung/hrm/employees', '/employer/hrm/employees'],
    ['/nha-tuyen-dung/hrm/ho-so-nhan-vien', '/employer/hrm/employees'],
    ['/nha-tuyen-dung/hrm/onboarding', '/employer/hrm/onboarding'],
    ['/nha-tuyen-dung/hrm/tiep-nhan', '/employer/hrm/onboarding'],
    ['/nha-tuyen-dung/hrm/departments', '/employer/hrm/departments'],
    ['/nha-tuyen-dung/hrm/phong-ban', '/employer/hrm/departments'],
    ['/nha-tuyen-dung/hrm/contracts', '/employer/hrm/contracts'],
    ['/nha-tuyen-dung/hrm/hop-dong', '/employer/hrm/contracts'],
    ['/nha-tuyen-dung/hrm/leaves', '/employer/hrm/leaves'],
    ['/nha-tuyen-dung/hrm/nghi-phep', '/employer/hrm/leaves'],
    ['/nha-tuyen-dung/hrm/org-chart', '/employer/hrm/org-chart'],
    ['/nha-tuyen-dung/hrm/so-do-to-chuc', '/employer/hrm/org-chart'],
    ['/nha-tuyen-dung/phong-van-ung-vien-truc-tiep', '/employer/interviews/live'],
    ['/nha-tuyen-dung/phong-van-truc-tiep/:id', '/employer/interviews/:id'],
    ['/nha-tuyen-dung/len-lich-phong-van', '/employer/interviews/create'],
    ['/nha-tuyen-dung/chi-tiet-phong-van/:id', '/employer/interviews/:id'],
    ['/nha-tuyen-dung/sua-lich-phong-van/:id', '/employer/interviews/:id/edit'],
    ['/nha-tuyen-dung/lien-he', '/employer/contact'],
    ['/nha-tuyen-dung/cau-hoi-thuong-gap', '/employer/faq'],
    ['/nha-tuyen-dung/dieu-khoan-dich-vu', '/employer/terms-of-service'],
    ['/nha-tuyen-dung/chinh-sach-bao-mat', '/employer/privacy-policy'],
    // Catch-all for employer (must be last)
    ['/nha-tuyen-dung/:path*', '/employer/:path*'],
  ];

  // ── Admin (/quan-tri → /admin) ──
  const adminRewrites: [string, string][] = [
    ['/admin/bang-dieu-khien', '/admin/dashboard'],
    ['/quan-tri/bang-dieu-khien', '/admin/dashboard'],
    ['/quan-tri/tro-ly-agent', '/admin/agent-assistants'],
    ['/quan-tri/tro-ly-agent-quan-tri', '/admin/agent-assistants'],
    ['/quan-tri/quan-ly-nguoi-dung', '/admin/users'],
    ['/quan-tri/quan-ly-tin-tuyen-dung', '/admin/jobs'],
    ['/quan-tri/kho-cau-hoi', '/admin/questions'],
    ['/quan-tri/quan-ly-bo-cau-hoi', '/admin/question-groups'],
    ['/quan-tri/quan-ly-phong-van', '/admin/interviews'],
    ['/quan-tri/quan-ly-giong-noi-ai', '/admin/voice-profiles'],
    ['/quan-tri/cai-dat-he-thong', '/admin/settings'],
    ['/quan-tri/quan-ly-nganh-nghe', '/admin/careers'],
    ['/quan-tri/quan-ly-tinh-thanh', '/admin/cities'],
    ['/quan-tri/quan-ly-quan-huyen', '/admin/districts'],
    ['/quan-tri/quan-ly-phuong-xa', '/admin/wards'],
    ['/quan-tri/quan-ly-cong-ty', '/admin/companies'],
    ['/quan-tri/quan-ly-ho-so-ung-vien', '/admin/profiles'],
    ['/quan-tri/quan-ly-ho-so-ung-vien/:id', '/admin/profiles/:id'],
    ['/quan-tri/ho-so/:id', '/admin/profiles/:id'],
    ['/quan-tri/ho-so-ung-vien/:id', '/admin/profiles/:id'],
    ['/quan-tri/profiles/:id', '/admin/profiles/:id'],
    ['/quan-tri/:id(\\d+)', '/admin/profiles/:id'],
    ['/admin/:id(\\d+)', '/admin/profiles/:id'],
    ['/quan-tri/quan-tri/quan-ly-ho-so-ung-vien', '/admin/profiles'],
    ['/quan-tri/quan-tri/quan-ly-ho-so-ung-vien/:id', '/admin/profiles/:id'],
    ['/profiles/:id', '/admin/profiles/:id'],
    ['/quan-tri/quan-ly-cv-resume', '/admin/resumes'],
    ['/quan-tri/nhat-ky-tin-tuyen-dung', '/admin/job-activity'],
    ['/quan-tri/thong-bao-viec-lam', '/admin/job-notifications'],
    ['/quan-tri/quan-ly-banner', '/admin/banners'],
    ['/quan-tri/quan-ly-loai-banner', '/admin/banner-types'],
    ['/quan-tri/quan-ly-danh-gia', '/admin/feedbacks'],
    ['/quan-tri/tin-tuc-blog', '/admin/articles'],
    ['/quan-tri/tin-tuc-blog/tao-moi', '/admin/articles/create'],
    ['/quan-tri/tin-tuc-blog/:id', '/admin/articles/:id'],
    ['/quan-tri/ket-noi-voi-nha-tuyen-dung', '/admin/chat'],
    ['/quan-tri/xem-truoc-giao-dien-phong-van', '/admin/interview-preview'],
    ['/quan-tri/xac-thuc-cong-ty', '/admin/company-verifications'],
    ['/quan-tri/bao-cao-tin-cay', '/admin/trust-reports'],
    ['/quan-tri/nhat-ky-he-thong', '/admin/audit-logs'],
    ['/quan-tri/hrm', '/admin/hrm/dashboard'],
    ['/quan-tri/hrm/dashboard', '/admin/hrm/dashboard'],
    ['/quan-tri/hrm/bang-dieu-khien', '/admin/hrm/dashboard'],
    ['/quan-tri/hrm/employees', '/admin/hrm/employees'],
    ['/quan-tri/hrm/ho-so-nhan-vien', '/admin/hrm/employees'],
    ['/quan-tri/hrm/onboarding', '/admin/hrm/onboarding'],
    ['/quan-tri/hrm/tiep-nhan', '/admin/hrm/onboarding'],
    ['/quan-tri/hrm/departments', '/admin/hrm/departments'],
    ['/quan-tri/hrm/phong-ban', '/admin/hrm/departments'],
    ['/quan-tri/hrm/contracts', '/admin/hrm/contracts'],
    ['/quan-tri/hrm/hop-dong', '/admin/hrm/contracts'],
    ['/quan-tri/hrm/leaves', '/admin/hrm/leaves'],
    ['/quan-tri/hrm/nghi-phep', '/admin/hrm/leaves'],
    ['/quan-tri/hrm/org-chart', '/admin/hrm/org-chart'],
    ['/quan-tri/hrm/so-do-to-chuc', '/admin/hrm/org-chart'],
    // Catch-all for admin
    ['/quan-tri', '/admin/dashboard'],
    ['/quan-tri/:path*', '/admin/:path*'],
  ];

  // ── Candidate interview ──
  const interviewRewrites: [string, string][] = [
    ['/phong-van/room/:id', '/interview/:id'],
    ['/phong-van/:path*', '/interview/:path*'],
  ];

  // Build the rules array
  for (const [source, destination] of jobSeekerRewrites) {
    rules.push({ source, destination });
  }
  for (const [source, destination] of employerRewrites) {
    rules.push({ source, destination });
  }
  for (const [source, destination] of adminRewrites) {
    rules.push({ source, destination });
  }
  for (const [source, destination] of interviewRewrites) {
    rules.push({ source, destination });
  }

  return rules;
}

/**
 * Generate Next.js redirect rules.
 */
export function generateRedirects(): (RewriteRule & { permanent: boolean })[] {
  return [
    { source: '/admin/bang-dieu-khien', destination: '/admin/dashboard', permanent: false },
    { source: '/quan-tri/dashboard', destination: '/quan-tri/bang-dieu-khien', permanent: false },
    { source: '/employer/bang-dieu-khien', destination: '/employer/dashboard', permanent: false },
    { source: '/nha-tuyen-dung/dashboard', destination: '/nha-tuyen-dung/bang-dieu-khien', permanent: false },
  ];
}
