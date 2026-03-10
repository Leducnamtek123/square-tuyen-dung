/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import { Outlet } from "react-router-dom";
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
import {
  EmailVerificationRequiredPage,
  EmployerLogin,
  EmployerSignUp,
  ForgotPasswordPage,
  JobSeekerLogin,
  JobSeekerSignUp,
  ResetPasswordPage,
  AdminLogin,
} from "../pages/authPages";
import { ChatPage } from "../pages/chatPages";
import {
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
} from "../pages/defaultPages";
import {
  AccountPage,
  AttachedProfilePage,
  DashboardPage,
  MyCompanyPage,
  MyJobPage,
  OnlineProfilePage,
  ProfilePage,
  MyInterviewsPage,
} from "../pages/jobSeekerPages";
import {
  AccountPage as EmployerAccountPage,
  CompanyPage as EmployerCompanyPage,
  DashboardPage as EmployerDashboardPage,
  JobPostPage as EmployerJobPostPage,
  ProfileAppliedPage as EmployerProfileAppliedPage,
  ProfileDetailPage as EmployerProfileDetailPage,
  ProfilePage as EmployerProfilePage,
  SavedProfilePage as EmployerSavedProfilePage,
  SettingPage as EmployerSettingPage,
  VerificationPage as EmployerVerificationPage,
} from "../pages/employerPages";
import {
  InterviewListPage as EmployerInterviewListPage,
  InterviewCreatePage as EmployerInterviewCreatePage,
  InterviewDetailPage as EmployerInterviewDetailPage,
  QuestionBankPage as EmployerQuestionBankPage,
  QuestionGroupsPage as EmployerQuestionGroupsPage,
} from "../pages/employerPages/InterviewPages";
import {
  ForbiddenPage,
  NotFoundPage,
} from "../pages/errorsPage";
import {
  DashboardPage as AdminDashboardPage,
  UsersPage as AdminUsersPage,
  JobsPage as AdminJobsPage,
  QuestionsPage as AdminQuestionsPage,
  QuestionGroupsPage as AdminQuestionGroupsPage,
  InterviewsPage as AdminInterviewsPage,
  SettingsPage as AdminSettingsPage,
  CareersPage as AdminCareersPage,
  CitiesPage as AdminCitiesPage,
  DistrictsPage as AdminDistrictsPage,
  CompaniesPage as AdminCompaniesPage,
  ProfilesPage as AdminProfilesPage,
  ResumesPage as AdminResumesPage,
  JobActivityPage as AdminJobActivityPage,
  JobNotificationsPage as AdminJobNotificationsPage,
} from "../pages/adminPages";
import {
  CandidateLoginPage,
  InterviewRoomPage,
  VoiceAiInterviewRedirectPage,
} from "../pages/candidatePages";

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
              path: ROUTES.CANDIDATE.LOGIN,
              element: CandidateLoginPage,
            },
            {
              path: ROUTES.CANDIDATE.INTERVIEW,
              element: VoiceAiInterviewRedirectPage,
            },
            {
              path: ROUTES.CANDIDATE.INTERVIEW_ROOM,
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
          path: ROUTES.EMPLOYER.INTERVIEW_LIST,
          element: EmployerInterviewListPage,
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
