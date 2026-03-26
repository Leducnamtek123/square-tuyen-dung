'use client';

import "sweetalert2/dist/sweetalert2.min.css";
import * as React from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getUserInfo } from "../redux/userSlice";
import { getAllConfig } from "../redux/configSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Feedback from "../components/Features/Feedback";
import ChatBot from "../components/Features/ChatBot";
import ScrollToTop from "../components/Common/ScrollToTop";
import { ROLES_NAME, ROUTES, AUTH_CONFIG } from "../configs/constants";
import { isAdminPortalPath } from "../configs/portalRouting";
import { GoogleOAuthProvider } from "@react-oauth/google";
import tokenService from "../services/tokenService";
import ErrorBoundary from "../components/ErrorBoundary";

export default function ClientAppRoot({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  const dispatch = useAppDispatch();
  const hasCachedConfig = useAppSelector((state) => !!state.config.allConfig);
  const [isInitializing, setIsInitializing] = React.useState(!hasCachedConfig);
  const { isAuthenticated, currentUser, activeWorkspace } = useAppSelector((state) => state.user);

  // Prevent hydration mismatch: render nothing until client has mounted
  React.useEffect(() => { setHasMounted(true); }, []);

  const isAdminAccount = (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.ADMIN;
  const workspaceType = activeWorkspace?.type || null;
  const isEmployerWorkspace = workspaceType === "company";
  const isJobSeekerWorkspace = workspaceType === "job_seeker";

  const pathname = usePathname() || "/";
  const isAdminPortal = isAdminPortalPath(pathname);
  const isChatPage =
    pathname.startsWith(`/${ROUTES.JOB_SEEKER.CHAT}`) ||
    pathname.startsWith(`/${ROUTES.EMPLOYER.CHAT}`);
  const jobSeekerInterviewPrefix = `/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW.replace('/:id', '')}`;
  const isJobSeekerInterviewRoute =
    pathname === jobSeekerInterviewPrefix ||
    pathname.startsWith(`${jobSeekerInterviewPrefix}/`);
  const isInterviewPage =
    pathname.startsWith(`/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW}`) ||
    pathname.startsWith(`/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM}`) ||
    pathname.startsWith(`/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`) ||
    pathname.startsWith(`/${ROUTES.ADMIN.INTERVIEW_LIVE}`) ||
    pathname.startsWith(`/${ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', '')}`) ||
    pathname.startsWith(`/${ROUTES.ADMIN.INTERVIEW_SESSION.replace(':id', '')}`);
  
  const canShowChatBot = !isAdminPortal && !isChatPage && !isInterviewPage;

  React.useEffect(() => {
    const initializeApp = async () => {
      let unmounted = false;
      if (isJobSeekerInterviewRoute) {
        setIsInitializing(false);
        return;
      }
      if (hasCachedConfig) {
        setIsInitializing(false);
      }
      try {
        const configPromise = dispatch(getAllConfig());
        const hasAccessToken = !!tokenService.getAccessTokenFromCookie();
        const userPromise = hasAccessToken ? dispatch(getUserInfo()) : null;
        const promises = [configPromise, userPromise].filter(Boolean);
        await Promise.all(promises.map(p => Promise.resolve(p).catch(e => e)));
      } catch (err) {
        console.error("App initialization failed", err);
      } finally {
        if (!hasCachedConfig && !unmounted) {
          setIsInitializing(false);
        }
      }
      return () => { unmounted = true; };
    };

    initializeApp();
  }, [dispatch, isJobSeekerInterviewRoute, hasCachedConfig]);

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

  if (!hasMounted || isInitializing) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>
          {children}
          <ToastContainer autoClose={1300} />
          {!isChatPage && !isInterviewPage && (
            <>
              {isAuthenticated && <Feedback />}
            </>
          )}
          {canShowChatBot && <ChatBot />}
      </GoogleOAuthProvider>
      <ScrollToTop />
    </ErrorBoundary>
  );
}
