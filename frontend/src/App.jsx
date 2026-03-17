import "sweetalert2/dist/sweetalert2.min.css";

import "./App.css";

import * as React from "react";

import { useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

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

function App() {

  const dispatch = useDispatch();

  const [isInitializing, setIsInitializing] = React.useState(true);

  const { isAllowVerifyEmail } = useSelector((state) => state.auth);

  const { isAuthenticated, currentUser, activeWorkspace } = useSelector((state) => state.user);

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

  const theme = React.useMemo(() => createTheme(defaultTheme, viVN), []);
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
      Loading...
    </div>
  );

  React.useEffect(() => {

    const finalizeLoader = () => {
      const loader = document.getElementById("initial-loader");

      if (loader) {
        setIsInitializing(false);
        requestAnimationFrame(() => {
          loader.classList.add("fade-out");
          setTimeout(() => {
            loader.remove();
          }, 1200);
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
        const tasks = [dispatch(getAllConfig()).unwrap()];
        const hasAccessToken = !!tokenService.getAccessTokenFromCookie();
        if (hasAccessToken) {
          tasks.push(dispatch(getUserInfo()).unwrap());
        }
        await Promise.all(tasks);
        console.log("Init app successfully");
      } catch (err) {
        console.log(err);
      } finally {
        finalizeLoader();
      }

    };

    initializeApp();

  }, [dispatch, isJobSeekerInterviewRoute]);

  React.useEffect(() => {

    const handleError = (event) => {

      if (event.message?.includes("ResizeObserver")) return;

      const { message, filename, lineno, colno } = event;

      const fileName = filename ? filename.split("/").pop() : "unknown";

      toast.error(

        <div style={{ textAlign: "left" }}>

          <strong>Loi Runtime:</strong> {message}

          <div style={{ fontSize: "0.85em", marginTop: "4px", opacity: 0.8 }}>

            File: {fileName}:{lineno}:{colno}

          </div>

        </div>,

        {

          autoClose: 8000,

          position: "top-right",

          closeOnClick: true,

          pauseOnHover: true,

        }

      );

    };

    const handleRejection = (event) => {

      console.error("Unhandled Promise Rejection:", event.reason);

      toast.error(

        <div style={{ textAlign: "left" }}>

          <strong>Loi Promise (Async):</strong>{" "}

          {event.reason?.message || String(event.reason) || "Yeu cau that bai"}

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

    <>

      <ThemeProvider theme={theme}>

        <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>

          <CssBaseline enableColorScheme />
          <React.Suspense fallback={routeFallback}>
            <AppRoutes settings={settings} />
          </React.Suspense>
          {/* Start: toast */}

          <ToastContainer autoClose={1300} />

          {/* End: toast */}

          {/* Do not show feedback in chat or interview pages */}
          {!isChatPage && !isInterviewPage && (
            <>
              {/* Start: Feedback */}
              {isAuthenticated && <Feedback />}
              {/* End: Feedback */}
            </>
          )}

          {/* Start: ChatBot */}
          {canShowChatBot && <ChatBot />}
          {/* End: ChatBot */}
        </GoogleOAuthProvider>

      </ThemeProvider>

      <ScrollToTop />

    </>

  );

}

export default App;
