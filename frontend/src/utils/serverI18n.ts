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

// ─── Page title map (Optimized for 35-65 char SEO length without duplicate suffixes) ──

const PAGE_TITLES: Record<string, Record<SupportedLocale, string>> = {
  // Root
  'home':                     { vi: 'InfoHR - Tìm việc nhanh, tuyển dụng hiệu quả', en: 'InfoHR - Find jobs fast, recruit efficiently' },

  // Auth
  'admin.login':              { vi: 'Đăng nhập quản trị hệ thống', en: 'Admin System Login' },
  'admin.forgot-password':    { vi: 'Khôi phục mật khẩu quản trị', en: 'Admin Forgot Password' },
  'admin.reset-password':     { vi: 'Đặt lại mật khẩu quản trị', en: 'Admin Reset Password' },
  'login':                    { vi: 'Đăng nhập tài khoản tìm việc', en: 'Job Seeker Login' },
  'register':                 { vi: 'Đăng ký tài khoản ứng viên mới', en: 'Job Seeker Registration' },
  'forgot-password':          { vi: 'Quên mật khẩu tài khoản', en: 'Forgot Password' },
  'reset-password':           { vi: 'Đặt lại mật khẩu bảo mật', en: 'Reset Password' },
  'verify-email':             { vi: 'Xác thực tài khoản email', en: 'Email Verification' },

  // Admin
  'admin':                    { vi: 'Quản trị hệ thống', en: 'Admin' },
  'admin.dashboard':          { vi: 'Bảng điều khiển quản trị', en: 'Dashboard' },
  'admin.users':              { vi: 'Quản lý người dùng', en: 'Users' },
  'admin.jobs':               { vi: 'Quản lý tin tuyển dụng', en: 'Job Posts' },
  'admin.companies':          { vi: 'Quản lý công ty & doanh nghiệp', en: 'Companies' },
  'admin.company-verifications': { vi: 'Xác thực doanh nghiệp', en: 'Company Verifications' },
  'admin.profiles':           { vi: 'Quản lý hồ sơ ứng viên', en: 'Profiles' },
  'admin.profileDetail':      { vi: 'Chi tiết hồ sơ ứng viên', en: 'Profile Detail' },
  'admin.resumes':            { vi: 'Quản lý CV đính kèm', en: 'Resumes' },
  'admin.careers':            { vi: 'Danh mục ngành nghề', en: 'Careers' },
  'admin.cities':             { vi: 'Danh mục Tỉnh / Thành phố', en: 'Cities' },
  'admin.districts':          { vi: 'Danh mục Quận / Huyện', en: 'Districts' },
  'admin.wards':              { vi: 'Danh mục Phường / Xã', en: 'Wards' },
  'admin.banners':            { vi: 'Quản lý Banner quảng cáo', en: 'Banners' },
  'admin.banner-types':       { vi: 'Phân loại Banner', en: 'Banner Types' },
  'admin.feedbacks':          { vi: 'Đánh giá từ người dùng', en: 'User Reviews' },
  'admin.trustReports':       { vi: 'Báo cáo vi phạm & khiếu nại', en: 'Violation Reports' },
  'admin.contactMessages':    { vi: 'Báo lỗi & tin nhắn liên hệ', en: 'Bug Reports & Contact Messages' },
  'admin.settings':           { vi: 'Cài đặt hệ thống InfoHR', en: 'System Settings' },
  'admin.audit-logs':         { vi: 'Nhật ký hoạt động hệ thống', en: 'Audit Logs' },
  'admin.chat':               { vi: 'Hộp thư tin nhắn quản trị', en: 'Chat' },
  'admin.job-activity':       { vi: 'Nhật ký biến động tin tuyển dụng', en: 'Job Activity' },
  'admin.job-notifications':  { vi: 'Thông báo việc làm tự động', en: 'Job Notifications' },
  'admin.interviews':         { vi: 'Quản lý phỏng vấn AI AILA', en: 'AI Interviews' },
  'admin.interview-preview':  { vi: 'Xem trước phòng phỏng vấn AI', en: 'AI Interview UI Preview' },
  'admin.questions':          { vi: 'Ngân hàng câu hỏi phỏng vấn', en: 'Question Bank' },
  'admin.question-groups':    { vi: 'Bộ nhóm câu hỏi chuyên sâu', en: 'Question Groups' },
  'admin.voice-profiles':     { vi: 'Cấu hình giọng nói AI', en: 'AI Voice Profiles' },
  'admin.articles':           { vi: 'Quản lý bài viết & tin tức', en: 'Articles & Blog' },
  'admin.articles.create':    { vi: 'Tạo bài viết tin tức mới', en: 'Create Article' },
  'admin.hrm':                { vi: 'Quản trị nhân sự HRM', en: 'Human Resource Management' },
  'admin.hrm.dashboard':      { vi: 'Bảng điều khiển nhân sự HRM', en: 'HRM Dashboard' },
  'admin.hrm.employees':      { vi: 'Quản lý danh sách nhân viên', en: 'Employee Management' },
  'admin.hrm.departments':    { vi: 'Quản lý phòng ban & bộ phận', en: 'Departments' },
  'admin.hrm.org-chart':      { vi: 'Sơ đồ tổ chức nhân sự', en: 'Organization Chart' },
  'admin.hrm.contracts':      { vi: 'Quản lý hợp đồng lao động', en: 'Employment Contracts' },
  'admin.hrm.leaves':         { vi: 'Quản lý đơn nghỉ phép', en: 'Leave Management' },
  'admin.hrm.onboarding':     { vi: 'Quy trình tiếp nhận Onboarding', en: 'Onboarding Flow' },
  'admin.agent-assistants':   { vi: 'Trợ lý AI Agent doanh nghiệp', en: 'AI Agent Assistants' },
  'admin.components':         { vi: 'Thư viện thành phần UI', en: 'Component Library' },

  // Employer (Optimized lengths >= 35 chars)
  'employer.login':           { vi: 'Đăng nhập cổng Nhà tuyển dụng', en: 'Employer Portal Login' },
  'employer.register':        { vi: 'Đăng ký tài khoản Nhà tuyển dụng', en: 'Employer Registration' },
  'employer.forgot-password': { vi: 'Khôi phục mật khẩu Nhà tuyển dụng', en: 'Employer Forgot Password' },
  'employer.dashboard':       { vi: 'Bảng điều khiển Nhà tuyển dụng', en: 'Employer Dashboard' },
  'employer.account':         { vi: 'Quản lý tài khoản doanh nghiệp', en: 'Employer Account' },
  'employer.settings':        { vi: 'Cài đặt tài khoản tuyển dụng', en: 'Employer Settings' },
  'employer.job-posts':       { vi: 'Quản lý tin đăng tuyển dụng', en: 'Job Posts Management' },
  'employer.company':         { vi: 'Hồ sơ thương hiệu doanh nghiệp', en: 'Company Brand Profile' },
  'employer.employees':       { vi: 'Quản lý tài khoản thành viên', en: 'Team Members' },
  'employer.candidates':      { vi: 'Danh sách ứng viên tiềm năng hàng đầu', en: 'Top Talent Candidate List' },
  'employer.candidate-detail': { vi: 'Chi tiết hồ sơ ứng viên ứng tuyển', en: 'Candidate Profile Detail' },
  'employer.applied-profiles': { vi: 'Danh sách hồ sơ nộp ứng tuyển', en: 'Applied Candidate Profiles' },
  'employer.interviews':      { vi: 'Lịch phỏng vấn thông minh AI', en: 'AI Interview Schedules' },
  'employer.interview-detail': { vi: 'Chi tiết kết quả phỏng vấn AI', en: 'AI Interview Session Details' },
  'employer.interviews-create': { vi: 'Tạo lịch phỏng vấn AI tự động', en: 'Schedule AI Interview' },
  'employer.interviews-edit': { vi: 'Chỉnh sửa lịch phỏng vấn AI', en: 'Edit AI Interview' },
  'employer.interviews-session': { vi: 'Phiên phỏng vấn AI trực tuyến', en: 'AI Interview Session' },
  'employer.interviews-live': { vi: 'Phòng phỏng vấn AI trực tiếp', en: 'Live AI Interviews' },
  'employer.interviews-history': { vi: 'Lịch sử đánh giá phỏng vấn AI', en: 'AI Interview History' },
  'employer.saved-profiles':  { vi: 'Hồ sơ ứng viên đã lưu trữ', en: 'Saved Candidate Profiles' },
  'employer.question-bank':   { vi: 'Ngân hàng câu hỏi tuyển dụng', en: 'Recruitment Question Bank' },
  'employer.question-groups': { vi: 'Bộ nhóm câu hỏi phỏng vấn', en: 'Interview Question Sets' },
  'employer.verification':    { vi: 'Xác minh giấy phép doanh nghiệp', en: 'Company License Verification' },
  'employer.notifications':   { vi: 'Thông báo tuyển dụng & ứng viên', en: 'Employer Notifications' },
  'employer.hrm.employees':   { vi: 'Quản lý nhân sự nội bộ', en: 'Internal HR Employee Management' },
  'employer.hrm.departments': { vi: 'Quản lý phòng ban doanh nghiệp', en: 'Company Department Management' },
  'employer.hrm.leaves':      { vi: 'Quản lý lịch nghỉ phép nhân sự', en: 'Employee Leave Management' },
  'employer.hrm.onboarding':  { vi: 'Tiếp nhận nhân sự mới Onboarding', en: 'New Hire Onboarding' },
  'employer.hrm.contracts':   { vi: 'Quản lý hợp đồng lao động nhân viên', en: 'Employee Contract Management' },
  'employer.hrm.dashboard':   { vi: 'Bảng điều khiển nhân sự doanh nghiệp', en: 'Company HRM Dashboard' },
  'employer.hrm.org-chart':   { vi: 'Sơ đồ tổ chức nhân sự doanh nghiệp', en: 'Company Organizational Chart' },
  'employer.blog':            { vi: 'Cẩm nang & Kinh nghiệm tuyển dụng nhân sự', en: 'Recruitment & HR Insights Blog' },
  'employer.blog-create':     { vi: 'Viết bài chia sẻ tuyển dụng mới', en: 'Create Recruitment Article' },
  'employer.blog-edit':       { vi: 'Chỉnh sửa bài viết tuyển dụng', en: 'Edit Recruitment Article' },
  'employer.chat':            { vi: 'Hộp thư kết nối ứng viên', en: 'Candidate Messages' },
  'employer.pricing':         { vi: 'Bảng giá dịch vụ tuyển dụng & Đăng tin', en: 'Pricing Plans & Job Posting' },
  'employer.service':         { vi: 'Dịch vụ tuyển dụng nhân sự chuyên sâu', en: 'Recruitment Solutions & Services' },
  'employer.introduce':       { vi: 'Giới thiệu giải pháp tuyển dụng toàn diện', en: 'Comprehensive Recruitment Solution Overview' },
  'employer.faq':             { vi: 'Câu hỏi thường gặp dành cho doanh nghiệp', en: 'Employer Frequently Asked Questions' },
  'employer.agent-assistants': { vi: 'Trợ lý tuyển dụng AI AILA thông minh', en: 'AILA AI Hiring Assistant' },
  'employer.support':         { vi: 'Trung tâm trợ giúp & Hỗ trợ tuyển dụng', en: 'Help Center & Employer Support' },
  'employer.contact':         { vi: 'Liên hệ tư vấn giải pháp tuyển dụng', en: 'Contact Employer Solutions' },
  'employer.privacy-policy':  { vi: 'Chính sách bảo mật dành cho doanh nghiệp', en: 'Employer Privacy Policy' },
  'employer.terms-of-service': { vi: 'Điều khoản dịch vụ dành cho doanh nghiệp', en: 'Employer Terms of Service' },

  // Onboarding
  'onboarding.candidate':     { vi: 'Thiết lập hồ sơ ứng viên cá nhân', en: 'Candidate Onboarding Setup' },
  'onboarding.employer':      { vi: 'Thiết lập thông tin doanh nghiệp', en: 'Employer Onboarding Setup' },

  // Job seeker
  'dashboard':                { vi: 'Bảng điều khiển cá nhân', en: 'Candidate Dashboard' },
  'account':                  { vi: 'Quản lý tài khoản ứng viên', en: 'Account Settings' },
  'profile':                  { vi: 'Hồ sơ nghề nghiệp của tôi', en: 'My Career Profile' },
  'online-profile':           { vi: 'Hồ sơ trực tuyến chuyên nghiệp', en: 'Online Professional Profile' },
  'my-company':               { vi: 'Doanh nghiệp theo dõi của tôi', en: 'My Followed Companies' },
  'jobs':                     { vi: 'Tìm việc làm nhanh, việc làm mới nhất', en: 'Find Jobs Fast & Latest Openings' },
  'my-jobs':                  { vi: 'Danh sách việc làm đã lưu', en: 'Saved Jobs' },
  'my-interviews':            { vi: 'Lịch phỏng vấn của tôi', en: 'My Interviews' },
  'notifications':            { vi: 'Thông báo tuyển dụng & việc làm', en: 'Notifications' },
  'chat':                     { vi: 'Hộp thư kết nối nhà tuyển dụng', en: 'Messages' },

  // Public
  'companies':                { vi: 'Danh sách công ty & Nhà tuyển dụng hàng đầu', en: 'Top Companies & Employers Directory' },
  'about':                    { vi: 'Về chúng tôi - Nền tảng tuyển dụng InfoHR', en: 'About Us - InfoHR Platform' },
  'news':                     { vi: 'Tin tức thị trường & Cẩm nang nghề nghiệp', en: 'News & Career Insights Blog' },
  'blog':                     { vi: 'Tin tức thị trường & Cẩm nang nghề nghiệp', en: 'News & Career Insights Blog' },
  'contact':                  { vi: 'Liên hệ & Hỗ trợ người dùng', en: 'Contact & User Support' },
  'faq':                      { vi: 'Câu hỏi thường gặp cho người tìm việc', en: 'Frequently Asked Questions' },
  'privacy-policy':           { vi: 'Chính sách bảo mật thông tin người dùng', en: 'Privacy Policy' },
  'terms-of-service':         { vi: 'Điều khoản & Điều kiện sử dụng dịch vụ', en: 'Terms of Service' },
  'jobs-by-career':           { vi: 'Việc làm theo ngành nghề hấp dẫn nhất', en: 'Jobs by Industry & Career' },
  'jobs-by-city':             { vi: 'Việc làm mới nhất theo tỉnh thành', en: 'Jobs by City & Region' },
  'jobs-by-type':             { vi: 'Việc làm theo hình thức làm việc', en: 'Jobs by Contract Type' },
  'interview.room':           { vi: 'Phòng phỏng vấn AI trực tuyến AILA', en: 'AI Online Interview Room' },
  'interview.login':          { vi: 'Đăng nhập tham gia phỏng vấn AI', en: 'AI Interview Room Login' },
  'employer.reset-password':  { vi: 'Đặt lại mật khẩu nhà tuyển dụng', en: 'Employer Reset Password' },
  'error.forbidden':          { vi: 'Truy cập bị từ chối (403)', en: 'Access Forbidden (403)' },
};

// ─── Page Description Map (Unique, high-quality 120-155 char descriptions) ──

const PAGE_DESCRIPTIONS: Record<string, Record<SupportedLocale, string>> = {
  'home': {
    vi: 'InfoHR - Nền tảng tuyển dụng và tìm kiếm việc làm chất lượng cao hàng đầu Việt Nam. Kết nối ứng viên tài năng với các nhà tuyển dụng uy tín.',
    en: 'InfoHR - Leading high-quality recruitment and job search platform in Vietnam. Connecting top talent with reputable employers.',
  },
  'jobs': {
    vi: 'Tìm kiếm hàng nghìn việc làm mới nhất lương cao, đãi ngộ tốt từ các doanh nghiệp hàng đầu. Lọc theo ngành nghề, địa điểm và ứng tuyển nhanh chóng.',
    en: 'Find thousands of latest jobs with competitive salary and great benefits from top companies. Filter by career, location and apply easily.',
  },
  'companies': {
    vi: 'Danh sách các công ty, tập đoàn và nhà tuyển dụng uy tín hàng đầu tại Việt Nam. Khám phá văn hóa doanh nghiệp, chế độ đãi ngộ và cơ hội việc làm.',
    en: 'List of top reputable companies and employers in Vietnam. Explore company culture, benefits and latest job openings.',
  },
  'news': {
    vi: 'Cập nhật tin tức thị trường lao động, xu hướng tuyển dụng, bí quyết phỏng vấn và cẩm nang phát triển sự nghiệp toàn diện từ chuyên gia InfoHR.',
    en: 'Latest labor market news, recruitment trends, interview tips and career development handbook from InfoHR experts.',
  },
  'blog': {
    vi: 'Cập nhật tin tức thị trường lao động, xu hướng tuyển dụng, bí quyết phỏng vấn và cẩm nang phát triển sự nghiệp toàn diện từ chuyên gia InfoHR.',
    en: 'Latest labor market news, recruitment trends, interview tips and career development handbook from InfoHR experts.',
  },
  'jobs-by-career': {
    vi: 'Khám phá cơ hội việc làm theo ngành nghề: Xây dựng, Bất động sản, Thiết kế nội thất, Kiến trúc, Công nghệ thông tin và nhiều lĩnh vực hấp dẫn khác.',
    en: 'Explore career opportunities by industry: Construction, Real Estate, Interior Design, Architecture, IT, and more.',
  },
  'jobs-by-city': {
    vi: 'Tìm kiếm việc làm theo tỉnh thành: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Bình Dương và các khu vực kinh tế trọng điểm với mức lương hấp dẫn.',
    en: 'Search jobs by city: Hanoi, Ho Chi Minh City, Da Nang, Binh Duong and key economic regions with competitive salaries.',
  },
  'jobs-by-type': {
    vi: 'Tìm kiếm việc làm theo hình thức làm việc: Toàn thời gian (Full-time), Bán thời gian (Part-time), Thực tập sinh, Làm việc từ xa (Remote/Hybrid).',
    en: 'Search jobs by contract type: Full-time, Part-time, Internship, Remote and Hybrid positions.',
  },
  'employer.pricing': {
    vi: 'Bảng giá các gói dịch vụ đăng tin tuyển dụng, mở hồ sơ ứng viên và phỏng vấn tự động AI AILA. Giải pháp tối ưu chi phí tuyển dụng cho doanh nghiệp.',
    en: 'Pricing plans for job posting, resume search, and AI AILA automated interviews. Cost-effective hiring solutions for employers.',
  },
  'employer.candidates': {
    vi: 'Khám phá kho hồ sơ ứng viên tài năng chất lượng cao đã qua sàng lọc. Tìm kiếm và kết nối nhân sự phù hợp nhanh chóng cho doanh nghiệp.',
    en: 'Explore verified talent profiles. Find and connect with the right candidates quickly for your company.',
  },
  'employer.faq': {
    vi: 'Tổng hợp các câu hỏi thường gặp và hướng dẫn chi tiết dành cho Nhà tuyển dụng khi đăng tin, tìm hồ sơ và sử dụng tính năng phỏng vấn AI trên InfoHR.',
    en: 'Frequently asked questions and detailed guides for employers on posting jobs, searching candidates, and using AI interviews.',
  },
  'employer.support': {
    vi: 'Trung tâm trợ giúp và hỗ trợ kỹ thuật 24/7 dành cho Nhà tuyển dụng. Đội ngũ chuyên viên InfoHR luôn sẵn sàng đồng hành cùng doanh nghiệp.',
    en: '24/7 help center and technical support for employers. InfoHR specialist team is always ready to assist your hiring.',
  },
  'employer.register': {
    vi: 'Đăng ký tài khoản nhà tuyển dụng miễn phí trên InfoHR. Tiếp cận hàng triệu ứng viên tiềm năng và ứng dụng công nghệ AI vào quy trình tuyển dụng.',
    en: 'Register a free employer account on InfoHR. Reach millions of candidates and leverage AI technology in your hiring workflow.',
  },
  'employer.blog': {
    vi: 'Cẩm nang quản trị nhân sự, kinh nghiệm phỏng vấn, chiến lược thu hút nhân tài và giải pháp tối ưu hóa hiệu suất tuyển dụng cho doanh nghiệp.',
    en: 'HR management handbook, interview insights, talent acquisition strategies and recruitment optimization for businesses.',
  },
  'employer.introduce': {
    vi: 'Giới thiệu giải pháp tuyển dụng toàn diện InfoHR: Hệ sinh thái kết nối nhân tài, quản trị nhân sự HRM và phỏng vấn thông minh bằng trợ lý AI AILA.',
    en: 'Overview of InfoHR comprehensive hiring solutions: Talent matching, HRM platform, and AILA AI interview assistant.',
  },
  'employer.service': {
    vi: 'Các dịch vụ tuyển dụng chuyên sâu của InfoHR: Đăng tin tuyển dụng VIP, Săn đầu người Headhunting, và Phỏng vấn đánh giá năng lực ứng viên bằng AI.',
    en: 'Specialized recruitment services by InfoHR: VIP job posts, Headhunting, and AI-powered candidate skill assessment.',
  },
  'about': {
    vi: 'Giới thiệu về InfoHR - Sứ mệnh kiến tạo nền tảng tuyển dụng thông minh hàng đầu, mang lại giá trị bền vững cho người tìm việc và doanh nghiệp.',
    en: 'About InfoHR - Mission to create a leading smart recruitment platform, bringing sustainable value to job seekers and businesses.',
  },
  'contact': {
    vi: 'Liên hệ với InfoHR qua hotline, email hoặc trực tiếp tại văn phòng để được tư vấn và hỗ trợ nhanh chóng nhất về dịch vụ tuyển dụng.',
    en: 'Contact InfoHR via hotline, email or office visits for fastest advice and support on recruitment services.',
  },
  'faq': {
    vi: 'Giải đáp các câu hỏi thường gặp về cách tạo tài khoản, nộp hồ sơ xin việc, quy trình phỏng vấn online và các tính năng hỗ trợ tìm việc trên InfoHR.',
    en: 'Answers to frequently asked questions about creating accounts, applying for jobs, online interviews, and job search features.',
  },
  'privacy-policy': {
    vi: 'Chính sách bảo mật thông tin và quyền riêng tư của người dùng trên nền tảng InfoHR theo đúng tiêu chuẩn pháp luật và Nghị định 13/2023/NĐ-CP.',
    en: 'Privacy policy and user data protection on InfoHR platform in compliance with legal standards and regulations.',
  },
  'terms-of-service': {
    vi: 'Điều khoản dịch vụ và thỏa thuận sử dụng trên nền tảng InfoHR.vn. Quy định quyền và trách nhiệm của Người tìm việc và Nhà tuyển dụng.',
    en: 'Terms of service and user agreements on InfoHR.vn. Rights and responsibilities of Job Seekers and Employers.',
  },
};

// ─── Canonical path mapping for public routes ──────────────────────────────

const PAGE_CANONICAL_PATHS: Record<string, string> = {
  'home': '/',
  'jobs': '/viec-lam',
  'companies': '/cong-ty',
  'news': '/tin-tuc',
  'blog': '/tin-tuc',
  'about': '/ve-chung-toi',
  'contact': '/lien-he',
  'faq': '/cau-hoi-thuong-gap',
  'jobs-by-career': '/viec-lam-theo-nganh-nghe',
  'jobs-by-city': '/viec-lam-theo-tinh-thanh',
  'jobs-by-type': '/viec-lam-theo-hinh-thuc-lam-viec',
  'employer.pricing': '/nha-tuyen-dung/bao-gia',
  'employer.candidates': '/nha-tuyen-dung/danh-sach-ung-vien',
  'employer.faq': '/nha-tuyen-dung/cau-hoi-thuong-gap',
  'employer.support': '/nha-tuyen-dung/ho-tro',
  'employer.register': '/nha-tuyen-dung/register',
  'employer.blog': '/nha-tuyen-dung/blog-tuyen-dung',
  'employer.introduce': '/nha-tuyen-dung/gioi-thieu',
  'employer.service': '/nha-tuyen-dung/dich-vu',
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
 * Get a localized page description.
 */
export async function getPageDescription(key: string): Promise<string | undefined> {
  const locale = await getServerLocale();
  return PAGE_DESCRIPTIONS[key]?.[locale] ?? PAGE_DESCRIPTIONS[key]?.['vi'];
}

/**
 * Generate a Metadata object with localized title, unique description, and canonical URL.
 * Usage in page.tsx:
 *   export const generateMetadata = () => buildPageMetadata('employer.pricing');
 */
export async function buildPageMetadata(key: string, extra?: Partial<Metadata>): Promise<Metadata> {
  const pageTitle = await getPageTitle(key);
  const title = pageTitle || 'InfoHR';
  const rawDesc = (await getPageDescription(key)) || (typeof extra?.description === 'string' ? extra.description : undefined);
  const safeDescription = rawDesc ? (rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc) : undefined;
  const path = PAGE_CANONICAL_PATHS[key];
  const canonicalUrl = path ? `https://infohr.vn${path === '/' ? '' : path}` : undefined;

  return {
    title,
    ...(safeDescription && { description: safeDescription }),
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        ...(safeDescription && { description: safeDescription }),
        url: canonicalUrl,
        siteName: 'InfoHR',
        locale: 'vi_VN',
        type: 'website',
      },
    }),
    ...extra,
  };
}

export interface SeoMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  robots?: Metadata['robots'];
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
  robots,
}: SeoMetadataOptions): Metadata {
  const cleanPath = path === '/' ? '' : (path.startsWith('/') ? path : `/${path}`);
  const canonicalUrl = `https://infohr.vn${cleanPath}`;
  const fullImageUrl = image.startsWith('http') ? image : `https://infohr.vn${image.startsWith('/') ? '' : '/'}${image}`;

  // Ensure description is <= 160 characters
  const trimmedDesc = description.length > 160 ? description.slice(0, 157) + '...' : description;

  return {
    title,
    description: trimmedDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    ...(robots && { robots }),
    openGraph: {
      title,
      description: trimmedDesc,
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
