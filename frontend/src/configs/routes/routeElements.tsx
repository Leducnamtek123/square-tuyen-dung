import { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  HomeLayout,
  DefaultLayout,
  JobSeekerLayout,
  EmployerLayout,
  ChatLayout,
  AdminLayout,
  FullscreenLayout,
} from "../../layouts";

const EmailVerificationRequiredPage = lazy(() => import("../../pages/authPages/EmailVerificationRequiredPage"));
const EmployerLogin = lazy(() => import("../../pages/authPages/EmployerLogin"));
const EmployerSignUp = lazy(() => import("../../pages/authPages/EmployerSignUp"));
const ForgotPasswordPage = lazy(() => import("../../pages/authPages/ForgotPasswordPage"));
const JobSeekerLogin = lazy(() => import("../../pages/authPages/JobSeekerLogin"));
const JobSeekerSignUp = lazy(() => import("../../pages/authPages/JobSeekerSignUp"));
const ResetPasswordPage = lazy(() => import("../../pages/authPages/ResetPasswordPage"));
const AdminLogin = lazy(() => import("../../pages/authPages/AdminLogin"));

const ChatPage = lazy(() => import("../../pages/chatPages/ChatPage"));

const AboutUsPage = lazy(() => import("../../pages/defaultPages/AboutUsPage"));
const CompanyDetailPage = lazy(() => import("../../pages/defaultPages/CompanyDetailPage"));
const CompanyPage = lazy(() => import("../../pages/defaultPages/CompanyPage"));
const HomePage = lazy(() => import("../../pages/defaultPages/HomePage"));
const JobDetailPage = lazy(() => import("../../pages/defaultPages/JobDetailPage"));
const JobPage = lazy(() => import("../../pages/defaultPages/JobPage"));
const JobsByCareerPage = lazy(() => import("../../pages/defaultPages/JobsByCareerPage"));
const JobsByCityPage = lazy(() => import("../../pages/defaultPages/JobsByCityPage"));
const JobsByJobTypePage = lazy(() => import("../../pages/defaultPages/JobsByJobTypePage"));
const NotificationPage = lazy(() => import("../../pages/defaultPages/NotificationPage"));

const AccountPage = lazy(() => import("../../pages/jobSeekerPages/AccountPage"));
const AttachedProfilePage = lazy(() => import("../../pages/jobSeekerPages/AttachedProfilePage"));
const DashboardPage = lazy(() => import("../../pages/jobSeekerPages/DashboardPage"));
const MyCompanyPage = lazy(() => import("../../pages/jobSeekerPages/MyCompanyPage"));
const ProjectPage = lazy(() => import("../../pages/jobSeekerPages/ProjectPage"));
const OnlineProfilePage = lazy(() => import("../../pages/jobSeekerPages/OnlineProfilePage"));
const ProfilePage = lazy(() => import("../../pages/jobSeekerPages/ProfilePage"));
const MyInterviewsPage = lazy(() => import("../../pages/jobSeekerPages/MyInterviewsPage"));

const EmployerAccountPage = lazy(() => import("../../pages/employerPages/AccountPage"));
const EmployerBlogPage = lazy(() => import("../../pages/employerPages/BlogPage"));
const EmployerCompanyPage = lazy(() => import("../../pages/employerPages/CompanyPage"));
const EmployerDashboardPage = lazy(() => import("../../pages/employerPages/DashboardPage"));
const EmployerIntroducePage = lazy(() => import("../../pages/employerPages/IntroducePage"));
const EmployerJobPostPage = lazy(() => import("../../pages/employerPages/JobPostPage"));
const EmployerPricingPage = lazy(() => import("../../pages/employerPages/PricingPage"));
const EmployerProfileAppliedPage = lazy(() => import("../../pages/employerPages/ProfileAppliedPage"));
const EmployerProfileDetailPage = lazy(() => import("../../pages/employerPages/ProfileDetailPage"));
const EmployerProfilePage = lazy(() => import("../../pages/employerPages/ProfilePage"));
const EmployerSavedProfilePage = lazy(() => import("../../pages/employerPages/SavedProfilePage"));
const EmployerServicePage = lazy(() => import("../../pages/employerPages/ServicePage"));
const EmployerSettingPage = lazy(() => import("../../pages/employerPages/SettingPage"));
const EmployerEmployeesPage = lazy(() => import("../../pages/employerPages/EmployeesPage"));
const EmployerSupportPage = lazy(() => import("../../pages/employerPages/SupportPage"));
const EmployerVerificationPage = lazy(() => import("../../pages/employerPages/VerificationPage"));

const EmployerInterviewListPage = lazy(() => import("../../pages/employerPages/InterviewPages/InterviewListPage"));
const EmployerInterviewLivePage = lazy(() => import("../../pages/employerPages/InterviewPages/InterviewLivePage"));
const EmployerInterviewCreatePage = lazy(() => import("../../pages/employerPages/InterviewPages/InterviewCreatePage"));
const EmployerInterviewDetailPage = lazy(() => import("../../pages/employerPages/InterviewPages/InterviewDetailPage"));
const EmployerQuestionBankPage = lazy(() => import("../../pages/employerPages/InterviewPages/QuestionBankPage"));
const EmployerQuestionGroupsPage = lazy(() => import("../../pages/employerPages/InterviewPages/QuestionGroupsPage"));
const EmployerInterviewSessionPage = lazy(() => import("../../pages/employerPages/InterviewPages/InterviewSessionPage"));

const ForbiddenPage = lazy(() => import("../../pages/errorsPage/ForbiddenPage"));
const NotFoundPage = lazy(() => import("../../pages/errorsPage/NotFoundPage"));

const AdminDashboardPage = lazy(() => import("../../pages/adminPages/DashboardPage"));
const AdminUsersPage = lazy(() => import("../../pages/adminPages/UsersPage"));
const AdminJobsPage = lazy(() => import("../../pages/adminPages/JobsPage"));
const AdminQuestionsPage = lazy(() => import("../../pages/adminPages/QuestionsPage"));
const AdminQuestionGroupsPage = lazy(() => import("../../pages/adminPages/QuestionGroupsPage"));
const AdminInterviewsPage = lazy(() => import("../../pages/adminPages/InterviewsPage"));
const AdminInterviewLivePage = lazy(() => import("../../pages/adminPages/InterviewLivePage"));
const AdminSettingsPage = lazy(() => import("../../pages/adminPages/SettingsPage"));
const AdminCareersPage = lazy(() => import("../../pages/adminPages/CareersPage"));
const AdminCitiesPage = lazy(() => import("../../pages/adminPages/CitiesPage"));
const AdminDistrictsPage = lazy(() => import("../../pages/adminPages/DistrictsPage"));
const AdminWardsPage = lazy(() => import("../../pages/adminPages/WardsPage"));
const AdminCompaniesPage = lazy(() => import("../../pages/adminPages/CompaniesPage"));
const AdminProfilesPage = lazy(() => import("../../pages/adminPages/ProfilesPage"));
const AdminResumesPage = lazy(() => import("../../pages/adminPages/ResumesPage"));
const AdminJobActivityPage = lazy(() => import("../../pages/adminPages/JobActivityPage"));
const AdminJobNotificationsPage = lazy(() => import("../../pages/adminPages/JobNotificationsPage"));
const AdminInterviewSessionPage = lazy(() => import("../../pages/adminPages/InterviewSessionPage"));

const JobSeekerInterviewLoginPage = lazy(() => import("../../pages/candidatePages/CandidateLoginPage"));
const InterviewRoomPage = lazy(() => import("../../pages/candidatePages/InterviewRoomPage"));
const VoiceAiInterviewRedirectPage = lazy(() => import("../../pages/candidatePages/VoiceAiInterviewRedirectPage"));

const EmployerJobPostRedirect = ({ path }: { path: string }) => <Navigate to={path} replace />;

export const routeLayouts = {
  Outlet,
  HomeLayout,
  DefaultLayout,
  JobSeekerLayout,
  EmployerLayout,
  ChatLayout,
  AdminLayout,
  FullscreenLayout,
};

export const routePages = {
  EmailVerificationRequiredPage,
  EmployerLogin,
  EmployerSignUp,
  ForgotPasswordPage,
  JobSeekerLogin,
  JobSeekerSignUp,
  ResetPasswordPage,
  AdminLogin,
  ChatPage,
  AboutUsPage,
  CompanyDetailPage,
  CompanyPage,
  HomePage,
  JobDetailPage,
  JobPage,
  JobsByCareerPage,
  JobsByCityPage,
  JobsByJobTypePage,
  NotificationPage,
  AccountPage,
  AttachedProfilePage,
  DashboardPage,
  MyCompanyPage,
  ProjectPage,
  OnlineProfilePage,
  ProfilePage,
  MyInterviewsPage,
  EmployerAccountPage,
  EmployerBlogPage,
  EmployerCompanyPage,
  EmployerDashboardPage,
  EmployerIntroducePage,
  EmployerJobPostPage,
  EmployerPricingPage,
  EmployerProfileAppliedPage,
  EmployerProfileDetailPage,
  EmployerProfilePage,
  EmployerSavedProfilePage,
  EmployerServicePage,
  EmployerSettingPage,
  EmployerEmployeesPage,
  EmployerSupportPage,
  EmployerVerificationPage,
  EmployerInterviewListPage,
  EmployerInterviewLivePage,
  EmployerInterviewCreatePage,
  EmployerInterviewDetailPage,
  EmployerQuestionBankPage,
  EmployerQuestionGroupsPage,
  EmployerInterviewSessionPage,
  ForbiddenPage,
  NotFoundPage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminJobsPage,
  AdminQuestionsPage,
  AdminQuestionGroupsPage,
  AdminInterviewsPage,
  AdminInterviewLivePage,
  AdminSettingsPage,
  AdminCareersPage,
  AdminCitiesPage,
  AdminDistrictsPage,
  AdminWardsPage,
  AdminCompaniesPage,
  AdminProfilesPage,
  AdminResumesPage,
  AdminJobActivityPage,
  AdminJobNotificationsPage,
  AdminInterviewSessionPage,
  JobSeekerInterviewLoginPage,
  InterviewRoomPage,
  VoiceAiInterviewRedirectPage,
};

export { EmployerJobPostRedirect };
