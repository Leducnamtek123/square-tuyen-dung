import { ROUTES } from "../constants";
import { routeLayouts, routePages } from "./routeElements";
import type { RouteSettings } from "./routeTypes";

const { AdminLayout, DefaultLayout } = routeLayouts;

const {
  AdminDashboardPage,
  AdminUsersPage,
  AdminCompaniesPage,
  AdminProfilesPage,
  AdminResumesPage,
  AdminJobsPage,
  AdminJobActivityPage,
  AdminQuestionsPage,
  AdminQuestionGroupsPage,
  AdminInterviewsPage,
  AdminInterviewLivePage,
  AdminInterviewSessionPage,
  AdminJobNotificationsPage,
  AdminSettingsPage,
  AdminCareersPage,
  AdminCitiesPage,
  AdminDistrictsPage,
  AdminWardsPage,
  AdminBannersPage,
  AdminFeedbacksPage,
  AdminLogin,
  ForgotPasswordPage,
  ResetPasswordPage,
  ForbiddenPage,
  NotFoundPage,
} = routePages;

const adminRoutes = [
  {
    layouts: AdminLayout,
    checkCondition: (settings: RouteSettings) => settings.isAuthenticated && settings.isAdminRole,
    redirectUrl: "/" + ROUTES.ADMIN_AUTH.LOGIN,
    children: [
      { index: true, element: AdminDashboardPage },
      { path: ROUTES.ADMIN.USERS, element: AdminUsersPage },
      { path: ROUTES.ADMIN.COMPANIES, element: AdminCompaniesPage },
      { path: ROUTES.ADMIN.PROFILES, element: AdminProfilesPage },
      { path: ROUTES.ADMIN.RESUMES, element: AdminResumesPage },
      { path: ROUTES.ADMIN.JOBS, element: AdminJobsPage },
      { path: ROUTES.ADMIN.JOB_ACTIVITY, element: AdminJobActivityPage },
      { path: ROUTES.ADMIN.QUESTIONS, element: AdminQuestionsPage },
      { path: ROUTES.ADMIN.QUESTION_GROUPS, element: AdminQuestionGroupsPage },
      { path: ROUTES.ADMIN.INTERVIEWS, element: AdminInterviewsPage },
      { path: ROUTES.ADMIN.INTERVIEW_LIVE, element: AdminInterviewLivePage },
      { path: ROUTES.ADMIN.INTERVIEW_SESSION, element: AdminInterviewSessionPage },
      { path: ROUTES.ADMIN.JOB_NOTIFICATIONS, element: AdminJobNotificationsPage },
      { path: ROUTES.ADMIN.SETTINGS, element: AdminSettingsPage },
      { path: ROUTES.ADMIN.CAREERS, element: AdminCareersPage },
      { path: ROUTES.ADMIN.CITIES, element: AdminCitiesPage },
      { path: ROUTES.ADMIN.DISTRICTS, element: AdminDistrictsPage },
      { path: ROUTES.ADMIN.WARDS, element: AdminWardsPage },
      { path: ROUTES.ADMIN.BANNERS, element: AdminBannersPage },
      { path: ROUTES.ADMIN.FEEDBACKS, element: AdminFeedbacksPage },
    ],
  },
  {
    layouts: DefaultLayout,
    children: [
      {
        path: ROUTES.ADMIN_AUTH.LOGIN,
        element: AdminLogin,
        checkCondition: (settings: RouteSettings) =>
          !settings.isAuthenticated || !settings.isAdminRole,
        redirectUrl: "/",
      },
      { path: ROUTES.ADMIN_AUTH.FORGOT_PASSWORD, element: ForgotPasswordPage },
      { path: ROUTES.ADMIN_AUTH.RESET_PASSWORD, element: ResetPasswordPage },
    ],
  },
  { path: ROUTES.ERROR.FORBIDDEN, element: ForbiddenPage },
  { path: ROUTES.ERROR.NOT_FOUND, element: NotFoundPage },
];

export default adminRoutes;
