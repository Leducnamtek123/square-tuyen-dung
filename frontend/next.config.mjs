/** @type {import('next').NextConfig} */
// ────────────────────────────────────────────────────────────────────────────
// Rewrite & redirect rules are generated from the canonical route definitions
// in src/configs/routeConfig.ts — that file is the single source of truth.
// ────────────────────────────────────────────────────────────────────────────

// NOTE: next.config.mjs cannot use TypeScript imports directly.
// The rewrite/redirect rules below are kept in sync with routeConfig.ts.
// When routeConfig.ts changes, update these rules accordingly.
// TODO: Generate these automatically via a build script from routeConfig.ts.

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['pdfjs-dist', '@react-pdf-viewer/core', '@react-pdf-viewer/get-file', '@react-pdf-viewer/zoom'],
  transpilePackages: [
    'swiper',
    'mui-image',
    'leaflet',
    'react-draft-wysiwyg',
    'react-image-gallery',
    'react-toastify',
    'sweetalert2',
    'react-easy-crop',
  ],
  async redirects() {
    return [
      { source: '/admin/bang-dieu-khien', destination: '/admin/dashboard', permanent: false },
      { source: '/quan-tri/dashboard', destination: '/quan-tri/bang-dieu-khien', permanent: false },
      { source: '/employer/bang-dieu-khien', destination: '/employer/dashboard', permanent: false },
      { source: '/nha-tuyen-dung/dashboard', destination: '/nha-tuyen-dung/bang-dieu-khien', permanent: false },
    ];
  },
  async rewrites() {
    return [
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
      { source: '/viec-lam-theo-nganh-nghe', destination: '/jobs-by-career' },
      { source: '/viec-lam-theo-tinh-thanh', destination: '/jobs-by-city' },
      { source: '/viec-lam-theo-hinh-thuc-lam-viec', destination: '/jobs-by-type' },
      { source: '/bang-dieu-khien', destination: '/dashboard' },
      { source: '/ho-so', destination: '/profile' },
      { source: '/ho-so-tung-buoc/:slug', destination: '/online-profile/:slug' },
      { source: '/ho-so-dinh-kem/:slug', destination: '/attached-profile/:slug' },
      { source: '/viec-lam-cua-toi', destination: '/my-jobs' },
      { source: '/cong-ty-cua-toi', destination: '/my-company' },
      { source: '/phong-van-cua-toi', destination: '/my-interviews' },
      { source: '/thong-bao', destination: '/notifications' },
      { source: '/tai-khoan', destination: '/account' },
      { source: '/ket-noi-voi-nha-tuyen-dung', destination: '/chat' },

      // ── Employer (/nha-tuyen-dung → /employer) ──
      { source: '/nha-tuyen-dung/login', destination: '/employer/login' },
      { source: '/nha-tuyen-dung/register', destination: '/employer/register' },
      { source: '/nha-tuyen-dung/forgot-password', destination: '/employer/forgot-password' },
      { source: '/nha-tuyen-dung/reset-password/:path*', destination: '/employer/reset-password/:path*' },
      { source: '/nha-tuyen-dung/gioi-thieu', destination: '/employer/introduce' },
      { source: '/nha-tuyen-dung/dich-vu', destination: '/employer/service' },
      { source: '/nha-tuyen-dung/bao-gia', destination: '/employer/pricing' },
      { source: '/nha-tuyen-dung/ho-tro', destination: '/employer/support' },
      { source: '/nha-tuyen-dung/blog-tuyen-dung', destination: '/employer/blog' },
      { source: '/nha-tuyen-dung', destination: '/employer/dashboard' },
      { source: '/nha-tuyen-dung/bang-dieu-khien', destination: '/employer/dashboard' },
      { source: '/nha-tuyen-dung/tin-tuyen-dung', destination: '/employer/job-posts' },
      { source: '/nha-tuyen-dung/ho-so-ung-tuyen', destination: '/employer/applied-profiles' },
      { source: '/nha-tuyen-dung/ho-so-da-luu', destination: '/employer/saved-profiles' },
      { source: '/nha-tuyen-dung/danh-sach-ung-vien', destination: '/employer/candidates' },
      { source: '/nha-tuyen-dung/chi-tiet-ung-vien/:slug', destination: '/employer/candidates/:slug' },
      { source: '/nha-tuyen-dung/cong-ty', destination: '/employer/company' },
      { source: '/nha-tuyen-dung/nhan-su-va-vai-tro', destination: '/employer/employees' },
      { source: '/nha-tuyen-dung/thong-bao', destination: '/employer/notifications' },
      { source: '/nha-tuyen-dung/tai-khoan', destination: '/employer/account' },
      { source: '/nha-tuyen-dung/cai-dat', destination: '/employer/settings' },
      { source: '/nha-tuyen-dung/ket-noi-voi-ung-vien', destination: '/employer/chat' },
      { source: '/nha-tuyen-dung/danh-sach-phong-van', destination: '/employer/interviews' },
      { source: '/nha-tuyen-dung/ngan-hang-cau-hoi', destination: '/employer/question-bank' },
      { source: '/nha-tuyen-dung/bo-cau-hoi', destination: '/employer/question-groups' },
      { source: '/nha-tuyen-dung/xac-thuc-nha-tuyen-dung', destination: '/employer/verification' },
      { source: '/nha-tuyen-dung/phong-van-ung-vien-truc-tiep', destination: '/employer/interviews/live' },
      { source: '/nha-tuyen-dung/phong-van-truc-tiep/:id', destination: '/employer/interviews/:id' },
      { source: '/nha-tuyen-dung/len-lich-phong-van', destination: '/employer/interviews/create' },
      { source: '/nha-tuyen-dung/chi-tiet-phong-van/:id', destination: '/employer/interviews/:id' },
      { source: '/nha-tuyen-dung/:path*', destination: '/employer/:path*' },

      // ── Admin (/quan-tri → /admin) ──
      { source: '/admin/bang-dieu-khien', destination: '/admin/dashboard' },
      { source: '/quan-tri/bang-dieu-khien', destination: '/admin/dashboard' },
      { source: '/quan-tri/quan-ly-nguoi-dung', destination: '/admin/users' },
      { source: '/quan-tri/quan-ly-tin-tuyen-dung', destination: '/admin/jobs' },
      { source: '/quan-tri/kho-cau-hoi', destination: '/admin/questions' },
      { source: '/quan-tri/quan-ly-bo-cau-hoi', destination: '/admin/question-groups' },
      { source: '/quan-tri/quan-ly-phong-van', destination: '/admin/interviews' },
      { source: '/quan-tri/cai-dat-he-thong', destination: '/admin/settings' },
      { source: '/quan-tri/quan-ly-nganh-nghe', destination: '/admin/careers' },
      { source: '/quan-tri/quan-ly-tinh-thanh', destination: '/admin/cities' },
      { source: '/quan-tri/quan-ly-quan-huyen', destination: '/admin/districts' },
      { source: '/quan-tri/quan-ly-phuong-xa', destination: '/admin/wards' },
      { source: '/quan-tri/quan-ly-cong-ty', destination: '/admin/companies' },
      { source: '/quan-tri/quan-ly-ho-so-ung-vien', destination: '/admin/profiles' },
      { source: '/quan-tri/quan-ly-cv-resume', destination: '/admin/resumes' },
      { source: '/quan-tri/nhat-ky-tin-tuyen-dung', destination: '/admin/job-activity' },
      { source: '/quan-tri/thong-bao-viec-lam', destination: '/admin/job-notifications' },
      { source: '/quan-tri/phong-van-cong-ty-truc-tiep', destination: '/admin/interviews/live' },
      { source: '/quan-tri', destination: '/admin/dashboard' },
      { source: '/quan-tri/:path*', destination: '/admin/:path*' },

      // ── Candidate Interview ──
      { source: '/phong-van/room/:id', destination: '/interview/:id' },
      { source: '/phong-van/:path*', destination: '/interview/:path*' },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's3.tuyendung.square.vn' },
      { protocol: 'http', hostname: 'minio' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: 'tuyendung.square.vn' },
      { protocol: 'https', hostname: '*.firebasestorage.app' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
