import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
// ────────────────────────────────────────────────────────────────────────────
// Rewrite & redirect rules are generated from the canonical route definitions
// in src/configs/routeConfig.ts — that file is the single source of truth.
// ────────────────────────────────────────────────────────────────────────────

// NOTE: next.config.mjs cannot use TypeScript imports directly.
// The rewrite/redirect rules below are kept in sync with routeConfig.ts.
// When routeConfig.ts changes, update these rules accordingly.
// TODO: Generate these automatically via a build script from routeConfig.ts.

const stripApiSuffix = (url = '') => url.replace(/\/api\/?$/, '').replace(/\/$/, '');
const frontendRoot = dirname(fileURLToPath(import.meta.url));
const isDockerRuntime = existsSync('/.dockerenv');
const explicitApiProxyOrigin = stripApiSuffix(process.env.API_PROXY_ORIGIN || '');
const backendApiOrigin = stripApiSuffix(process.env.BACKEND_API_URL || '');
const backendApiUsesDockerHost = /^https?:\/\/backend(?::|\/|$)/.test(backendApiOrigin);
const dockerHostApiProxyOrigin = `http://host.docker.internal:${process.env.NGINX_PORT || '8080'}`;
const apiProxyOrigin =
  explicitApiProxyOrigin ||
  (backendApiOrigin && (!backendApiUsesDockerHost || !isDockerRuntime) ? backendApiOrigin : '') ||
  (isDockerRuntime ? dockerHostApiProxyOrigin : `http://localhost:${process.env.NGINX_PORT || '8080'}`);

const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'standalone',
  turbopack: {
    root: frontendRoot,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['pdfjs-dist', '@react-pdf-viewer/core', '@react-pdf-viewer/get-file', '@react-pdf-viewer/zoom'],
  transpilePackages: [
    'swiper',
    'mui-image',
    'leaflet',
    'react-draft-wysiwyg',
    'react-image-gallery',
    'react-easy-crop',
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@mui/x-date-pickers',
      '@phosphor-icons/react',
      'dayjs',
      '@fortawesome/react-fontawesome',
    ],
  },
  async redirects() {
    return [
      { source: '/admin/bang-dieu-khien', destination: '/admin/dashboard', permanent: false },
      { source: '/quan-tri/dashboard', destination: '/quan-tri/bang-dieu-khien', permanent: false },
      { source: '/employer/bang-dieu-khien', destination: '/employer/dashboard', permanent: false },
      { source: '/nha-tuyen-dung/dashboard', destination: '/nha-tuyen-dung/bang-dieu-khien', permanent: false },
    ];
  },
  async rewrites() {
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    return [
      ...(isMock ? [] : [{ source: '/api/:path*', destination: `${apiProxyOrigin}/api/:path*/` }]),

      // ── Job Seeker (root level) ──
      { source: '/dang-nhap', destination: '/login' },
      { source: '/dang-ky', destination: '/register' },
      { source: '/quen-mat-khau', destination: '/forgot-password' },
      { source: '/xac-nhan-email', destination: '/email-verification-required' },
      { source: '/cap-nhat-mat-khau/:path*', destination: '/reset-password/:path*' },
      { source: '/viec-lam', destination: '/jobs' },
      { source: '/viec-lam/:slug', destination: '/jobs/:slug' },
      { source: '/cong-ty', destination: '/companies' },
      { source: '/cong-ty/:slug', destination: '/companies/:slug' },
      { source: '/ve-chung-toi', destination: '/about-us' },
      { source: '/gioi-thieu', destination: '/about-us' },
      { source: '/viec-lam-theo-nganh-nghe', destination: '/jobs-by-career' },
      { source: '/viec-lam-theo-tinh-thanh', destination: '/jobs-by-city' },
      { source: '/viec-lam-theo-hinh-thuc-lam-viec', destination: '/jobs-by-type' },
      { source: '/bang-dieu-khien', destination: '/dashboard' },
      { source: '/ho-so', destination: '/profile' },
      { source: '/ho-so-tung-buoc/:slug', destination: '/online-profile/:slug' },
      { source: '/ho-so-dinh-kem/:slug', destination: '/attached-profile/:slug' },
      { source: '/trang-tri-cv', destination: '/ung-vien/trang-tri-cv' },
      { source: '/danh-sach-mau-cv', destination: '/ung-vien/trang-tri-cv' },
      { source: '/mau-cv', destination: '/ung-vien/trang-tri-cv' },
      { source: '/tao-cv', destination: '/cv-builder' },
      { source: '/ung-vien/quan-ly-cv', destination: '/my-cvs' },
      { source: '/quan-ly-cv', destination: '/my-cvs' },
      { source: '/cv-cua-toi', destination: '/my-cvs' },
      { source: '/viec-lam-cua-toi', destination: '/my-jobs' },
      { source: '/cong-ty-cua-toi', destination: '/my-company' },
      { source: '/phong-van-cua-toi', destination: '/my-interviews' },
      { source: '/thong-bao', destination: '/notifications' },
      { source: '/tai-khoan', destination: '/account' },
      { source: '/ket-noi-voi-nha-tuyen-dung', destination: '/chat' },
      { source: '/tin-tuc', destination: '/blog' },
      { source: '/tin-tuc/:slug', destination: '/blog/:slug' },
      { source: '/lien-he', destination: '/contact' },
      { source: '/cau-hoi-thuong-gap', destination: '/faq' },
      { source: '/dieu-khoan-dich-vu', destination: '/terms-of-service' },
      { source: '/terms-and-conditions', destination: '/terms-of-service' },
      { source: '/chinh-sach-bao-mat', destination: '/privacy-policy' },

      // ── Legal & Policy HTML Routes (Vieclam24h style) ──
      { source: '/thoa-thuan-su-dung.html', destination: '/legal/thoa-thuan-su-dung' },
      { source: '/dieu-khoan-su-dung.html', destination: '/legal/thoa-thuan-su-dung' },
      { source: '/quy-dinh-bao-mat.html', destination: '/legal/quy-dinh-bao-mat' },
      { source: '/chinh-sach-bao-mat.html', destination: '/legal/quy-dinh-bao-mat' },
      { source: '/tuan-thu-va-su-dong-y-cua-khach-hang.html', destination: '/legal/tuan-thu-va-su-dong-y-cua-khach-hang' },
      { source: '/so-do-trang-web.html', destination: '/legal/so-do-trang-web' },
      { source: '/chinh-sach-bao-hanh.html', destination: '/legal/chinh-sach-bao-hanh' },
      { source: '/quy-dinh-dang-tin.html', destination: '/legal/quy-dinh-dang-tin' },
      { source: '/nha-tuyen-dung/:slug.html', destination: '/employer/legal/:slug' },
      { source: '/employer/:slug.html', destination: '/employer/legal/:slug' },
      { source: '/:slug.html', destination: '/legal/:slug' },

      // ── Employer (/nha-tuyen-dung → /employer) ──
      { source: '/nha-tuyen-dung/login', destination: '/employer/login' },
      { source: '/nha-tuyen-dung/dang-nhap', destination: '/employer/login' },
      { source: '/nha-tuyen-dung/register', destination: '/employer/register' },
      { source: '/nha-tuyen-dung/dang-ky', destination: '/employer/register' },
      { source: '/nha-tuyen-dung/forgot-password', destination: '/employer/forgot-password' },
      { source: '/nha-tuyen-dung/quen-mat-khau', destination: '/employer/forgot-password' },
      { source: '/nha-tuyen-dung/reset-password/:path*', destination: '/employer/reset-password/:path*' },
      { source: '/nha-tuyen-dung/cap-nhat-mat-khau/:path*', destination: '/employer/reset-password/:path*' },
      { source: '/nha-tuyen-dung/gioi-thieu', destination: '/employer/introduce' },
      { source: '/nha-tuyen-dung/dich-vu', destination: '/employer/service' },
      { source: '/nha-tuyen-dung/bao-gia', destination: '/employer/pricing' },
      { source: '/nha-tuyen-dung/ho-tro', destination: '/employer/support' },
      { source: '/nha-tuyen-dung/blog-tuyen-dung', destination: '/employer/blog' },
      { source: '/nha-tuyen-dung', destination: '/employer/introduce' },
      { source: '/nha-tuyen-dung/bang-dieu-khien', destination: '/employer/dashboard' },
      { source: '/nha-tuyen-dung/tro-ly-agent', destination: '/employer/agent-assistants' },
      { source: '/nha-tuyen-dung/tin-tuyen-dung', destination: '/employer/job-posts' },
      { source: '/nha-tuyen-dung/ho-so-ung-tuyen', destination: '/employer/applied-profiles' },
      { source: '/nha-tuyen-dung/ho-so-da-luu', destination: '/employer/saved-profiles' },
      { source: '/nha-tuyen-dung/danh-sach-ung-vien', destination: '/employer/candidates' },
      { source: '/nha-tuyen-dung/tim-ung-vien', destination: '/employer/candidates' },
      { source: '/nha-tuyen-dung/danh-sach-ung-vien/:slug', destination: '/employer/candidates/:slug' },
      { source: '/nha-tuyen-dung/chi-tiet-ung-vien/:slug', destination: '/employer/candidates/:slug' },
      { source: '/employer/candidate-detail/:slug', destination: '/employer/candidates/:slug' },
      { source: '/nha-tuyen-dung/cong-ty', destination: '/employer/company' },
      { source: '/nha-tuyen-dung/nhan-su-va-vai-tro', destination: '/employer/employees' },
      { source: '/nha-tuyen-dung/nhan-su-va-vai-tro/:id', destination: '/employer/employees/:id' },
      { source: '/nha-tuyen-dung/thong-bao', destination: '/employer/notifications' },
      { source: '/nha-tuyen-dung/tai-khoan', destination: '/employer/account' },
      { source: '/nha-tuyen-dung/cai-dat', destination: '/employer/settings' },
      { source: '/nha-tuyen-dung/ket-noi-voi-ung-vien', destination: '/employer/chat' },
      { source: '/nha-tuyen-dung/danh-sach-phong-van', destination: '/employer/interviews' },
      { source: '/nha-tuyen-dung/danh-sach-phong-van/:id', destination: '/employer/interviews/:id' },
      { source: '/nha-tuyen-dung/danh-sach-phong-van/:id/edit', destination: '/employer/interviews/:id/edit' },
      { source: '/nha-tuyen-dung/ngan-hang-cau-hoi', destination: '/employer/question-bank' },
      { source: '/nha-tuyen-dung/bo-cau-hoi', destination: '/employer/question-groups' },
      { source: '/nha-tuyen-dung/xac-thuc-nha-tuyen-dung', destination: '/employer/verification' },
      { source: '/nha-tuyen-dung/phong-van-ung-vien-truc-tiep', destination: '/employer/interviews/live' },
      { source: '/nha-tuyen-dung/phong-van-truc-tiep/:id', destination: '/employer/interviews/:id' },
      { source: '/nha-tuyen-dung/len-lich-phong-van', destination: '/employer/interviews/create' },
      { source: '/nha-tuyen-dung/chi-tiet-phong-van/:id', destination: '/employer/interviews/:id' },
      { source: '/nha-tuyen-dung/sua-lich-phong-van/:id', destination: '/employer/interviews/:id/edit' },
      { source: '/nha-tuyen-dung/lien-he', destination: '/employer/contact' },
      { source: '/nha-tuyen-dung/cau-hoi-thuong-gap', destination: '/employer/faq' },
      { source: '/nha-tuyen-dung/dieu-khoan-dich-vu', destination: '/employer/terms-of-service' },
      { source: '/nha-tuyen-dung/terms-and-conditions', destination: '/employer/terms-of-service' },
      { source: '/employer/terms-and-conditions', destination: '/employer/terms-of-service' },
      { source: '/nha-tuyen-dung/xac-thuc-nha-tuyen-dung', destination: '/employer/verification' },
      { source: '/nha-tuyen-dung/hrm', destination: '/employer/hrm/dashboard' },
      { source: '/nha-tuyen-dung/hrm/dashboard', destination: '/employer/hrm/dashboard' },
      { source: '/nha-tuyen-dung/hrm/bang-dieu-khien', destination: '/employer/hrm/dashboard' },
      { source: '/nha-tuyen-dung/hrm/employees', destination: '/employer/hrm/employees' },
      { source: '/nha-tuyen-dung/hrm/ho-so-nhan-vien', destination: '/employer/hrm/employees' },
      { source: '/nha-tuyen-dung/hrm/onboarding', destination: '/employer/hrm/onboarding' },
      { source: '/nha-tuyen-dung/hrm/tiep-nhan', destination: '/employer/hrm/onboarding' },
      { source: '/nha-tuyen-dung/hrm/departments', destination: '/employer/hrm/departments' },
      { source: '/nha-tuyen-dung/hrm/phong-ban', destination: '/employer/hrm/departments' },
      { source: '/nha-tuyen-dung/hrm/contracts', destination: '/employer/hrm/contracts' },
      { source: '/nha-tuyen-dung/hrm/hop-dong', destination: '/employer/hrm/contracts' },
      { source: '/nha-tuyen-dung/hrm/leaves', destination: '/employer/hrm/leaves' },
      { source: '/nha-tuyen-dung/hrm/nghi-phep', destination: '/employer/hrm/leaves' },
      { source: '/nha-tuyen-dung/hrm/org-chart', destination: '/employer/hrm/org-chart' },
      { source: '/nha-tuyen-dung/hrm/so-do-to-chuc', destination: '/employer/hrm/org-chart' },
      { source: '/nha-tuyen-dung/:path*', destination: '/employer/:path*' },

      // ── Admin (/quan-tri → /admin) ──
      { source: '/admin/bang-dieu-khien', destination: '/admin/dashboard' },
      { source: '/quan-tri/bang-dieu-khien', destination: '/admin/dashboard' },
      { source: '/quan-tri/tro-ly-agent', destination: '/admin/agent-assistants' },
      { source: '/quan-tri/tro-ly-agent-quan-tri', destination: '/admin/agent-assistants' },
      { source: '/quan-tri/quan-ly-nguoi-dung', destination: '/admin/users' },
      { source: '/quan-tri/quan-ly-tin-tuyen-dung', destination: '/admin/jobs' },
      { source: '/quan-tri/kho-cau-hoi', destination: '/admin/questions' },
      { source: '/quan-tri/quan-ly-bo-cau-hoi', destination: '/admin/question-groups' },
      { source: '/quan-tri/quan-ly-phong-van', destination: '/admin/interviews' },
      { source: '/quan-tri/quan-ly-giong-noi-ai', destination: '/admin/voice-profiles' },
      { source: '/quan-tri/cai-dat-he-thong', destination: '/admin/settings' },
      { source: '/quan-tri/quan-ly-nganh-nghe', destination: '/admin/careers' },
      { source: '/quan-tri/quan-ly-tinh-thanh', destination: '/admin/cities' },
      { source: '/quan-tri/quan-ly-quan-huyen', destination: '/admin/districts' },
      { source: '/quan-tri/quan-ly-phuong-xa', destination: '/admin/wards' },
      { source: '/quan-tri/quan-ly-cong-ty', destination: '/admin/companies' },
      { source: '/quan-tri/quan-ly-ho-so-ung-vien', destination: '/admin/profiles' },
      { source: '/quan-tri/quan-ly-ho-so-ung-vien/:id', destination: '/admin/profiles/:id' },
      { source: '/quan-tri/ho-so/:id', destination: '/admin/profiles/:id' },
      { source: '/quan-tri/ho-so-ung-vien/:id', destination: '/admin/profiles/:id' },
      { source: '/quan-tri/profiles/:id', destination: '/admin/profiles/:id' },
      { source: '/quan-tri/:id(\\d+)', destination: '/admin/profiles/:id' },
      { source: '/admin/:id(\\d+)', destination: '/admin/profiles/:id' },
      { source: '/quan-tri/quan-tri/quan-ly-ho-so-ung-vien', destination: '/admin/profiles' },
      { source: '/quan-tri/quan-tri/quan-ly-ho-so-ung-vien/:id', destination: '/admin/profiles/:id' },
      { source: '/profiles/:id', destination: '/admin/profiles/:id' },
      { source: '/quan-tri/quan-ly-cv-resume', destination: '/admin/resumes' },
      { source: '/quan-tri/nhat-ky-tin-tuyen-dung', destination: '/admin/job-activity' },
      { source: '/quan-tri/thong-bao-viec-lam', destination: '/admin/job-notifications' },
      { source: '/quan-tri/quan-ly-banner', destination: '/admin/banners' },
      { source: '/quan-tri/quan-ly-loai-banner', destination: '/admin/banner-types' },
      { source: '/quan-tri/quan-ly-danh-gia', destination: '/admin/feedbacks' },
      { source: '/quan-tri/tin-tuc-blog', destination: '/admin/articles' },
      { source: '/quan-tri/tin-tuc-blog/tao-moi', destination: '/admin/articles/create' },
      { source: '/quan-tri/tin-tuc-blog/:id', destination: '/admin/articles/:id' },
      { source: '/quan-tri/ket-noi-voi-nha-tuyen-dung', destination: '/admin/chat' },
      { source: '/quan-tri/xem-truoc-giao-dien-phong-van', destination: '/admin/interview-preview' },
      { source: '/quan-tri/he-thong-giao-dien', destination: '/admin/components' },
      { source: '/quan-tri/component', destination: '/admin/components' },
      { source: '/quan-tri/components', destination: '/admin/components' },
      { source: '/quan-tri/xac-thuc-cong-ty', destination: '/admin/company-verifications' },
      { source: '/quan-tri/bao-cao-tin-cay', destination: '/admin/trust-reports' },
      { source: '/quan-tri/nhat-ky-he-thong', destination: '/admin/audit-logs' },
      { source: '/quan-tri/hrm', destination: '/admin/hrm/dashboard' },
      { source: '/quan-tri/hrm/dashboard', destination: '/admin/hrm/dashboard' },
      { source: '/quan-tri/hrm/bang-dieu-khien', destination: '/admin/hrm/dashboard' },
      { source: '/quan-tri/hrm/employees', destination: '/admin/hrm/employees' },
      { source: '/quan-tri/hrm/ho-so-nhan-vien', destination: '/admin/hrm/employees' },
      { source: '/quan-tri/hrm/onboarding', destination: '/admin/hrm/onboarding' },
      { source: '/quan-tri/hrm/tiep-nhan', destination: '/admin/hrm/onboarding' },
      { source: '/quan-tri/hrm/departments', destination: '/admin/hrm/departments' },
      { source: '/quan-tri/hrm/phong-ban', destination: '/admin/hrm/departments' },
      { source: '/quan-tri/hrm/contracts', destination: '/admin/hrm/contracts' },
      { source: '/quan-tri/hrm/hop-dong', destination: '/admin/hrm/contracts' },
      { source: '/quan-tri/hrm/leaves', destination: '/admin/hrm/leaves' },
      { source: '/quan-tri/hrm/nghi-phep', destination: '/admin/hrm/leaves' },
      { source: '/quan-tri/hrm/org-chart', destination: '/admin/hrm/org-chart' },
      { source: '/quan-tri/hrm/so-do-to-chuc', destination: '/admin/hrm/org-chart' },
      { source: '/quan-tri', destination: '/admin/dashboard' },
      { source: '/quan-tri/:path*', destination: '/admin/:path*' },

      // ── Candidate Interview ──
      { source: '/phong-van/room/:id', destination: '/interview/:id' },
      { source: '/phong-van/:path*', destination: '/interview/:path*' },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 's3.infohr.vn' },
      { protocol: 'http', hostname: 'minio' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: 'infohr.vn' },
      { protocol: 'https', hostname: '*.firebasestorage.app' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/infohr-icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
