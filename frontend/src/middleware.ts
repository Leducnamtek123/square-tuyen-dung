import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isEmployerHostname, isAdminHostname } from '@/configs/portalRouting';

/**
 * Route mapping for Employer portal on employer domain (employer.infohr.vn / employer.localhost / ntd.infohr.vn).
 * Rewrites incoming paths to their Next.js internal app router paths.
 */
const EMPLOYER_EXACT_MAP: Record<string, string> = {
  '/': '/employer/introduce',
  '/dang-nhap': '/employer/login',
  '/login': '/employer/login',
  '/dang-ky': '/employer/register',
  '/register': '/employer/register',
  '/quen-mat-khau': '/employer/forgot-password',
  '/forgot-password': '/employer/forgot-password',
  '/gioi-thieu': '/employer/introduce',
  '/introduce': '/employer/introduce',
  '/dich-vu': '/employer/service',
  '/service': '/employer/service',
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
  '/articles': '/admin/articles',
  '/tin-tuc-blog': '/admin/articles',
  '/agent-assistants': '/admin/agent-assistants',
  '/tro-ly-agent-quan-tri': '/admin/agent-assistants',
  '/interview-preview': '/admin/interview-preview',
  '/xem-truoc-giao-dien-phong-van': '/admin/interview-preview',
  '/components': '/admin/components',
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
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();

  // Passthrough static manifest and common public assets
  if (
    pathname === '/site.webmanifest' ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/downloads/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/media/') ||
    pathname.startsWith('/images/')
  ) {
    return NextResponse.next();
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

    // Already prefixed with /employer
    if (pathname.startsWith('/employer/')) {
      return NextResponse.next();
    }

    // Normalize path by stripping /nha-tuyen-dung prefix if present
    let targetPath = pathname;
    if (targetPath === '/nha-tuyen-dung') {
      targetPath = '/';
    } else if (targetPath.startsWith('/nha-tuyen-dung/')) {
      targetPath = targetPath.slice('/nha-tuyen-dung'.length);
    }

    // Handle .html legal pages: e.g. /quy-dinh-dang-tin.html -> /employer/legal/quy-dinh-dang-tin
    if (targetPath.endsWith('.html')) {
      const slug = targetPath.replace(/^\//, '').replace(/\.html$/, '');
      const url = request.nextUrl.clone();
      url.pathname = `/employer/legal/${slug}`;
      return NextResponse.rewrite(url);
    }

    // Exact route mapping (e.g. /login -> /employer/login, / -> /employer/introduce, /bao-gia -> /employer/pricing)
    if (EMPLOYER_EXACT_MAP[targetPath]) {
      const url = request.nextUrl.clone();
      url.pathname = EMPLOYER_EXACT_MAP[targetPath];
      return NextResponse.rewrite(url);
    }

    // Prefix mapping (e.g. /tin-tuyen-dung/:id/edit -> /employer/job-posts/:id/edit)
    for (const mapping of EMPLOYER_PREFIX_MAP) {
      if (targetPath.startsWith(`${mapping.prefix}/`)) {
        const remainder = targetPath.slice(mapping.prefix.length);
        const url = request.nextUrl.clone();
        url.pathname = `${mapping.target}${remainder}`;
        return NextResponse.rewrite(url);
      }
    }

    // Default employer rewrite: prepend /employer
    const url = request.nextUrl.clone();
    url.pathname = `/employer${targetPath}`;
    return NextResponse.rewrite(url);
  }

  // ── 2. Admin Subdomain (admin.infohr.vn / admin.localhost) ──
  if (isAdminHostname(hostname)) {
    if (pathname.startsWith('/admin/')) {
      return NextResponse.next();
    }

    // Normalize path by stripping /quan-tri prefix if present
    let targetPath = pathname;
    if (targetPath === '/quan-tri') {
      targetPath = '/';
    } else if (targetPath.startsWith('/quan-tri/')) {
      targetPath = targetPath.slice('/quan-tri'.length);
    }

    if (ADMIN_EXACT_MAP[targetPath]) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_EXACT_MAP[targetPath];
      return NextResponse.rewrite(url);
    }

    // Default admin rewrite: prepend /admin
    const url = request.nextUrl.clone();
    url.pathname = `/admin${targetPath}`;
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
    '/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|avif|css|js|map|woff|woff2|ttf|eot|webmanifest|json|txt|xml)).*)',
  ],
};
