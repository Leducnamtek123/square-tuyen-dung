import { ROUTES } from "../constants";
import { routeLayouts, routePages, EmployerJobPostRedirect } from "./routeElements";
import type { RouteSettings } from "./routeTypes";

const { DefaultLayout, EmployerLayout, ChatLayout } = routeLayouts;

const {
  EmployerIntroducePage,
  EmployerServicePage,
  EmployerPricingPage,
  EmployerSupportPage,
  EmployerBlogPage,
  EmployerDashboardPage,
  EmployerJobPostPage,
  EmployerProfileAppliedPage,
  EmployerSavedProfilePage,
  EmployerProfilePage,
  EmployerProfileDetailPage,
  EmployerInterviewListPage,
  EmployerInterviewCreatePage,
  EmployerInterviewLivePage,
  EmployerInterviewSessionPage,
  EmployerQuestionBankPage,
  EmployerQuestionGroupsPage,
  EmployerInterviewDetailPage,
  NotificationPage,
  EmployerCompanyPage,
  EmployerAccountPage,
  EmployerVerificationPage,
  EmployerSettingPage,
  EmployerEmployeesPage,
  EmployerLogin,
  ForgotPasswordPage,
  ResetPasswordPage,
  EmployerSignUp,
  ChatPage,
  NotFoundPage,
} = routePages;

const employerRoutes = [
  {
    layouts: DefaultLayout,
    children: [
      { path: ROUTES.EMPLOYER.INTRODUCE, element: EmployerIntroducePage },
      { path: ROUTES.EMPLOYER.SERVICE, element: EmployerServicePage },
      { path: ROUTES.EMPLOYER.PRICING, element: EmployerPricingPage },
      { path: ROUTES.EMPLOYER.SUPPORT, element: EmployerSupportPage },
      { path: ROUTES.EMPLOYER.BLOG, element: EmployerBlogPage },
    ],
  },
  {
    layouts: EmployerLayout,
    checkCondition: (settings: RouteSettings) =>
      settings.isAuthenticated && settings.isEmployerRole,
    redirectUrl: "/" + ROUTES.EMPLOYER_AUTH.LOGIN,
    children: [
      { index: true, element: EmployerDashboardPage },
      { path: ROUTES.EMPLOYER.JOB_POST, element: EmployerJobPostPage },
      {
        path: ROUTES.JOB_SEEKER.JOBS,
        element: () => <EmployerJobPostRedirect path={`/${ROUTES.EMPLOYER.JOB_POST}`} />,
      },
      { path: ROUTES.EMPLOYER.APPLIED_PROFILE, element: EmployerProfileAppliedPage },
      { path: ROUTES.EMPLOYER.SAVED_PROFILE, element: EmployerSavedProfilePage },
      { path: ROUTES.EMPLOYER.PROFILE, element: EmployerProfilePage },
      { path: ROUTES.EMPLOYER.PROFILE_DETAIL, element: EmployerProfileDetailPage },
      { path: ROUTES.EMPLOYER.INTERVIEW_LIST, element: EmployerInterviewListPage },
      { path: ROUTES.EMPLOYER.INTERVIEW_CREATE, element: EmployerInterviewCreatePage },
      { path: ROUTES.EMPLOYER.INTERVIEW_LIVE, element: EmployerInterviewLivePage },
      { path: ROUTES.EMPLOYER.INTERVIEW_SESSION, element: EmployerInterviewSessionPage },
      { path: ROUTES.EMPLOYER.QUESTION_BANK, element: EmployerQuestionBankPage },
      { path: ROUTES.EMPLOYER.QUESTION_GROUPS, element: EmployerQuestionGroupsPage },
      { path: ROUTES.EMPLOYER.INTERVIEW_DETAIL, element: EmployerInterviewDetailPage },
      { path: ROUTES.EMPLOYER.NOTIFICATION, element: NotificationPage },
      { path: ROUTES.EMPLOYER.COMPANY, element: EmployerCompanyPage },
      { path: ROUTES.EMPLOYER.ACCOUNT, element: EmployerAccountPage },
      { path: ROUTES.EMPLOYER.VERIFICATION, element: EmployerVerificationPage },
      { path: ROUTES.EMPLOYER.SETTING, element: EmployerSettingPage },
      { path: ROUTES.EMPLOYER.EMPLOYEES, element: EmployerEmployeesPage },
    ],
  },
  {
    layouts: DefaultLayout,
    children: [
      {
        path: ROUTES.EMPLOYER_AUTH.LOGIN,
        element: EmployerLogin,
        checkCondition: (settings: RouteSettings) =>
          !settings.isAuthenticated || !settings.isEmployerRole,
        redirectUrl: "/",
      },
      { path: ROUTES.EMPLOYER_AUTH.FORGOT_PASSWORD, element: ForgotPasswordPage },
      { path: ROUTES.EMPLOYER_AUTH.RESET_PASSWORD, element: ResetPasswordPage },
      {
        path: ROUTES.EMPLOYER_AUTH.REGISTER,
        element: EmployerSignUp,
        checkCondition: (settings: RouteSettings) => !settings.isAuthenticated,
        redirectUrl: "/",
      },
    ],
  },
  {
    path: ROUTES.EMPLOYER.CHAT,
    layouts: ChatLayout,
    checkCondition: (settings: RouteSettings) =>
      settings.isAuthenticated && settings.isEmployerRole,
    redirectUrl: "/" + ROUTES.EMPLOYER_AUTH.LOGIN,
    children: [{ index: true, element: ChatPage }],
  },
  { path: ROUTES.ERROR.NOT_FOUND, element: NotFoundPage },
];

export default employerRoutes;
