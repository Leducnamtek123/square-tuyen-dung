/**
 * Server-side i18n utility for Next.js App Router metadata.
 * Cannot use useTranslation() in Server Components, so we read locale
 * directly from cookies/headers and look up translations from JSON files.
 */
import { cookies, headers } from 'next/headers';
import type { Metadata } from 'next';

// ─── Locale detection ──────────────────────────────────────────────────────

type SupportedLocale = 'vi' | 'en';

function normalizeLocale(lang?: string | null): SupportedLocale {
  if (!lang) return 'vi';
  const code = lang.split('-')[0].split('_')[0].toLowerCase();
  return code === 'en' ? 'en' : 'vi';
}

/**
 * Reads the current locale from:
 *   1. Cookie: `i18nextLng` (set by the browser after language switch)
 *   2. `Accept-Language` header (fallback for first-time visitors)
 *   3. Default: 'vi'
 */
export async function getServerLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get('i18nextLng')?.value;
  if (fromCookie) return normalizeLocale(fromCookie);

  const headerStore = await headers();
  const acceptLang = headerStore.get('accept-language');
  if (acceptLang) return normalizeLocale(acceptLang);

  return 'vi';
}

// ─── Page title map ─────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, Record<SupportedLocale, string>> = {
  // Root
  'home':                     { vi: 'Square Tuyển Dụng - Tìm việc nhanh, tuyển dụng hiệu quả', en: 'Square Jobs - Find jobs fast, recruit efficiently' },

  // Auth
  'admin.login':              { vi: 'Đăng nhập quản trị', en: 'Admin Login' },
  'admin.forgot-password':    { vi: 'Quên mật khẩu', en: 'Forgot Password' },
  'login':                    { vi: 'Đăng nhập', en: 'Login' },
  'register':                 { vi: 'Đăng ký', en: 'Register' },
  'forgot-password':          { vi: 'Quên mật khẩu', en: 'Forgot Password' },
  'reset-password':           { vi: 'Đặt lại mật khẩu', en: 'Reset Password' },
  'verify-email':             { vi: 'Xác thực email', en: 'Email Verification' },

  // Admin
  'admin':                    { vi: 'Quản trị', en: 'Admin' },
  'admin.dashboard':          { vi: 'Bảng điều khiển', en: 'Dashboard' },
  'admin.users':              { vi: 'Người dùng', en: 'Users' },
  'admin.jobs':               { vi: 'Tin tuyển dụng', en: 'Job Posts' },
  'admin.companies':          { vi: 'Công ty', en: 'Companies' },
  'admin.profiles':           { vi: 'Hồ sơ', en: 'Profiles' },
  'admin.resumes':            { vi: 'CV đính kèm', en: 'Resumes' },
  'admin.careers':            { vi: 'Ngành nghề', en: 'Careers' },
  'admin.cities':             { vi: 'Tỉnh / Thành phố', en: 'Cities' },
  'admin.districts':          { vi: 'Quận / Huyện', en: 'Districts' },
  'admin.wards':              { vi: 'Phường / Xã', en: 'Wards' },
  'admin.banners':            { vi: 'Banner', en: 'Banners' },
  'admin.banner-types':       { vi: 'Loại banner', en: 'Banner Types' },
  'admin.feedbacks':          { vi: 'Phản hồi', en: 'Feedbacks' },
  'admin.settings':           { vi: 'Cài đặt hệ thống', en: 'System Settings' },
  'admin.chat':               { vi: 'Hộp thư', en: 'Chat' },
  'admin.job-activity':       { vi: 'Nhật ký tin tuyển dụng', en: 'Job Activity' },
  'admin.job-notifications':  { vi: 'Thông báo việc làm', en: 'Job Notifications' },
  'admin.interviews':         { vi: 'Phỏng vấn AI', en: 'AI Interviews' },

  // Employer
  'employer.dashboard':       { vi: 'Bảng điều khiển', en: 'Dashboard' },
  'employer.account':         { vi: 'Tài khoản', en: 'Account' },
  'employer.settings':        { vi: 'Cài đặt', en: 'Settings' },
  'employer.job-posts':       { vi: 'Tin tuyển dụng', en: 'Job Posts' },
  'employer.company':         { vi: 'Thông tin công ty', en: 'Company Profile' },
  'employer.employees':       { vi: 'Nhân viên', en: 'Employees' },
  'employer.candidates':      { vi: 'Ứng viên', en: 'Candidates' },
  'employer.interviews':      { vi: 'Phỏng vấn AI', en: 'AI Interviews' },
  'employer.chat':            { vi: 'Hộp thư', en: 'Chat' },

  // Job seeker
  'dashboard':                { vi: 'Tổng quan', en: 'Dashboard' },
  'account':                  { vi: 'Tài khoản', en: 'Account' },
  'profile':                  { vi: 'Hồ sơ của tôi', en: 'My Profile' },
  'jobs':                     { vi: 'Tìm việc làm', en: 'Find Jobs' },
  'my-jobs':                  { vi: 'Việc làm đã lưu', en: 'Saved Jobs' },
  'my-interviews':            { vi: 'Phỏng vấn của tôi', en: 'My Interviews' },
  'notifications':            { vi: 'Thông báo', en: 'Notifications' },
  'chat':                     { vi: 'Hộp thư', en: 'Chat' },

  // Public
  'companies':                { vi: 'Công ty', en: 'Companies' },
  'about':                    { vi: 'Về chúng tôi', en: 'About Us' },
};

/**
 * Get a localized page title.
 * Falls back to Vietnamese if key or locale not found.
 */
export async function getPageTitle(key: string): Promise<string> {
  const locale = await getServerLocale();
  return PAGE_TITLES[key]?.[locale] ?? PAGE_TITLES[key]?.['vi'] ?? key;
}

/**
 * Generate a Metadata object with localized title.
 * Usage in page.tsx:
 *   export const generateMetadata = () => buildPageMetadata('admin.dashboard');
 */
export async function buildPageMetadata(key: string, extra?: Partial<Metadata>): Promise<Metadata> {
  const title = await getPageTitle(key);
  return {
    title,
    ...extra,
  };
}
