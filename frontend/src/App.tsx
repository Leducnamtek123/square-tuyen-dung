import "sweetalert2/dist/sweetalert2.min.css";
import "./App.css";
import * as React from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { getUserInfo } from "./redux/userSlice";
import { getAllConfig } from "./redux/configSlice";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { viVN } from "@mui/material/locale";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultTheme from "./themeConfigs/defaultTheme";
import AppRoutes from "./routes/AppRouter";
import Feedback from "./components/Feedback";
import ChatBot from "./components/ChatBot";
import ScrollToTop from "./components/ScrollToTop";
import { ROLES_NAME, ROUTES, AUTH_CONFIG } from "./configs/constants";
import { isAdminPortalPath } from "./configs/portalRouting";
import { GoogleOAuthProvider } from "@react-oauth/google";
import tokenService from "./services/tokenService";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const { isAllowVerifyEmail } = useAppSelector((state) => state.auth);
  const { isAuthenticated, currentUser, activeWorkspace } = useAppSelector((state) => state.user);

  const isAdminAccount = (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.ADMIN;
  const workspaceType = activeWorkspace?.type || null;
  const isEmployerWorkspace = workspaceType === "company";
  const isJobSeekerWorkspace = workspaceType === "job_seeker";

  const settings = {
    isAuthenticated: isAuthenticated && !!currentUser,
    isJobSeekerRole: !isAdminAccount && (isJobSeekerWorkspace || (!workspaceType && (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.JOB_SEEKER)),
    isEmployerRole: !isAdminAccount && (isEmployerWorkspace || (!workspaceType && ((currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.EMPLOYER || !!currentUser?.canAccessEmployerPortal))),
    isAdminRole: isAdminAccount,
    isAllowVerifyEmail: isAllowVerifyEmail,
  };
  const location = useLocation();
  const fullPathname = window.location.pathname || "/";
  const isAdminPortal = isAdminPortalPath(fullPathname);
  const isChatPage =
    location.pathname.startsWith(`/${ROUTES.JOB_SEEKER.CHAT}`) ||
    location.pathname.startsWith(`/${ROUTES.EMPLOYER.CHAT}`);
  const jobSeekerInterviewPrefix = `/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW.replace('/:id', '')}`;
  const isJobSeekerInterviewRoute =
    location.pathname === jobSeekerInterviewPrefix ||
    location.pathname.startsWith(`${jobSeekerInterviewPrefix}/`);
  const isInterviewPage =
    location.pathname.startsWith(`/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW}`) ||
    location.pathname.startsWith(`/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM}`) ||
    location.pathname.startsWith(`/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`) ||
    location.pathname.startsWith(`/${ROUTES.ADMIN.INTERVIEW_LIVE}`) ||
    location.pathname.startsWith(`/${ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', '')}`) ||
    location.pathname.startsWith(`/${ROUTES.ADMIN.INTERVIEW_SESSION.replace(':id', '')}`);
  const canShowChatBot =
    !isAdminPortal &&
    !isChatPage &&
    !isInterviewPage;

  const theme = React.useMemo(() => createTheme(defaultTheme as any, viVN), []);
  const routeFallback = (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
        fontSize: "0.95rem",
      }}
      aria-busy="true"
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #e1effe",
            borderTop: "3px solid #1a407d",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span>Đang tải...</span>
      </div>
    </div>
  );

  React.useEffect(() => {
    const finalizeLoader = () => {
      // Clear the HTML-level safety timeout (set in index.html)
      if ((window as any).__loaderSafetyTimer) {
        clearTimeout((window as any).__loaderSafetyTimer);
        (window as any).__loaderSafetyTimer = null;
      }
      const loader = document.getElementById("initial-loader");
      if (loader) {
        setIsInitializing(false);
        requestAnimationFrame(() => {
          loader.classList.add("fade-out");
          setTimeout(() => {
            loader.remove();
          }, 500);
        });
      } else {
        setIsInitializing(false);
      }
    };

    const initializeApp = async () => {
      if (isJobSeekerInterviewRoute) {
        finalizeLoader();
        return;
      }

      try {
        // Fire both requests truly in parallel (don't wait for one to start the other)
        const configPromise = dispatch(getAllConfig());
        const hasAccessToken = !!tokenService.getAccessTokenFromCookie();
        const userPromise = hasAccessToken ? dispatch(getUserInfo()) : null;
        await Promise.allSettled([configPromise, userPromise].filter(Boolean));
      } catch (err) {
        console.error("App initialization failed", err);
      } finally {
        finalizeLoader();
      }
    };

    initializeApp();
  }, [dispatch, isJobSeekerInterviewRoute]);

  // Throttled global error handler — max 1 toast per 3 seconds
  React.useEffect(() => {
    let lastErrorToast = 0;
    const THROTTLE_MS = 3000;

    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes("ResizeObserver")) return;
      const now = Date.now();
      if (now - lastErrorToast < THROTTLE_MS) return;
      lastErrorToast = now;
      toast.error(
        <div style={{ textAlign: "left" }}>
          <strong>Đã có lỗi xảy ra.</strong> Vui lòng thử lại sau.
        </div>,
        {
          autoClose: 8000,
          position: "top-right",
          closeOnClick: true,
          pauseOnHover: true,
        }
      );
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      const now = Date.now();
      if (now - lastErrorToast < THROTTLE_MS) return;
      lastErrorToast = now;
      toast.error(
        <div style={{ textAlign: "left" }}>
          <strong>Yêu cầu chưa thể xử lý.</strong> Vui lòng thử lại sau.
        </div>,
        { autoClose: 6000 }
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (isInitializing) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>
          <CssBaseline enableColorScheme />
          <React.Suspense fallback={routeFallback}>
            <AppRoutes settings={settings} />
          </React.Suspense>
          <ToastContainer autoClose={1300} />
          {!isChatPage && !isInterviewPage && (
            <>
              {isAuthenticated && <Feedback />}
            </>
          )}
          {canShowChatBot && <ChatBot />}
        </GoogleOAuthProvider>
      </ThemeProvider>
      <ScrollToTop />
    </ErrorBoundary>
  );
}

export default App;
