import { lazy } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { HOST_NAME, ROUTES } from "./constants";
import {
  HomeLayout,
  DefaultLayout,
  JobSeekerLayout,
  EmployerLayout,
  ChatLayout,
  AdminLayout,
  FullscreenLayout,
} from "../layouts";

const EmailVerificationRequiredPage = lazy(() => import("../pages/authPages/EmailVerificationRequiredPage"));
const EmployerLogin = lazy(() => import("../pages/authPages/EmployerLogin"));
const EmployerSignUp = lazy(() => import("../pages/authPages/EmployerSignUp"));
const ForgotPasswordPage = lazy(() => import("../pages/authPages/ForgotPasswordPage"));
const JobSeekerLogin = lazy(() => import("../pages/authPages/JobSeekerLogin"));
const JobSeekerSignUp = lazy(() => import("../pages/authPages/JobSeekerSignUp"));
const ResetPasswordPage = lazy(() => import("../pages/authPages/ResetPasswordPage"));
const AdminLogin = lazy(() => import("../pages/authPages/AdminLogin"));

const ChatPage = lazy(() => import("../pages/chatPages/ChatPage"));

const AboutUsPage = lazy(() => import("../pages/defaultPages/AboutUsPage"));
const CompanyDetailPage = lazy(() => import("../pages/defaultPages/CompanyDetailPage"));
const CompanyPage = lazy(() => import("../pages/defaultPages/CompanyPage"));
const HomePage = lazy(() => import("../pages/defaultPages/HomePage"));
const JobDetailPage = lazy(() => import("../pages/defaultPages/JobDetailPage"));
const JobPage = lazy(() => import("../pages/defaultPages/JobPage"));
const JobsByCareerPage = lazy(() => import("../pages/defaultPages/JobsByCareerPage"));
const JobsByCityPage = lazy(() => import("../pages/defaultPages/JobsByCityPage"));
const JobsByJobTypePage = lazy(() => import("../pages/defaultPages/JobsByJobTypePage"));
const NotificationPage = lazy(() => import("../pages/defaultPages/NotificationPage"));

const AccountPage = lazy(() => import("../pages/jobSeekerPages/AccountPage"));
const AttachedProfilePage = lazy(() => import("../pages/jobSeekerPages/AttachedProfilePage"));
const DashboardPage = lazy(() => import("../pages/jobSeekerPages/DashboardPage"));
const MyCompanyPage = lazy(() => import("../pages/jobSeekerPages/MyCompanyPage"));
const MyJobPage = lazy(() => import("../pages/jobSeekerPages/MyJobPage"));
const OnlineProfilePage = lazy(() => import("../pages/jobSeekerPages/OnlineProfilePage"));
const ProfilePage = lazy(() => import("../pages/jobSeekerPages/ProfilePage"));
const MyInterviewsPage = lazy(() => import("../pages/jobSeekerPages/MyInterviewsPage"));

const EmployerAccountPage = lazy(() => import("../pages/employerPages/AccountPage"));
const EmployerBlogPage = lazy(() => import("../pages/employerPages/BlogPage"));
const EmployerCompanyPage = lazy(() => import("../pages/employerPages/CompanyPage"));
const EmployerDashboardPage = lazy(() => import("../pages/employerPages/DashboardPage"));
const EmployerIntroducePage = lazy(() => import("../pages/employerPages/IntroducePage"));
const EmployerJobPostPage = lazy(() => import("../pages/employerPages/JobPostPage"));
const EmployerPricingPage = lazy(() => import("../pages/employerPages/PricingPage"));
const EmployerProfileAppliedPage = lazy(() => import("../pages/employerPages/ProfileAppliedPage"));
const EmployerProfileDetailPage = lazy(() => import("../pages/employerPages/ProfileDetailPage"));
const EmployerProfilePage = lazy(() => import("../pages/employerPages/ProfilePage"));
const EmployerSavedProfilePage = lazy(() => import("../pages/employerPages/SavedProfilePage"));
const EmployerServicePage = lazy(() => import("../pages/employerPages/ServicePage"));
const EmployerSettingPage = lazy(() => import("../pages/employerPages/SettingPage"));
const EmployerEmployeesPage = lazy(() => import("../pages/employerPages/EmployeesPage"));
const EmployerSupportPage = lazy(() => import("../pages/employerPages/SupportPage"));
const EmployerVerificationPage = lazy(() => import("../pages/employerPages/VerificationPage"));

const EmployerInterviewListPage = lazy(() => import("../pages/employerPages/InterviewPages/InterviewListPage"));
const EmployerInterviewLivePage = lazy(() => import("../pages/employerPages/InterviewPages/InterviewLivePage"));
const EmployerInterviewCreatePage = lazy(() => import("../pages/employerPages/InterviewPages/InterviewCreatePage"));
const EmployerInterviewDetailPage = lazy(() => import("../pages/employerPages/InterviewPages/InterviewDetailPage"));
const EmployerQuestionBankPage = lazy(() => import("../pages/employerPages/InterviewPages/QuestionBankPage"));
const EmployerQuestionGroupsPage = lazy(() => import("../pages/employerPages/InterviewPages/QuestionGroupsPage"));

const ForbiddenPage = lazy(() => import("../pages/errorsPage/ForbiddenPage"));
const NotFoundPage = lazy(() => import("../pages/errorsPage/NotFoundPage"));

const AdminDashboardPage = lazy(() => import("../pages/adminPages/DashboardPage"));
const AdminUsersPage = lazy(() => import("../pages/adminPages/UsersPage"));
const AdminJobsPage = lazy(() => import("../pages/adminPages/JobsPage"));
const AdminQuestionsPage = lazy(() => import("../pages/adminPages/QuestionsPage"));
const AdminQuestionGroupsPage = lazy(() => import("../pages/adminPages/QuestionGroupsPage"));
const AdminInterviewsPage = lazy(() => import("../pages/adminPages/InterviewsPage"));
const AdminInterviewLivePage = lazy(() => import("../pages/adminPages/InterviewLivePage"));
const AdminSettingsPage = lazy(() => import("../pages/adminPages/SettingsPage"));
const AdminCareersPage = lazy(() => import("../pages/adminPages/CareersPage"));
const AdminCitiesPage = lazy(() => import("../pages/adminPages/CitiesPage"));
const AdminDistrictsPage = lazy(() => import("../pages/adminPages/DistrictsPage"));
const AdminCompaniesPage = lazy(() => import("../pages/adminPages/CompaniesPage"));
const AdminProfilesPage = lazy(() => import("../pages/adminPages/ProfilesPage"));
const AdminResumesPage = lazy(() => import("../pages/adminPages/ResumesPage"));
const AdminJobActivityPage = lazy(() => import("../pages/adminPages/JobActivityPage"));
const AdminJobNotificationsPage = lazy(() => import("../pages/adminPages/JobNotificationsPage"));

const JobSeekerInterviewLoginPage = lazy(() => import("../pages/candidatePages/CandidateLoginPage"));
const InterviewRoomPage = lazy(() => import("../pages/candidatePages/InterviewRoomPage"));
const VoiceAiInterviewRedirectPage = lazy(() => import("../pages/candidatePages/VoiceAiInterviewRedirectPage"));
const EmployerInterviewSessionPage = lazy(() => import("../pages/employerPages/InterviewPages/InterviewSessionPage"));
const AdminInterviewSessionPage = lazy(() => import("../pages/adminPages/InterviewSessionPage"));

const routesConfig = {

  [HOST_NAME.MYJOB]: [

    {

      path: ROUTES.JOB_SEEKER.HOME,

      layouts: Outlet,

      children: [

        {

          layouts: HomeLayout,

          children: [

            {

              index: true,

              element: HomePage,

            },

          ],

        },

        {

          layouts: DefaultLayout,

          children: [

            {

              path: ROUTES.JOB_SEEKER.JOBS,

              element: JobPage,

            },

            {

              path: ROUTES.JOB_SEEKER.JOB_DETAIL,

              element: JobDetailPage,

            },

            {

              path: ROUTES.JOB_SEEKER.COMPANY,

              element: CompanyPage,

            },

            {

              path: ROUTES.JOB_SEEKER.COMPANY_DETAIL,

              element: CompanyDetailPage,

            },

            {

              path: ROUTES.JOB_SEEKER.ABOUT_US,

              element: AboutUsPage,

            },

            {

              path: ROUTES.JOB_SEEKER.JOBS_BY_CAREER,

              element: JobsByCareerPage,

            },

            {

              path: ROUTES.JOB_SEEKER.JOBS_BY_CITY,

              element: JobsByCityPage,

            },

            {

              path: ROUTES.JOB_SEEKER.JOBS_BY_TYPE,

              element: JobsByJobTypePage,

            },

          ],

        },

        {

          layouts: FullscreenLayout,

          children: [

            {

              path: ROUTES.JOBSEEKER_INTERVIEW.LOGIN,

              element: JobSeekerInterviewLoginPage,

            },

            {

              path: ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW,

              element: VoiceAiInterviewRedirectPage,

            },

            {

              path: ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM,

              element: InterviewRoomPage,

            },

          ],

        },

        {

          path: ROUTES.JOB_SEEKER.DASHBOARD,

          layouts: JobSeekerLayout,

          checkCondition: (settings) =>

            settings.isAuthenticated && settings.isJobSeekerRole,

          redirectUrl: "/" + ROUTES.AUTH.LOGIN,

          children: [

            {

              index: true,

              element: DashboardPage,

            },

            {

              path: ROUTES.JOB_SEEKER.PROFILE,

              element: ProfilePage,

            },

            {

              path: ROUTES.JOB_SEEKER.STEP_PROFILE,

              element: OnlineProfilePage,

            },

            {

              path: ROUTES.JOB_SEEKER.ATTACHED_PROFILE,

              element: AttachedProfilePage,

            },

            {

              path: ROUTES.JOB_SEEKER.MY_JOB,

              element: MyJobPage,

            },

            {

              path: ROUTES.JOB_SEEKER.MY_COMPANY,

              element: MyCompanyPage,

            },

            {

              path: ROUTES.JOB_SEEKER.MY_INTERVIEWS,

              element: MyInterviewsPage,

            },

            {

              path: ROUTES.JOB_SEEKER.NOTIFICATION,

              element: NotificationPage,

            },

            {

              path: ROUTES.JOB_SEEKER.ACCOUNT,

              element: AccountPage,

            },

          ],

        },

        {

          layouts: DefaultLayout,

          checkCondition: (settings) => !settings.isAuthenticated,

          redirectUrl: "/" + ROUTES.JOB_SEEKER.HOME,

          children: [

            {

              path: ROUTES.AUTH.EMAIL_VERIFICATION,

              checkCondition: (settings) => settings.isAllowVerifyEmail,

              redirectUrl: "/" + ROUTES.AUTH.LOGIN,

              element: EmailVerificationRequiredPage,

            },

            {

              path: ROUTES.AUTH.FORGOT_PASSWORD,

              element: ForgotPasswordPage,

            },

            {

              path: ROUTES.AUTH.RESET_PASSWORD,

              element: ResetPasswordPage,

            },

            {

              path: ROUTES.AUTH.LOGIN,

              element: JobSeekerLogin,

            },

            {

              path: ROUTES.AUTH.REGISTER,

              element: JobSeekerSignUp,

            },

          ],

        },

        {

          path: ROUTES.JOB_SEEKER.CHAT,

          layouts: ChatLayout,

          checkCondition: (settings) =>

            settings.isAuthenticated && settings.isJobSeekerRole,

          redirectUrl: "/" + ROUTES.AUTH.LOGIN,

          children: [

            {

              index: true,

              element: ChatPage,

            },

          ],

        },

      ],

    },

    {

      path: ROUTES.ERROR.FORBIDDEN,

      element: ForbiddenPage,

    },

    {

      path: ROUTES.ERROR.NOT_FOUND,

      element: NotFoundPage,

    },

  ],

  [HOST_NAME.EMPLOYER_MYJOB]: [
    {
      layouts: DefaultLayout,
      children: [
        {
          path: ROUTES.EMPLOYER.INTRODUCE,
          element: EmployerIntroducePage,
        },
        {
          path: ROUTES.EMPLOYER.SERVICE,
          element: EmployerServicePage,
        },
        {
          path: ROUTES.EMPLOYER.PRICING,
          element: EmployerPricingPage,
        },
        {
          path: ROUTES.EMPLOYER.SUPPORT,
          element: EmployerSupportPage,
        },
        {
          path: ROUTES.EMPLOYER.BLOG,
          element: EmployerBlogPage,
        },
      ],
    },
    {
      layouts: EmployerLayout,
      checkCondition: (settings) =>
        settings.isAuthenticated && settings.isEmployerRole,
      redirectUrl: ROUTES.AUTH.LOGIN,
      children: [

        {

          index: true,

          element: EmployerDashboardPage,

        },

        {

          path: ROUTES.EMPLOYER.JOB_POST,

          element: EmployerJobPostPage,

        },
        {
          path: ROUTES.JOB_SEEKER.JOBS,
          element: () => <Navigate to={`/${ROUTES.EMPLOYER.JOB_POST}`} replace />,
        },

        {

          path: ROUTES.EMPLOYER.APPLIED_PROFILE,

          element: EmployerProfileAppliedPage,

        },

        {

          path: ROUTES.EMPLOYER.SAVED_PROFILE,

          element: EmployerSavedProfilePage,

        },

        {
          path: ROUTES.EMPLOYER.PROFILE,
          element: EmployerProfilePage,
        },
        {
          path: ROUTES.EMPLOYER.PROFILE_DETAIL,
          element: EmployerProfileDetailPage,
        },
        {

          path: ROUTES.EMPLOYER.INTERVIEW_LIST,

          element: EmployerInterviewListPage,
        },
        {
          path: ROUTES.EMPLOYER.INTERVIEW_CREATE,
          element: EmployerInterviewCreatePage,

        },

        {

          path: ROUTES.EMPLOYER.INTERVIEW_LIVE,

          element: EmployerInterviewLivePage,

        },
        {
          path: ROUTES.EMPLOYER.INTERVIEW_SESSION,
          element: EmployerInterviewSessionPage,
        },

        {

          path: ROUTES.EMPLOYER.QUESTION_BANK,

          element: EmployerQuestionBankPage,

        },

        {

          path: ROUTES.EMPLOYER.QUESTION_GROUPS,

          element: EmployerQuestionGroupsPage,

        },

        {

          path: ROUTES.EMPLOYER.INTERVIEW_DETAIL,

          element: EmployerInterviewDetailPage,

        },

        {

          path: ROUTES.EMPLOYER.NOTIFICATION,

          element: NotificationPage,

        },

        {

          path: ROUTES.EMPLOYER.COMPANY,

          element: EmployerCompanyPage,

        },

        {

          path: ROUTES.EMPLOYER.ACCOUNT,

          element: EmployerAccountPage,

        },

        {

          path: ROUTES.EMPLOYER.VERIFICATION,

          element: EmployerVerificationPage,

        },

        {

          path: ROUTES.EMPLOYER.SETTING,

          element: EmployerSettingPage,

        },
        {
          path: ROUTES.EMPLOYER.EMPLOYEES,
          element: EmployerEmployeesPage,
        },

      ],

    },

    {

      layouts: DefaultLayout,

      children: [

        {

          path: ROUTES.AUTH.LOGIN,

          element: EmployerLogin,

          checkCondition: (settings) =>

            !settings.isAuthenticated || !settings.isEmployerRole,

          redirectUrl: "/",

        },

        {

          path: ROUTES.AUTH.FORGOT_PASSWORD,

          element: ForgotPasswordPage,

        },

        {

          path: ROUTES.AUTH.RESET_PASSWORD,

          element: ResetPasswordPage,

        },

        {

          path: ROUTES.AUTH.REGISTER,

          element: EmployerSignUp,

          checkCondition: (settings) => !settings.isAuthenticated,

          redirectUrl: "/",

        },

      ],

    },

    {

      path: ROUTES.EMPLOYER.CHAT,

      layouts: ChatLayout,

      checkCondition: (settings) =>

        settings.isAuthenticated && settings.isEmployerRole,

      redirectUrl: "/dang-nhap",

      children: [

        {

          index: true,

          element: ChatPage,

        },

      ],

    },

    {

      path: ROUTES.ERROR.NOT_FOUND,

      element: NotFoundPage,

    },

  ],

  [HOST_NAME.ADMIN_MYJOB]: [

    {

      layouts: AdminLayout,

      checkCondition: (settings) =>

        settings.isAuthenticated && settings.isAdminRole,

      redirectUrl: ROUTES.AUTH.LOGIN,

      children: [

        {

          index: true,

          element: AdminDashboardPage,

        },

        {

          path: ROUTES.ADMIN.USERS,

          element: AdminUsersPage,

        },

        {

          path: ROUTES.ADMIN.COMPANIES,

          element: AdminCompaniesPage,

        },

        {

          path: ROUTES.ADMIN.PROFILES,

          element: AdminProfilesPage,

        },

        {

          path: ROUTES.ADMIN.RESUMES,

          element: AdminResumesPage,

        },

        {

          path: ROUTES.ADMIN.JOBS,

          element: AdminJobsPage,

        },

        {

          path: ROUTES.ADMIN.JOB_ACTIVITY,

          element: AdminJobActivityPage,

        },

        {

          path: ROUTES.ADMIN.QUESTIONS,

          element: AdminQuestionsPage,

        },

        {

          path: ROUTES.ADMIN.QUESTION_GROUPS,

          element: AdminQuestionGroupsPage,

        },

        {

          path: ROUTES.ADMIN.INTERVIEWS,

          element: AdminInterviewsPage,

        },

        {

          path: ROUTES.ADMIN.INTERVIEW_LIVE,

          element: AdminInterviewLivePage,

        },
        {
          path: ROUTES.ADMIN.INTERVIEW_SESSION,
          element: AdminInterviewSessionPage,
        },

        {

          path: ROUTES.ADMIN.JOB_NOTIFICATIONS,

          element: AdminJobNotificationsPage,

        },

        {

          path: ROUTES.ADMIN.SETTINGS,

          element: AdminSettingsPage,

        },

        {

          path: ROUTES.ADMIN.CAREERS,

          element: AdminCareersPage,

        },

        {

          path: ROUTES.ADMIN.CITIES,

          element: AdminCitiesPage,

        },

        {

          path: ROUTES.ADMIN.DISTRICTS,

          element: AdminDistrictsPage,

        },

      ],

    },

    {

      layouts: DefaultLayout,

      children: [

        {

          path: ROUTES.AUTH.LOGIN,

          element: AdminLogin,

          checkCondition: (settings) =>

            !settings.isAuthenticated || !settings.isAdminRole,

          redirectUrl: "/",

        },

        {

          path: ROUTES.AUTH.FORGOT_PASSWORD,

          element: ForgotPasswordPage,

        },

        {

          path: ROUTES.AUTH.RESET_PASSWORD,

          element: ResetPasswordPage,

        },

      ],

    },

    {

      path: ROUTES.ERROR.FORBIDDEN,

      element: ForbiddenPage,

    },

    {

      path: ROUTES.ERROR.NOT_FOUND,

      element: NotFoundPage,

    },

  ],

};

export default routesConfig;
