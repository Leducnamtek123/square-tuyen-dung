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
async function getServerLocale(): Promise<SupportedLocale> {
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
  'home':                     { vi: 'InfoHR Tuyển Dụng - Tìm việc nhanh, tuyển dụng hiệu quả', en: 'InfoHR Jobs - Find jobs fast, recruit efficiently' },

  // Auth
  'admin.login':              { vi: 'Đăng nhập quản trị', en: 'Admin Login' },
  'admin.forgot-password':    { vi: 'Quên mật khẩu', en: 'Forgot Password' },
  'admin.reset-password':     { vi: 'Đặt lại mật khẩu quản trị', en: 'Admin Reset Password' },
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
  'admin.company-verifications': { vi: 'Xác thực doanh nghiệp', en: 'Company Verifications' },
  'admin.profiles':           { vi: 'Hồ sơ', en: 'Profiles' },
  'admin.profileDetail':      { vi: 'Chi tiết hồ sơ', en: 'Profile Detail' },
  'admin.resumes':            { vi: 'CV đính kèm', en: 'Resumes' },
  'admin.careers':            { vi: 'Ngành nghề', en: 'Careers' },
  'admin.cities':             { vi: 'Tỉnh / Thành phố', en: 'Cities' },
  'admin.districts':          { vi: 'Quận / Huyện', en: 'Districts' },
  'admin.wards':              { vi: 'Phường / Xã', en: 'Wards' },
  'admin.banners':            { vi: 'Banner', en: 'Banners' },
  'admin.banner-types':       { vi: 'Loại banner', en: 'Banner Types' },
  'admin.feedbacks':          { vi: 'Đánh giá người dùng', en: 'User Reviews' },
  'admin.trustReports':       { vi: 'Báo cáo vi phạm', en: 'Violation Reports' },
  'admin.contactMessages':    { vi: 'Báo lỗi & tin nhắn liên hệ', en: 'Bug Reports & Contact Messages' },
  'admin.settings':           { vi: 'Cài đặt hệ thống', en: 'System Settings' },
  'admin.audit-logs':         { vi: 'Nhật ký hệ thống', en: 'Audit Logs' },
  'admin.chat':               { vi: 'Hộp thư', en: 'Chat' },
  'admin.job-activity':       { vi: 'Nhật ký tin tuyển dụng', en: 'Job Activity' },
  'admin.job-notifications':  { vi: 'Thông báo việc làm', en: 'Job Notifications' },
  'admin.interviews':         { vi: 'Phỏng vấn AI', en: 'AI Interviews' },
  'admin.interview-preview':  { vi: 'Xem trước phỏng vấn AI', en: 'AI Interview UI Preview' },
  'admin.questions':          { vi: 'Ngân hàng câu hỏi', en: 'Question Bank' },
  'admin.question-groups':    { vi: 'Bộ nhóm câu hỏi', en: 'Question Groups' },
  'admin.voice-profiles':     { vi: 'Hồ sơ giọng nói AI', en: 'AI Voice Profiles' },
  'admin.articles':           { vi: 'Tin tức & Blog', en: 'Articles & Blog' },
  'admin.articles.create':    { vi: 'Tạo bài viết mới', en: 'Create Article' },
  'admin.hrm':                { vi: 'Quản trị nhân sự (HRM)', en: 'Human Resource Management' },
  'admin.hrm.dashboard':      { vi: 'Bảng điều khiển HRM', en: 'HRM Dashboard' },
  'admin.hrm.employees':      { vi: 'Quản lý nhân viên', en: 'Employee Management' },
  'admin.hrm.departments':    { vi: 'Phòng ban & Bộ phận', en: 'Departments' },
  'admin.hrm.org-chart':      { vi: 'Sơ đồ tổ chức', en: 'Organization Chart' },
  'admin.hrm.contracts':      { vi: 'Hợp đồng lao động', en: 'Employment Contracts' },
  'admin.hrm.leaves':         { vi: 'Nghỉ phép', en: 'Leave Management' },
  'admin.hrm.onboarding':     { vi: 'Quy trình Onboarding', en: 'Onboarding Flow' },
  'admin.agent-assistants':   { vi: 'Trợ lý AI Agent', en: 'AI Agent Assistants' },
  'admin.components':         { vi: 'Thư viện thành phần giao diện', en: 'Component Library' },

  // Employer
  'employer.login':           { vi: 'Đăng nhập nhà tuyển dụng', en: 'Employer Login' },
  'employer.register':        { vi: 'Đăng ký nhà tuyển dụng', en: 'Employer Registration' },
  'employer.forgot-password': { vi: 'Quên mật khẩu', en: 'Forgot Password' },
  'employer.dashboard':       { vi: 'Bảng điều khiển', en: 'Dashboard' },
  'employer.account':         { vi: 'Tài khoản', en: 'Account' },
  'employer.settings':        { vi: 'Cài đặt', en: 'Settings' },
  'employer.job-posts':       { vi: 'Tin tuyển dụng', en: 'Job Posts' },
  'employer.company':         { vi: 'Thông tin công ty', en: 'Company Profile' },
  'employer.employees':       { vi: 'Nhân viên', en: 'Employees' },
  'employer.candidates':      { vi: 'Ứng viên', en: 'Candidates' },
  'employer.candidate-detail': { vi: 'Chi tiết ứng viên', en: 'Candidate Detail' },
  'employer.applied-profiles': { vi: 'Hồ sơ ứng tuyển', en: 'Applied Profiles' },
  'employer.interviews':      { vi: 'Phỏng vấn AI', en: 'AI Interviews' },
  'employer.interview-detail': { vi: 'Chi tiết phỏng vấn AI', en: 'AI Interview Details' },
  'employer.interviews-create': { vi: 'Tạo lịch phỏng vấn AI', en: 'Schedule AI Interview' },
  'employer.interviews-edit': { vi: 'Chỉnh sửa lịch phỏng vấn AI', en: 'Edit AI Interview' },
  'employer.interviews-session': { vi: 'Phiên phỏng vấn AI', en: 'AI Interview Session' },
  'employer.interviews-live': { vi: 'Phỏng vấn AI trực tiếp', en: 'Live AI Interviews' },
  'employer.interviews-history': { vi: 'Lịch sử phỏng vấn AI', en: 'AI Interview History' },
  'employer.saved-profiles':  { vi: 'Hồ sơ đã lưu', en: 'Saved Profiles' },
  'employer.question-bank':   { vi: 'Ngân hàng câu hỏi', en: 'Question Bank' },
  'employer.question-groups': { vi: 'Nhóm câu hỏi', en: 'Question Sets' },
  'employer.verification':    { vi: 'Xác minh doanh nghiệp', en: 'Company Verification' },
  'employer.notifications':   { vi: 'Thông báo', en: 'Notifications' },
  'employer.hrm.employees':   { vi: 'Quản lý nhân viên', en: 'Employee Management' },
  'employer.hrm.departments': { vi: 'Quản lý phòng ban', en: 'Department Management' },
  'employer.hrm.leaves':      { vi: 'Quản lý nghỉ phép', en: 'Leave Management' },
  'employer.hrm.onboarding':  { vi: 'Tiếp nhận nhân sự', en: 'HRM Onboarding' },
  'employer.hrm.contracts':   { vi: 'Hợp đồng lao động', en: 'Contract Management' },
  'employer.hrm.dashboard':   { vi: 'Bảng điều khiển HRM', en: 'HRM Dashboard' },
  'employer.hrm.org-chart':   { vi: 'Sơ đồ tổ chức', en: 'Organizational Chart' },
  'employer.blog':            { vi: 'Quản lý bài viết tuyển dụng', en: 'Recruitment Blog Management' },
  'employer.blog-create':     { vi: 'Viết bài tuyển dụng mới', en: 'Create Recruitment Article' },
  'employer.blog-edit':       { vi: 'Chỉnh sửa bài viết tuyển dụng', en: 'Edit Recruitment Article' },
  'employer.chat':            { vi: 'Hộp thư', en: 'Chat' },
  'employer.pricing':         { vi: 'Bảng giá dịch vụ', en: 'Pricing Plans' },
  'employer.service':         { vi: 'Dịch vụ tuyển dụng', en: 'Recruitment Services' },
  'employer.introduce':       { vi: 'Giới thiệu giải pháp', en: 'Solution Overview' },
  'employer.faq':             { vi: 'Câu hỏi thường gặp | Doanh nghiệp', en: 'Employer FAQ' },
  'employer.agent-assistants': { vi: 'Trợ lý AI AILA', en: 'AILA AI Assistant' },
  'employer.support':         { vi: 'Trung tâm hỗ trợ', en: 'Support Center' },
  'employer.contact':         { vi: 'Liên hệ nhà tuyển dụng', en: 'Employer Contact' },
  'employer.privacy-policy':  { vi: 'Chính sách bảo mật | Doanh nghiệp', en: 'Employer Privacy Policy' },
  'employer.terms-of-service': { vi: 'Điều khoản dịch vụ | Doanh nghiệp', en: 'Employer Terms of Service' },

  // Onboarding
  'onboarding.candidate':     { vi: 'Thiết lập hồ sơ ứng viên | InfoHR', en: 'Candidate Onboarding | InfoHR' },
  'onboarding.employer':      { vi: 'Thiết lập thông tin doanh nghiệp | InfoHR', en: 'Employer Onboarding | InfoHR' },

  // Job seeker
  'dashboard':                { vi: 'Tổng quan', en: 'Dashboard' },
  'account':                  { vi: 'Tài khoản', en: 'Account' },
  'profile':                  { vi: 'Hồ sơ của tôi', en: 'My Profile' },
  'online-profile':           { vi: 'Hồ sơ trực tuyến', en: 'Online Profile' },
  'my-company':               { vi: 'Công ty của tôi', en: 'My Company' },
  'jobs':                     { vi: 'Tìm việc làm', en: 'Find Jobs' },
  'my-jobs':                  { vi: 'Việc làm đã lưu', en: 'Saved Jobs' },
  'my-interviews':            { vi: 'Phỏng vấn của tôi', en: 'My Interviews' },
  'notifications':            { vi: 'Thông báo', en: 'Notifications' },
  'chat':                     { vi: 'Hộp thư', en: 'Chat' },

  // Public
  'companies':                { vi: 'Công ty', en: 'Companies' },
  'about':                    { vi: 'Về chúng tôi', en: 'About Us' },
  'news':                     { vi: 'Tin tức & Blog tuyển dụng', en: 'News & Recruitment Blog' },
  'blog':                     { vi: 'Tin tức & Blog tuyển dụng', en: 'News & Recruitment Blog' },
  'contact':                  { vi: 'Liên hệ', en: 'Contact' },
  'faq':                      { vi: 'Câu hỏi thường gặp', en: 'FAQ' },
  'privacy-policy':           { vi: 'Chính sách bảo mật', en: 'Privacy Policy' },
  'terms-of-service':         { vi: 'Điều khoản dịch vụ', en: 'Terms of Service' },
  'jobs-by-career':           { vi: 'Việc làm theo ngành nghề', en: 'Jobs by Career' },
  'jobs-by-city':             { vi: 'Việc làm theo tỉnh thành', en: 'Jobs by City' },
  'jobs-by-type':             { vi: 'Việc làm theo hình thức làm việc', en: 'Jobs by Contract Type' },
  'interview.room':           { vi: 'Phòng phỏng vấn AI', en: 'AI Interview Room' },
  'interview.login':          { vi: 'Đăng nhập phỏng vấn AI', en: 'AI Interview Login' },
  'employer.reset-password':  { vi: 'Đặt lại mật khẩu nhà tuyển dụng', en: 'Employer Reset Password' },
  'error.forbidden':          { vi: 'Truy cập bị từ chối (403)', en: 'Access Forbidden (403)' },
};

/**
 * Get a localized page title.
 * Falls back to Vietnamese if key or locale not found.
 */
async function getPageTitle(key: string): Promise<string> {
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

export interface SeoMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
}

/**
 * Build complete SEO Metadata (title, description, canonical URL, and OpenGraph object)
 */
export function buildSeoMetadata({
  title,
  description,
  path,
  image = 'https://infohr.vn/android-chrome-512x512.png',
  type = 'website',
}: SeoMetadataOptions): Metadata {
  const cleanPath = path === '/' ? '' : (path.startsWith('/') ? path : `/${path}`);
  const canonicalUrl = `https://infohr.vn${cleanPath}`;
  const fullImageUrl = image.startsWith('http') ? image : `https://infohr.vn${image.startsWith('/') ? '' : '/'}${image}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'InfoHR',
      locale: 'vi_VN',
      type,
      images: [
        {
          url: fullImageUrl,
          alt: title,
        },
      ],
    },
  };
}

