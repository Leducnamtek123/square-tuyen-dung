import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isEmployerHostname, isAdminHostname } from '@/configs/portalRouting';

/**
 * Route mapping for Employer portal on employer domain (employer.infohr.vn / employer.localhost / ntd.infohr.vn).
 * Rewrites incoming paths to their Next.js internal app router paths.
 */
const EMPLOYER_EXACT_MAP: Record<string, string> = {
  '/': '/employer',
  '/dang-nhap': '/employer/login',
  '/login': '/employer/login',
  '/dang-ky': '/employer/register',
  '/register': '/employer/register',
  '/quen-mat-khau': '/employer/forgot-password',
  '/forgot-password': '/employer/forgot-password',
  '/gioi-thieu': '/employer/introduce',
  '/introduce': '/employer/introduce',
  '/dich-vu': '/employer/pricing',
  '/service': '/employer/pricing',
  '/bao-gia': '/employer/pricing',
  '/pricing': '/employer/pricing',
  '/ho-tro': '/employer/support',
  '/support': '/employer/support',
  '/lien-he': '/employer/contact',
  '/contact': '/employer/contact',
  '/cau-hoi-thuong-gap': '/employer/faq',
  '/faq': '/employer/faq',
  '/bang-dieu-khien': '/employer/dashboard',
  '/dashboard': '/employer/dashboard',
  '/tro-ly-agent': '/employer/agent-assistants',
  '/agent-assistants': '/employer/agent-assistants',
  '/tin-tuyen-dung': '/employer/job-posts',
  '/job-posts': '/employer/job-posts',
  '/ho-so-ung-tuyen': '/employer/applied-profiles',
  '/applied-profiles': '/employer/applied-profiles',
  '/ho-so-da-luu': '/employer/saved-profiles',
  '/saved-profiles': '/employer/saved-profiles',
  '/danh-sach-ung-vien': '/employer/candidates',
  '/tim-ung-vien': '/employer/candidates',
  '/candidates': '/employer/candidates',
  '/resumes': '/employer/candidates',
  '/cong-ty': '/employer/company',
  '/company': '/employer/company',
  '/thong-bao': '/employer/notifications',
  '/notifications': '/employer/notifications',
  '/tai-khoan': '/employer/account',
  '/account': '/employer/account',
  '/cai-dat': '/employer/settings',
  '/settings': '/employer/settings',
  '/ket-noi-voi-ung-vien': '/employer/chat',
  '/chat': '/employer/chat',
  '/danh-sach-phong-van': '/employer/interviews',
  '/interviews': '/employer/interviews',
  '/ngan-hang-cau-hoi': '/employer/question-bank',
  '/question-bank': '/employer/question-bank',
  '/bo-cau-hoi': '/employer/question-groups',
  '/question-groups': '/employer/question-groups',
  '/cai-dat-ai': '/employer/ai-settings',
  '/ai-settings': '/employer/ai-settings',
  '/kich-ban-phong-van': '/employer/interview-scripts',
  '/interview-scripts': '/employer/interview-scripts',
  '/xac-thuc-nha-tuyen-dung': '/employer/verification',
  '/verification': '/employer/verification',
  '/dieu-khoan-dich-vu': '/employer/terms-of-service',
  '/terms-of-service': '/employer/terms-of-service',
  '/terms-and-conditions': '/employer/terms-of-service',
  '/chinh-sach-bao-mat': '/employer/privacy-policy',
  '/privacy-policy': '/employer/privacy-policy',
  '/hrm': '/employer/hrm/dashboard',
  '/hrm/dashboard': '/employer/hrm/dashboard',
  '/hrm/bang-dieu-khien': '/employer/hrm/dashboard',
  '/hrm/employees': '/employer/hrm/employees',
  '/hrm/ho-so-nhan-vien': '/employer/hrm/employees',
  '/hrm/onboarding': '/employer/hrm/onboarding',
  '/hrm/tiep-nhan': '/employer/hrm/onboarding',
  '/hrm/departments': '/employer/hrm/departments',
  '/hrm/phong-ban': '/employer/hrm/departments',
  '/hrm/contracts': '/employer/hrm/contracts',
  '/hrm/hop-dong': '/employer/hrm/contracts',
  '/hrm/leaves': '/employer/hrm/leaves',
  '/hrm/nghi-phep': '/employer/hrm/leaves',
  '/hrm/attendances': '/employer/hrm/attendances',
  '/hrm/cham-cong': '/employer/hrm/attendances',
  '/hrm/attendances/timesheets': '/employer/hrm/attendances/timesheets',
  '/hrm/cham-cong/chi-tiet': '/employer/hrm/attendances/timesheets',
  '/hrm/attendances/monthly-summary': '/employer/hrm/attendances/monthly-summary',
  '/hrm/cham-cong/tong-hop': '/employer/hrm/attendances/monthly-summary',
  '/hrm/attendances/shifts': '/employer/hrm/attendances/shifts',
  '/hrm/ca-lam-viec': '/employer/hrm/attendances/shifts',
  '/hrm/attendances/shift-assignments': '/employer/hrm/attendances/shift-assignments',
  '/hrm/phan-ca': '/employer/hrm/attendances/shift-assignments',
  '/hrm/attendances/requests': '/employer/hrm/attendances/requests',
  '/hrm/quan-ly-don': '/employer/hrm/attendances/requests',
  '/hrm/attendances/biometric-logs': '/employer/hrm/attendances/biometric-logs',
  '/hrm/may-cham-cong': '/employer/hrm/attendances/biometric-logs',
  '/hrm/payroll': '/employer/hrm/payroll',
  '/hrm/bang-luong': '/employer/hrm/payroll',
  '/hrm/org-chart': '/employer/hrm/org-chart',
  '/hrm/so-do-to-chuc': '/employer/hrm/org-chart',
  '/blog': '/employer/blog',
  '/blog-tuyen-dung': '/employer/blog',
  '/tin-tuyen-dung/tao-moi': '/employer/job-posts/create',
  '/tin-tuyen-dung/create': '/employer/job-posts/create',
  '/job-posts/create': '/employer/job-posts/create',
  '/job-posts/tao-moi': '/employer/job-posts/create',
  '/blog-tuyen-dung/tao-moi': '/employer/blog/create',
  '/blog-tuyen-dung/create': '/employer/blog/create',
  '/blog/create': '/employer/blog/create',
  '/blog/tao-moi': '/employer/blog/create',
  '/danh-sach-phong-van/tao-moi': '/employer/interviews/create',
  '/danh-sach-phong-van/create': '/employer/interviews/create',
  '/interviews/create': '/employer/interviews/create',
  '/interviews/tao-moi': '/employer/interviews/create',
  '/hrm/attendances/reports': '/employer/hrm/attendances/reports',
  '/hrm/cham-cong/bao-cao': '/employer/hrm/attendances/reports',
  '/hrm/attendances/settings': '/employer/hrm/attendances/settings',
  '/hrm/cham-cong/thiet-lap': '/employer/hrm/attendances/settings',
  '/hrm/attendances/devices': '/employer/hrm/attendances/devices',
  '/hrm/cham-cong/thiet-bi': '/employer/hrm/attendances/devices',
  '/hrm/reports': '/employer/hrm/attendances/reports',
  '/hrm/bao-cao': '/employer/hrm/attendances/reports',
  '/hrm/settings': '/employer/hrm/attendances/settings',
  '/hrm/thiet-lap': '/employer/hrm/attendances/settings',
  '/hrm/devices': '/employer/hrm/attendances/devices',
  '/hrm/thiet-bi': '/employer/hrm/attendances/devices',
  '/phong-van-ung-vien-truc-tiep': '/employer/interviews/live',
  '/thu-vien-video-phong-van': '/employer/interviews/history',
  '/len-lich-phong-van': '/employer/interviews/create',
  '/thoa-thuan-su-dung.html': '/employer/legal/thoa-thuan-su-dung',
  '/chinh-sach-bao-mat.html': '/employer/legal/chinh-sach-bao-mat',
  '/chinh-sach-bao-hanh.html': '/employer/legal/chinh-sach-bao-hanh',
  '/quy-dinh-dang-tin.html': '/employer/legal/quy-dinh-dang-tin',
};

const EMPLOYER_PREFIX_MAP: Array<{ prefix: string; target: string }> = [
  { prefix: '/tin-tuyen-dung', target: '/employer/job-posts' },
  { prefix: '/job-posts', target: '/employer/job-posts' },
  { prefix: '/danh-sach-ung-vien', target: '/employer/candidates' },
  { prefix: '/tim-ung-vien', target: '/employer/candidates' },
  { prefix: '/chi-tiet-ung-vien', target: '/employer/candidates' },
  { prefix: '/candidates', target: '/employer/candidates' },
  { prefix: '/resumes', target: '/employer/candidates' },
  { prefix: '/danh-sach-phong-van', target: '/employer/interviews' },
  { prefix: '/interviews', target: '/employer/interviews' },
  { prefix: '/kich-ban-phong-van', target: '/employer/interview-scripts' },
  { prefix: '/interview-scripts', target: '/employer/interview-scripts' },
  { prefix: '/cai-dat-ai', target: '/employer/ai-settings' },
  { prefix: '/ai-settings', target: '/employer/ai-settings' },
  { prefix: '/cap-nhat-mat-khau', target: '/employer/reset-password' },
  { prefix: '/reset-password', target: '/employer/reset-password' },
  { prefix: '/hrm', target: '/employer/hrm' },
  { prefix: '/blog', target: '/employer/blog' },
  { prefix: '/blog-tuyen-dung', target: '/employer/blog' },
];

/**
 * Route mapping for Admin portal on admin domain (admin.infohr.vn / admin.localhost).
 */
const ADMIN_EXACT_MAP: Record<string, string> = {
  '/': '/admin/dashboard',
  '/login': '/admin/login',
  '/dang-nhap': '/admin/login',
  '/dashboard': '/admin/dashboard',
  '/bang-dieu-khien': '/admin/dashboard',
  '/cai-dat': '/admin/settings',
  '/cai-dat-he-thong': '/admin/settings',
  '/settings': '/admin/settings',
  '/users': '/admin/users',
  '/quan-ly-nguoi-dung': '/admin/users',
  '/jobs': '/admin/jobs',
  '/quan-ly-tin-tuyen-dung': '/admin/jobs',
  '/interviews': '/admin/interviews',
  '/quan-ly-phong-van': '/admin/interviews',
  '/companies': '/admin/companies',
  '/quan-ly-cong-ty': '/admin/companies',
  '/profiles': '/admin/profiles',
  '/quan-ly-ho-so-ung-vien': '/admin/profiles',
  '/resumes': '/admin/resumes',
  '/quan-ly-cv-resume': '/admin/resumes',
  '/forgot-password': '/admin/forgot-password',
  '/quen-mat-khau': '/admin/forgot-password',
  '/reset-password': '/admin/reset-password',
  '/cap-nhat-mat-khau': '/admin/reset-password',
  '/chat': '/admin/chat',
  '/ket-noi-voi-ung-vien': '/admin/chat',
  '/ket-noi-voi-nha-tuyen-dung': '/admin/chat',
  '/job-activity': '/admin/job-activity',
  '/nhat-ky-tin-tuyen-dung': '/admin/job-activity',
  '/audit-logs': '/admin/audit-logs',
  '/nhat-ky-he-thong': '/admin/audit-logs',
  '/company-verifications': '/admin/company-verifications',
  '/xac-thuc-cong-ty': '/admin/company-verifications',
  '/trust-reports': '/admin/trust-reports',
  '/bao-cao-tin-cay': '/admin/trust-reports',
  '/banner-types': '/admin/banner-types',
  '/quan-ly-loai-banner': '/admin/banner-types',
  '/banners': '/admin/banners',
  '/quan-ly-banner': '/admin/banners',
  '/feedbacks': '/admin/feedbacks',
  '/quan-ly-danh-gia': '/admin/feedbacks',
  '/contact-messages': '/admin/contact-messages',
  '/tin-nhan-lien-he': '/admin/contact-messages',
  '/articles': '/admin/articles',
  '/tin-tuc-blog': '/admin/articles',
  '/articles/create': '/admin/articles/create',
  '/tin-tuc-blog/tao-moi': '/admin/articles/create',
  '/agent-assistants': '/admin/agent-assistants',
  '/tro-ly-agent': '/admin/agent-assistants',
  '/tro-ly-agent-quan-tri': '/admin/agent-assistants',
  '/interview-preview': '/admin/interview-preview',
  '/xem-truoc-giao-dien-phong-van': '/admin/interview-preview',
  '/components': '/admin/components',
  '/component': '/admin/components',
  '/he-thong-giao-dien': '/admin/components',
  '/voice-profiles': '/admin/voice-profiles',
  '/quan-ly-giong-noi-ai': '/admin/voice-profiles',
  '/questions': '/admin/questions',
  '/kho-cau-hoi': '/admin/questions',
  '/question-groups': '/admin/question-groups',
  '/quan-ly-bo-cau-hoi': '/admin/question-groups',
  '/careers': '/admin/careers',
  '/quan-ly-nganh-nghe': '/admin/careers',
  '/cities': '/admin/cities',
  '/quan-ly-tinh-thanh': '/admin/cities',
  '/districts': '/admin/districts',
  '/quan-ly-quan-huyen': '/admin/districts',
  '/wards': '/admin/wards',
  '/quan-ly-phuong-xa': '/admin/wards',
  '/hrm': '/admin/hrm/dashboard',
  '/thong-bao-viec-lam': '/admin/job-notifications',
  '/job-notifications': '/admin/job-notifications',
};

const ADMIN_PREFIX_MAP: Array<{ prefix: string; target: string }> = [
  { prefix: '/tin-tuc-blog', target: '/admin/articles' },
  { prefix: '/articles', target: '/admin/articles' },
  { prefix: '/quan-ly-ho-so-ung-vien', target: '/admin/profiles' },
  { prefix: '/ho-so-ung-vien', target: '/admin/profiles' },
  { prefix: '/ho-so', target: '/admin/profiles' },
  { prefix: '/profiles', target: '/admin/profiles' },
  { prefix: '/cap-nhat-mat-khau', target: '/admin/reset-password' },
  { prefix: '/reset-password', target: '/admin/reset-password' },
  { prefix: '/nhat-ky-tin-tuyen-dung', target: '/admin/job-activity' },
  { prefix: '/job-activity', target: '/admin/job-activity' },
  { prefix: '/quan-ly-tin-tuyen-dung', target: '/admin/jobs' },
  { prefix: '/jobs', target: '/admin/jobs' },
  { prefix: '/quan-ly-nguoi-dung', target: '/admin/users' },
  { prefix: '/users', target: '/admin/users' },
  { prefix: '/quan-ly-cong-ty', target: '/admin/companies' },
  { prefix: '/companies', target: '/admin/companies' },
  { prefix: '/quan-ly-phong-van', target: '/admin/interviews' },
  { prefix: '/interviews', target: '/admin/interviews' },
];

const isCandidatePortalPath = (pathname: string): boolean => {
  return (
    pathname === '/luyen-phong-van' ||
    pathname.startsWith('/luyen-phong-van/') ||
    pathname === '/practice' ||
    pathname.startsWith('/practice/') ||
    pathname === '/phong-van-cua-toi' ||
    pathname.startsWith('/phong-van-cua-toi/') ||
    pathname === '/my-interviews' ||
    pathname.startsWith('/my-interviews/') ||
    pathname === '/ung-vien/phong-van-cua-toi' ||
    pathname.startsWith('/ung-vien/phong-van-cua-toi/') ||
    pathname === '/tao-cv' ||
    pathname.startsWith('/tao-cv/') ||
    pathname === '/cv-builder' ||
    pathname.startsWith('/cv-builder/') ||
    pathname === '/danh-sach-mau-cv' ||
    pathname.startsWith('/danh-sach-mau-cv/') ||
    pathname === '/mau-cv' ||
    pathname.startsWith('/mau-cv/') ||
    pathname === '/cv-templates' ||
    pathname.startsWith('/cv-templates/') ||
    pathname === '/trang-tri-cv' ||
    pathname.startsWith('/trang-tri-cv/') ||
    pathname === '/viec-lam' ||
    pathname.startsWith('/viec-lam/') ||
    pathname === '/viec-lam-cua-toi' ||
    pathname.startsWith('/viec-lam-cua-toi/') ||
    pathname === '/my-jobs' ||
    pathname.startsWith('/my-jobs/') ||
    pathname === '/cv-cua-toi' ||
    pathname.startsWith('/cv-cua-toi/') ||
    pathname === '/my-cvs' ||
    pathname.startsWith('/my-cvs/') ||
    pathname === '/jobs' ||
    pathname.startsWith('/jobs/') ||
    pathname === '/ho-so' ||
    pathname.startsWith('/ho-so/') ||
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/cv-da-luu' ||
    pathname.startsWith('/cv-da-luu/') ||
    pathname === '/tra-cuu-luong' ||
    pathname.startsWith('/tra-cuu-luong/') ||
    pathname === '/salary' ||
    pathname.startsWith('/salary/') ||
    pathname.startsWith('/ung-vien/')
  );
};

/**
 * Resolves a request path on the employer domain to its internal Next.js App Router path.
 * Handles exact routes, dynamic suffixes (chinh-sua/sua -> edit, tao-moi -> create),
 * and clean Vietnamese / English path combinations.
 */
export function resolveEmployerPath(targetPath: string): string {
  // 1. Exact match
  if (EMPLOYER_EXACT_MAP[targetPath]) {
    return EMPLOYER_EXACT_MAP[targetPath];
  }

  // 2. Job Posts
  // Edit: /tin-tuyen-dung/:id/(chinh-sua|sua|edit) or /job-posts/:id/(chinh-sua|sua|edit)
  const jobEditMatch = targetPath.match(/^\/(?:tin-tuyen-dung|job-posts)\/([^/]+)\/(?:chinh-sua|sua|edit)$/);
  if (jobEditMatch) {
    return `/employer/job-posts/${jobEditMatch[1]}/edit`;
  }
  // Create: /tin-tuyen-dung/(tao-moi|create) or /job-posts/(tao-moi|create)
  if (/^\/(?:tin-tuyen-dung|job-posts)\/(?:tao-moi|create)$/.test(targetPath)) {
    return '/employer/job-posts/create';
  }
  // Detail: /tin-tuyen-dung/:id or /job-posts/:id
  const jobDetailMatch = targetPath.match(/^\/(?:tin-tuyen-dung|job-posts)\/([^/]+)$/);
  if (jobDetailMatch) {
    return `/employer/job-posts/${jobDetailMatch[1]}`;
  }

  // 3. Interviews
  // Edit: /danh-sach-phong-van/:id/(chinh-sua|sua|edit), /interviews/:id/(chinh-sua|sua|edit), /sua-lich-phong-van/:id
  const interviewEditMatch =
    targetPath.match(/^\/(?:danh-sach-phong-van|interviews)\/([^/]+)\/(?:chinh-sua|sua|edit)$/) ||
    targetPath.match(/^\/sua-lich-phong-van\/([^/]+)$/);
  if (interviewEditMatch) {
    return `/employer/interviews/${interviewEditMatch[1]}/edit`;
  }
  // Create: /danh-sach-phong-van/(tao-moi|create), /interviews/(tao-moi|create), /len-lich-phong-van
  if (
    /^\/(?:danh-sach-phong-van|interviews)\/(?:tao-moi|create)$/.test(targetPath) ||
    targetPath === '/len-lich-phong-van'
  ) {
    return '/employer/interviews/create';
  }
  // Session: /danh-sach-phong-van/session/:id, /interviews/session/:id
  const interviewSessionMatch = targetPath.match(/^\/(?:danh-sach-phong-van|interviews)\/session\/([^/]+)$/);
  if (interviewSessionMatch) {
    return `/employer/interviews/session/${interviewSessionMatch[1]}`;
  }
  // Detail: /danh-sach-phong-van/:id, /interviews/:id, /chi-tiet-phong-van/:id, /phong-van-truc-tiep/:id
  const interviewDetailMatch =
    targetPath.match(/^\/(?:danh-sach-phong-van|interviews)\/([^/]+)$/) ||
    targetPath.match(/^\/(?:chi-tiet-phong-van|phong-van-truc-tiep)\/([^/]+)$/);
  if (interviewDetailMatch) {
    return `/employer/interviews/${interviewDetailMatch[1]}`;
  }

  // 4. Candidates / Resumes
  const candidateMatch = targetPath.match(
    /^\/(?:danh-sach-ung-vien|tim-ung-vien|chi-tiet-ung-vien|candidates|resumes)\/([^/]+)$/
  );
  if (candidateMatch) {
    return `/employer/candidates/${candidateMatch[1]}`;
  }

  // 5. Blog
  if (/^\/(?:blog-tuyen-dung|blog)\/(?:tao-moi|create)$/.test(targetPath)) {
    return '/employer/blog/create';
  }
  const blogDetailMatch = targetPath.match(
    /^\/(?:blog-tuyen-dung|blog)\/([^/]+)(?:\/(?:chinh-sua|sua|edit))?$/
  );
  if (blogDetailMatch) {
    return `/employer/blog/${blogDetailMatch[1]}`;
  }

  // 6. Reset password
  const resetMatch = targetPath.match(/^\/(?:cap-nhat-mat-khau|reset-password)\/([^/]+)$/);
  if (resetMatch) {
    return `/employer/reset-password/${resetMatch[1]}`;
  }

  // 7. HRM sub-routes
  if (targetPath.startsWith('/hrm/')) {
    const sub = targetPath.slice('/hrm/'.length);
    if (
      sub === 'cham-cong/bao-cao' ||
      sub === 'bao-cao' ||
      sub === 'bao-cao-cham-cong' ||
      sub === 'attendances/reports' ||
      sub === 'reports'
    ) {
      return '/employer/hrm/attendances/reports';
    }
    if (
      sub === 'cham-cong/thiet-lap' ||
      sub === 'thiet-lap' ||
      sub === 'thiet-lap-cham-cong' ||
      sub === 'attendances/settings' ||
      sub === 'settings'
    ) {
      return '/employer/hrm/attendances/settings';
    }
    if (
      sub === 'cham-cong/thiet-bi' ||
      sub === 'thiet-bi' ||
      sub === 'thiet-bi-cham-cong' ||
      sub === 'attendances/devices' ||
      sub === 'devices'
    ) {
      return '/employer/hrm/attendances/devices';
    }
    if (sub === 'cham-cong/chi-tiet' || sub === 'attendances/timesheets' || sub === 'timesheets') {
      return '/employer/hrm/attendances/timesheets';
    }
    if (sub === 'cham-cong/tong-hop' || sub === 'attendances/monthly-summary' || sub === 'monthly-summary') {
      return '/employer/hrm/attendances/monthly-summary';
    }
    if (sub === 'ca-lam-viec' || sub === 'attendances/shifts' || sub === 'shifts') {
      return '/employer/hrm/attendances/shifts';
    }
    if (sub === 'phan-ca' || sub === 'attendances/shift-assignments' || sub === 'shift-assignments') {
      return '/employer/hrm/attendances/shift-assignments';
    }
    if (sub === 'quan-ly-don' || sub === 'attendances/requests' || sub === 'requests') {
      return '/employer/hrm/attendances/requests';
    }
    if (sub === 'may-cham-cong' || sub === 'attendances/biometric-logs' || sub === 'biometric-logs') {
      return '/employer/hrm/attendances/biometric-logs';
    }
    if (sub === 'cham-cong' || sub === 'attendances') {
      return '/employer/hrm/attendances';
    }
    if (sub === 'employees' || sub === 'ho-so-nhan-vien' || sub === 'nhan-su-va-vai-tro') {
      return '/employer/hrm/employees';
    }
    if (sub === 'onboarding' || sub === 'tiep-nhan') {
      return '/employer/hrm/onboarding';
    }
    if (sub === 'departments' || sub === 'phong-ban') {
      return '/employer/hrm/departments';
    }
    if (sub === 'contracts' || sub === 'hop-dong') {
      return '/employer/hrm/contracts';
    }
    if (sub === 'leaves' || sub === 'nghi-phep') {
      return '/employer/hrm/leaves';
    }
    if (sub === 'payroll' || sub === 'bang-luong') {
      return '/employer/hrm/payroll';
    }
    if (sub === 'org-chart' || sub === 'so-do-to-chuc') {
      return '/employer/hrm/org-chart';
    }
    if (sub === 'dashboard' || sub === 'bang-dieu-khien') {
      return '/employer/hrm/dashboard';
    }
    return `/employer/hrm/${sub}`;
  }

  // 8. General prefix map fallback
  for (const mapping of EMPLOYER_PREFIX_MAP) {
    if (targetPath.startsWith(`${mapping.prefix}/`)) {
      let remainder = targetPath.slice(mapping.prefix.length);
      remainder = remainder.replace(/\/(?:chinh-sua|sua)$/, '/edit');
      remainder = remainder.replace(/\/tao-moi$/, '/create');
      return `${mapping.target}${remainder}`;
    }
  }

  // 9. Generic edit/create fallback
  let normalized = targetPath;
  normalized = normalized.replace(/\/(?:chinh-sua|sua)$/, '/edit');
  normalized = normalized.replace(/\/tao-moi$/, '/create');

  return `/employer${normalized}`;
}

/**
 * Resolves a request path on the admin domain to its internal Next.js App Router path.
 */
export function resolveAdminPath(targetPath: string): string {
  // 1. Numeric profile ID direct route (e.g. /123 -> /admin/profiles/123)
  if (/^\/\d+$/.test(targetPath)) {
    return `/admin/profiles${targetPath}`;
  }

  // 2. Exact match in table
  if (ADMIN_EXACT_MAP[targetPath]) {
    return ADMIN_EXACT_MAP[targetPath];
  }

  // 3. Articles (tin-tuc-blog)
  if (/^\/(?:tin-tuc-blog|articles)\/(?:tao-moi|create)$/.test(targetPath)) {
    return '/admin/articles/create';
  }
  const articleMatch = targetPath.match(
    /^\/(?:tin-tuc-blog|articles)\/([^/]+)(?:\/(?:chinh-sua|sua|edit))?$/
  );
  if (articleMatch) {
    return `/admin/articles/${articleMatch[1]}`;
  }

  // 4. Profiles
  const profileMatch = targetPath.match(
    /^\/(?:quan-ly-ho-so-ung-vien|ho-so-ung-vien|ho-so|profiles)\/([^/]+)$/
  );
  if (profileMatch) {
    return `/admin/profiles/${profileMatch[1]}`;
  }

  // 5. Reset password
  const resetMatch = targetPath.match(/^\/(?:cap-nhat-mat-khau|reset-password)\/([^/]+)$/);
  if (resetMatch) {
    return `/admin/reset-password/${resetMatch[1]}`;
  }

  // 6. Prefix mapping fallback
  for (const mapping of ADMIN_PREFIX_MAP) {
    if (targetPath.startsWith(`${mapping.prefix}/`)) {
      let remainder = targetPath.slice(mapping.prefix.length);
      remainder = remainder.replace(/\/(?:chinh-sua|sua|edit)$/, '');
      remainder = remainder.replace(/\/tao-moi$/, '/create');
      return `${mapping.target}${remainder}`;
    }
  }

  // 7. Generic fallback
  return `/admin${targetPath}`;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();

  // Passthrough static manifest and common public assets
  if (
    pathname === '/site.webmanifest' ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/downloads/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/media/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/infohr-icons/') ||
    pathname.startsWith('/square-icons/')
  ) {
    return NextResponse.next();
  }

  // ── Canonical Domain Redirection: employer.infohr.vn -> ntd.infohr.vn ──
  if (hostname === 'employer.infohr.vn' || hostname === 'www.employer.infohr.vn') {
    const targetQuery = search ? (search.startsWith('?') ? search : `?${search}`) : '';
    return NextResponse.redirect(`https://ntd.infohr.vn${pathname}${targetQuery}`, 301);
  }

  // ── 1. Employer Subdomain (ntd.infohr.vn / ntd.localhost) ──
  if (isEmployerHostname(hostname)) {
    // Keep onboarding routes directed to app/onboarding
    if (pathname === '/onboarding') {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding/employer';
      return NextResponse.rewrite(url);
    }
    if (pathname.startsWith('/onboarding/')) {
      return NextResponse.next();
    }

    // Keep candidate interview room intact if accessed
    if (pathname.startsWith('/interview/')) {
      return NextResponse.next();
    }

    // Clean URL: Redirect any /employer or /nha-tuyen-dung prefix on employer subdomain to clean root path
    if (pathname === '/employer' || pathname === '/nha-tuyen-dung') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url, 301);
    }
    if (pathname.startsWith('/employer/')) {
      const stripped = pathname.slice('/employer'.length);
      const url = request.nextUrl.clone();
      url.pathname = stripped || '/';
      return NextResponse.redirect(url, 301);
    }
    if (pathname.startsWith('/nha-tuyen-dung/')) {
      const stripped = pathname.slice('/nha-tuyen-dung'.length);
      const url = request.nextUrl.clone();
      url.pathname = stripped || '/';
      return NextResponse.redirect(url, 301);
    }

    // ── Candidate Routes on Employer Subdomain: Redirect to Main Candidate Portal ──
    const isEmployerRoute =
      Boolean(EMPLOYER_EXACT_MAP[pathname]) ||
      EMPLOYER_PREFIX_MAP.some((mapping) => pathname === mapping.prefix || pathname.startsWith(`${mapping.prefix}/`));

    if (!isEmployerRoute && isCandidatePortalPath(pathname)) {
      const targetQuery = search ? (search.startsWith('?') ? search : `?${search}`) : '';
      if (hostname.endsWith('.localhost') || hostname === 'localhost') {
        const port = host.split(':')[1] ? `:${host.split(':')[1]}` : '';
        return NextResponse.redirect(new URL(`http://localhost${port}${pathname}${targetQuery}`), 302);
      }
      const mainHost = process.env.NEXT_PUBLIC_PROJECT_HOST_NAME || 'infohr.vn';
      return NextResponse.redirect(`https://${mainHost}${pathname}${targetQuery}`, 302);
    }

    let targetPath = pathname;

    // Handle .html legal pages: e.g. /quy-dinh-dang-tin.html -> /employer/legal/quy-dinh-dang-tin
    if (targetPath.endsWith('.html')) {
      const slug = targetPath.replace(/^\//, '').replace(/\.html$/, '');
      const url = request.nextUrl.clone();
      url.pathname = `/employer/legal/${slug}`;
      return NextResponse.rewrite(url);
    }

    const resolved = resolveEmployerPath(targetPath);
    const url = request.nextUrl.clone();
    url.pathname = resolved;
    return NextResponse.rewrite(url);
  }

  // ── 2. Admin Subdomain (admin.infohr.vn / admin.localhost) ──
  if (isAdminHostname(hostname)) {
    // Clean URL: Redirect any /admin or /quan-tri prefix on admin subdomain to clean root path
    if (pathname === '/admin' || pathname === '/quan-tri') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url, 301);
    }
    if (pathname.startsWith('/admin/')) {
      const stripped = pathname.slice('/admin'.length);
      const url = request.nextUrl.clone();
      url.pathname = stripped || '/';
      return NextResponse.redirect(url, 301);
    }
    if (pathname.startsWith('/quan-tri/')) {
      const stripped = pathname.slice('/quan-tri'.length);
      const url = request.nextUrl.clone();
      url.pathname = stripped || '/';
      return NextResponse.redirect(url, 301);
    }

    // ── Candidate Routes on Admin Subdomain: Redirect to Main Candidate Portal ──
    const isAdminRoute =
      Boolean(ADMIN_EXACT_MAP[pathname]) ||
      ADMIN_PREFIX_MAP.some((mapping) => pathname === mapping.prefix || pathname.startsWith(`${mapping.prefix}/`));

    if (!isAdminRoute && isCandidatePortalPath(pathname)) {
      const targetQuery = search ? (search.startsWith('?') ? search : `?${search}`) : '';
      if (hostname.endsWith('.localhost') || hostname === 'localhost') {
        const port = host.split(':')[1] ? `:${host.split(':')[1]}` : '';
        return NextResponse.redirect(new URL(`http://localhost${port}${pathname}${targetQuery}`), 302);
      }
      const mainHost = process.env.NEXT_PUBLIC_PROJECT_HOST_NAME || 'infohr.vn';
      return NextResponse.redirect(`https://${mainHost}${pathname}${targetQuery}`, 302);
    }

    let targetPath = pathname;

    const resolved = resolveAdminPath(targetPath);
    const url = request.nextUrl.clone();
    url.pathname = resolved;
    return NextResponse.rewrite(url);
  }

  // ── 3. Main Portal (infohr.vn / www.infohr.vn) ──
  // Redirect employer or admin paths to dedicated subdomains
  const isMainProdDomain = hostname === 'infohr.vn' || hostname === 'www.infohr.vn';
  if (isMainProdDomain) {
    const employerHost = process.env.NEXT_PUBLIC_EMPLOYER_PROJECT_HOST_NAME || 'ntd.infohr.vn';
    const targetQuery = search ? (search.startsWith('?') ? search : `?${search}`) : '';

    if (pathname === '/employer' || pathname === '/nha-tuyen-dung') {
      return NextResponse.redirect(`https://${employerHost}/${targetQuery}`, 302);
    }
    if (pathname.startsWith('/employer/')) {
      const sub = pathname.slice('/employer'.length);
      return NextResponse.redirect(`https://${employerHost}${sub}${targetQuery}`, 302);
    }
    if (pathname.startsWith('/nha-tuyen-dung/')) {
      const sub = pathname.slice('/nha-tuyen-dung'.length);
      return NextResponse.redirect(`https://${employerHost}${sub}${targetQuery}`, 302);
    }
    if (pathname === '/admin' || pathname === '/quan-tri') {
      return NextResponse.redirect(`https://admin.infohr.vn/${targetQuery}`, 302);
    }
    if (pathname.startsWith('/admin/')) {
      const sub = pathname.slice('/admin'.length);
      return NextResponse.redirect(`https://admin.infohr.vn${sub}${targetQuery}`, 302);
    }
    if (pathname.startsWith('/quan-tri/')) {
      const sub = pathname.slice('/quan-tri'.length);
      return NextResponse.redirect(`https://admin.infohr.vn${sub}${targetQuery}`, 302);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/...)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static file extensions (.png, .jpg, .svg, .ico, etc. BUT allow .html)
     */
    '/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|avif|css|js|map|woff|woff2|ttf|eot|webmanifest|json|txt|xml|mp4|webm|ogg|mp3|wav|pdf)).*)',
  ],
};

// Backward-compatible alias for existing tests and utilities
export { proxy as middleware };

