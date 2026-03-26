const fs = require('fs');
const path = require('path');

const APP_DIR = 'src/app';

// Helper: ensure directory exists and write page file
function createPage(routePath, component, importPath, options = {}) {
  const dir = path.join(APP_DIR, routePath);
  fs.mkdirSync(dir, { recursive: true });
  
  const dynamic = options.dynamic ? `\nimport dynamic from 'next/dynamic';\n\nconst ${component} = dynamic(\n  () => import('${importPath}'),\n  { ssr: false }\n);\n` : '';
  
  const importLine = options.dynamic ? '' : `import ${component} from '${importPath}';\n`;
  
  const code = `'use client';\n\n${dynamic || importLine}
export default function Page() {
  return <${component} />;
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), code);
  console.log(`Created: ${routePath}`);
}

// ============================================================
// Step 1: Remove ALL old Vietnamese route folders
// ============================================================
const oldDirs = [
  'bang-dieu-khien', 'cap-nhat-mat-khau', 'cong-ty', 'cong-ty-cua-toi',
  'dang-ky', 'dang-nhap', 'email-verification-required', 'ho-so',
  'ho-so-dinh-kem', 'ho-so-tung-buoc', 'ket-noi-voi-nha-tuyen-dung',
  'phong-van-cua-toi', 'quen-mat-khau', 'tai-khoan', 'thong-bao',
  've-chung-toi', 'viec-lam', 'viec-lam-cua-toi',
  'viec-lam-theo-hinh-thuc-lam-viec', 'viec-lam-theo-nganh-nghe',
  'viec-lam-theo-tinh-thanh',
];
oldDirs.forEach(d => {
  const p = path.join(APP_DIR, d);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true });
    console.log(`Removed: ${d}/`);
  }
});

// ============================================================
// Step 2: Job Seeker / Public Routes (English folders)
// ============================================================
console.log('\n--- Job Seeker / Public Routes ---');

// Auth
createPage('login', 'JobSeekerLogin', '@/views/authPages/JobSeekerLogin');
createPage('register', 'JobSeekerSignUp', '@/views/authPages/JobSeekerSignUp');
createPage('forgot-password', 'ForgotPasswordPage', '@/views/authPages/ForgotPasswordPage');
createPage('reset-password/[token]', 'ResetPasswordPage', '@/views/authPages/ResetPasswordPage');
createPage('email-verification-required', 'EmailVerificationRequiredPage', '@/views/authPages/EmailVerificationRequiredPage');

// Public pages
createPage('jobs', 'JobPage', '@/views/defaultPages/JobPage');
createPage('jobs/[slug]', 'JobDetailPage', '@/views/defaultPages/JobDetailPage');
createPage('companies', 'CompanyPage', '@/views/defaultPages/CompanyPage');
createPage('companies/[slug]', 'CompanyDetailPage', '@/views/defaultPages/CompanyDetailPage');
createPage('about-us', 'AboutUsPage', '@/views/defaultPages/AboutUsPage');
createPage('jobs-by-career', 'JobsByCareerPage', '@/views/defaultPages/JobsByCareerPage');
createPage('jobs-by-city', 'JobsByCityPage', '@/views/defaultPages/JobsByCityPage');
createPage('jobs-by-type', 'JobsByJobTypePage', '@/views/defaultPages/JobsByJobTypePage');
createPage('notifications', 'NotificationPage', '@/views/defaultPages/NotificationPage');

// Job Seeker authenticated
createPage('dashboard', 'DashboardPage', '@/views/jobSeekerPages/DashboardPage');
createPage('profile', 'ProfilePage', '@/views/jobSeekerPages/ProfilePage');
createPage('online-profile/[slug]', 'OnlineProfilePage', '@/views/jobSeekerPages/OnlineProfilePage');
createPage('attached-profile/[slug]', 'AttachedProfilePage', '@/views/jobSeekerPages/AttachedProfilePage', { dynamic: true });
createPage('my-jobs', 'ProjectPage', '@/views/jobSeekerPages/ProjectPage');
createPage('my-company', 'MyCompanyPage', '@/views/jobSeekerPages/MyCompanyPage');
createPage('my-interviews', 'MyInterviewsPage', '@/views/jobSeekerPages/MyInterviewsPage');
createPage('account', 'AccountPage', '@/views/jobSeekerPages/AccountPage');
createPage('chat', 'ChatPage', '@/views/chatPages/ChatPage');

// ============================================================
// Step 3: Employer Routes
// ============================================================
console.log('\n--- Employer Routes ---');

// Employer public
createPage('employer/introduce', 'IntroducePage', '@/views/employerPages/IntroducePage');
createPage('employer/service', 'ServicePage', '@/views/employerPages/ServicePage');
createPage('employer/pricing', 'PricingPage', '@/views/employerPages/PricingPage');
createPage('employer/support', 'SupportPage', '@/views/employerPages/SupportPage');
createPage('employer/blog', 'BlogPage', '@/views/employerPages/BlogPage');

// Employer auth
createPage('employer/login', 'EmployerLogin', '@/views/authPages/EmployerLogin');
createPage('employer/register', 'EmployerSignUp', '@/views/authPages/EmployerSignUp');
createPage('employer/forgot-password', 'ForgotPasswordPage', '@/views/authPages/ForgotPasswordPage');
createPage('employer/reset-password/[token]', 'ResetPasswordPage', '@/views/authPages/ResetPasswordPage');

// Employer dashboard (authenticated)
createPage('employer/dashboard', 'DashboardPage', '@/views/employerPages/DashboardPage');
createPage('employer/job-posts', 'JobPostPage', '@/views/employerPages/JobPostPage');
createPage('employer/applied-profiles', 'ProfileAppliedPage', '@/views/employerPages/ProfileAppliedPage');
createPage('employer/saved-profiles', 'SavedProfilePage', '@/views/employerPages/SavedProfilePage');
createPage('employer/candidates', 'ProfilePage', '@/views/employerPages/ProfilePage');
createPage('employer/candidates/[slug]', 'ProfileDetailPage', '@/views/employerPages/ProfileDetailPage');
createPage('employer/company', 'CompanyPage', '@/views/employerPages/CompanyPage');
createPage('employer/employees', 'EmployeesPage', '@/views/employerPages/EmployeesPage');
createPage('employer/notifications', 'NotificationPage', '@/views/defaultPages/NotificationPage');
createPage('employer/account', 'AccountPage', '@/views/employerPages/AccountPage');
createPage('employer/settings', 'SettingPage', '@/views/employerPages/SettingPage');
createPage('employer/verification', 'VerificationPage', '@/views/employerPages/VerificationPage');
createPage('employer/chat', 'ChatPage', '@/views/chatPages/ChatPage');

// Employer interviews
createPage('employer/interviews', 'InterviewListPage', '@/views/employerPages/InterviewPages/InterviewListPage');
createPage('employer/interviews/create', 'InterviewCreatePage', '@/views/employerPages/InterviewPages/InterviewCreatePage');
createPage('employer/interviews/[id]', 'InterviewDetailPage', '@/views/employerPages/InterviewPages/InterviewDetailPage');
createPage('employer/interviews/live', 'InterviewLivePage', '@/views/employerPages/InterviewPages/InterviewLivePage');
createPage('employer/interviews/session/[id]', 'InterviewSessionPage', '@/views/employerPages/InterviewPages/InterviewSessionPage');
createPage('employer/question-bank', 'QuestionBankPage', '@/views/employerPages/InterviewPages/QuestionBankPage');
createPage('employer/question-groups', 'QuestionGroupsPage', '@/views/employerPages/InterviewPages/QuestionGroupsPage');

// ============================================================
// Step 4: Admin Routes
// ============================================================
console.log('\n--- Admin Routes ---');

// Admin auth
createPage('admin/login', 'AdminLogin', '@/views/authPages/AdminLogin');
createPage('admin/forgot-password', 'ForgotPasswordPage', '@/views/authPages/ForgotPasswordPage');
createPage('admin/reset-password/[token]', 'ResetPasswordPage', '@/views/authPages/ResetPasswordPage');

// Admin dashboard (authenticated)
createPage('admin/dashboard', 'AdminDashboardPage', '@/views/adminPages/DashboardPage');
createPage('admin/users', 'UsersPage', '@/views/adminPages/UsersPage');
createPage('admin/companies', 'CompaniesPage', '@/views/adminPages/CompaniesPage');
createPage('admin/profiles', 'ProfilesPage', '@/views/adminPages/ProfilesPage');
createPage('admin/resumes', 'ResumesPage', '@/views/adminPages/ResumesPage');
createPage('admin/jobs', 'JobsPage', '@/views/adminPages/JobsPage');
createPage('admin/job-activity', 'JobActivityPage', '@/views/adminPages/JobActivityPage');
createPage('admin/questions', 'QuestionsPage', '@/views/adminPages/QuestionsPage');
createPage('admin/question-groups', 'QuestionGroupsPage', '@/views/adminPages/QuestionGroupsPage');
createPage('admin/interviews', 'InterviewsPage', '@/views/adminPages/InterviewsPage');
createPage('admin/interviews/live', 'InterviewLivePage', '@/views/adminPages/InterviewLivePage');
createPage('admin/interviews/session/[id]', 'InterviewSessionPage', '@/views/adminPages/InterviewsPage');
createPage('admin/job-notifications', 'JobNotificationsPage', '@/views/adminPages/JobNotificationsPage');
createPage('admin/settings', 'SettingsPage', '@/views/adminPages/SettingsPage');
createPage('admin/careers', 'CareersPage', '@/views/adminPages/CareersPage');
createPage('admin/cities', 'CitiesPage', '@/views/adminPages/CitiesPage');
createPage('admin/districts', 'DistrictsPage', '@/views/adminPages/DistrictsPage');
createPage('admin/wards', 'WardsPage', '@/views/adminPages/WardsPage');
createPage('admin/banners', 'BannersPage', '@/views/adminPages/BannersPage');
createPage('admin/feedbacks', 'FeedbacksPage', '@/views/adminPages/FeedbacksPage');
createPage('admin/chat', 'AdminChatPage', '@/views/adminPages/ChatPage');

// ============================================================
// Step 5: Interview Room Routes
// ============================================================
console.log('\n--- Interview Routes ---');
createPage('interview/login', 'CandidateLoginPage', '@/views/jobSeekerPages/CandidateLoginPage');
createPage('interview/[id]', 'InterviewRoomPage', '@/views/jobSeekerPages/InterviewRoomPage');

console.log('\n✅ All routes created successfully!');
