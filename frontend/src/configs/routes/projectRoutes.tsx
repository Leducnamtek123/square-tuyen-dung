import { ROUTES } from "../constants";
import { routeLayouts, routePages } from "./routeElements";
import type { RouteSettings } from "./routeTypes";

const {
  Outlet,
  HomeLayout,
  DefaultLayout,
  JobSeekerLayout,
  ChatLayout,
  FullscreenLayout,
} = routeLayouts;

const {
  HomePage,
  JobPage,
  JobDetailPage,
  CompanyPage,
  CompanyDetailPage,
  AboutUsPage,
  JobsByCareerPage,
  JobsByCityPage,
  JobsByJobTypePage,
  JobSeekerInterviewLoginPage,
  VoiceAiInterviewRedirectPage,
  InterviewRoomPage,
  DashboardPage,
  ProfilePage,
  OnlineProfilePage,
  AttachedProfilePage,
  ProjectPage,
  MyCompanyPage,
  MyInterviewsPage,
  NotificationPage,
  AccountPage,
  EmailVerificationRequiredPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  JobSeekerLogin,
  JobSeekerSignUp,
  ChatPage,
  ForbiddenPage,
  NotFoundPage,
} = routePages;

const projectRoutes = [
  {
    path: ROUTES.JOB_SEEKER.HOME,
    layouts: Outlet,
    children: [
      {
        layouts: HomeLayout,
        children: [{ index: true, element: HomePage }],
      },
      {
        layouts: DefaultLayout,
        children: [
          { path: ROUTES.JOB_SEEKER.JOBS, element: JobPage },
          { path: ROUTES.JOB_SEEKER.JOB_DETAIL, element: JobDetailPage },
          { path: ROUTES.JOB_SEEKER.COMPANY, element: CompanyPage },
          { path: ROUTES.JOB_SEEKER.COMPANY_DETAIL, element: CompanyDetailPage },
          { path: ROUTES.JOB_SEEKER.ABOUT_US, element: AboutUsPage },
          { path: ROUTES.JOB_SEEKER.JOBS_BY_CAREER, element: JobsByCareerPage },
          { path: ROUTES.JOB_SEEKER.JOBS_BY_CITY, element: JobsByCityPage },
          { path: ROUTES.JOB_SEEKER.JOBS_BY_TYPE, element: JobsByJobTypePage },
        ],
      },
      {
        layouts: FullscreenLayout,
        children: [
          { path: ROUTES.JOBSEEKER_INTERVIEW.LOGIN, element: JobSeekerInterviewLoginPage },
          { path: ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW, element: VoiceAiInterviewRedirectPage },
          { path: ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM, element: InterviewRoomPage },
        ],
      },
      {
        path: ROUTES.JOB_SEEKER.DASHBOARD,
        layouts: JobSeekerLayout,
        checkCondition: (settings: RouteSettings) =>
          settings.isAuthenticated && settings.isJobSeekerRole,
        redirectUrl: "/" + ROUTES.AUTH.LOGIN,
        children: [
          { index: true, element: DashboardPage },
          { path: ROUTES.JOB_SEEKER.PROFILE, element: ProfilePage },
          { path: ROUTES.JOB_SEEKER.STEP_PROFILE, element: OnlineProfilePage },
          { path: ROUTES.JOB_SEEKER.ATTACHED_PROFILE, element: AttachedProfilePage },
          { path: ROUTES.JOB_SEEKER.MY_JOB, element: ProjectPage },
          { path: ROUTES.JOB_SEEKER.MY_COMPANY, element: MyCompanyPage },
          { path: ROUTES.JOB_SEEKER.MY_INTERVIEWS, element: MyInterviewsPage },
          { path: ROUTES.JOB_SEEKER.NOTIFICATION, element: NotificationPage },
          { path: ROUTES.JOB_SEEKER.ACCOUNT, element: AccountPage },
        ],
      },
      {
        layouts: DefaultLayout,
        checkCondition: (settings: RouteSettings) => !settings.isAuthenticated,
        redirectUrl: "/" + ROUTES.JOB_SEEKER.HOME,
        children: [
          {
            path: ROUTES.AUTH.EMAIL_VERIFICATION,
            checkCondition: (settings: RouteSettings) => settings.isAllowVerifyEmail,
            redirectUrl: "/" + ROUTES.AUTH.LOGIN,
            element: EmailVerificationRequiredPage,
          },
          { path: ROUTES.AUTH.FORGOT_PASSWORD, element: ForgotPasswordPage },
          { path: ROUTES.AUTH.RESET_PASSWORD, element: ResetPasswordPage },
          { path: ROUTES.AUTH.LOGIN, element: JobSeekerLogin },
          { path: ROUTES.AUTH.REGISTER, element: JobSeekerSignUp },
        ],
      },
      {
        path: ROUTES.JOB_SEEKER.CHAT,
        layouts: ChatLayout,
        checkCondition: (settings: RouteSettings) =>
          settings.isAuthenticated && settings.isJobSeekerRole,
        redirectUrl: "/" + ROUTES.AUTH.LOGIN,
        children: [{ index: true, element: ChatPage }],
      },
      {
        path: ROUTES.EMPLOYER.CHAT,
        layouts: ChatLayout,
        checkCondition: (settings: RouteSettings) =>
          settings.isAuthenticated && settings.isEmployerRole,
        redirectUrl: "/" + ROUTES.AUTH.LOGIN,
        children: [{ index: true, element: ChatPage }],
      },
    ],
  },
  { path: ROUTES.ERROR.FORBIDDEN, element: ForbiddenPage },
  { path: ROUTES.ERROR.NOT_FOUND, element: NotFoundPage },
];

export default projectRoutes;

