/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import "sweetalert2/src/sweetalert2.scss";

import "./App.css";

import * as React from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from "./redux/userSlice";
import { getAllConfig } from "./redux/configSlice";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { viVN } from "@mui/material/locale";

// toast
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// theme
import defaultTheme from "./themeConfigs/defaultTheme";
import { ConfigProvider } from "antd";

// routes
import AppRoutes from "./routes/AppRouter";

// chatbot
import Feedback from "./components/Feedback";
import ScrollToTop from "./components/ScrollToTop";
import { ROLES_NAME, ROUTES, AUTH_CONFIG } from "./configs/constants";
import { GoogleOAuthProvider } from "@react-oauth/google";
function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const { isAllowVerifyEmail } = useSelector((state) => state.auth);
  const { isAuthenticated, currentUser } = useSelector((state) => state.user);
  const settings = {
    isAuthenticated: isAuthenticated && !!currentUser,
    isJobSeekerRole: (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.JOB_SEEKER,
    isEmployerRole: (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.EMPLOYER,
    isAdminRole: (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.ADMIN,
    isAllowVerifyEmail: isAllowVerifyEmail,
  };
  const location = useLocation();

  const theme = React.useMemo(() => createTheme(defaultTheme, viVN), []);

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([
          dispatch(getUserInfo()).unwrap(),
          dispatch(getAllConfig()).unwrap(),
        ]);
        console.log("Init app successfully");
      } catch (err) {
        console.log(err);
      } finally {
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
      }
    };

    initializeApp();
  }, [dispatch]);

  React.useEffect(() => {
    const handleError = (event) => {
      // Ignore some noise
      if (event.message?.includes('ResizeObserver')) return;

      const { message, filename, lineno, colno } = event;
      const fileName = filename ? filename.split('/').pop() : 'unknown';
      toast.error(
        <div style={{ textAlign: 'left' }}>
          <strong>Lỗi Runtime:</strong> {message}
          <div style={{ fontSize: '0.85em', marginTop: '4px', opacity: 0.8 }}>
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
      console.error('Unhandled Promise Rejection:', event.reason);
      toast.error(
        <div style={{ textAlign: 'left' }}>
          <strong>Lỗi Promise (Async):</strong> {event.reason?.message || String(event.reason) || 'Yêu cầu thất bại'}
        </div>,
        { autoClose: 6000 }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // When initializing, render nothing because the loading HTML is already displayed
  if (isInitializing) {
    return null;
  }

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#1976d2",
          },
        }}
      >
        <ThemeProvider theme={theme}>
          <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>
            <CssBaseline enableColorScheme />
            <AppRoutes settings={settings} />
            {/* Start: toast */}
            <ToastContainer autoClose={1300} />
            {/* End: toast */}

            {/* Do not show feedback and chatbot in chat pages */}
            {!location.pathname.startsWith(`/${ROUTES.JOB_SEEKER.CHAT}`) &&
              !location.pathname.startsWith(`/${ROUTES.EMPLOYER.CHAT}`) && (
                <>
                  {/* Start: Feedback */}
                  {isAuthenticated && <Feedback />}
                  {/* End: Feedback */}
                </>
              )}
          </GoogleOAuthProvider>
        </ThemeProvider>
      </ConfigProvider>
      <ScrollToTop />
    </>
  );
}

export default App;
