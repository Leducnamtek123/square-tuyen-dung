'use client';

import "sweetalert2/dist/sweetalert2.min.css";
import * as React from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getUserInfo, removeUserInfo } from "../redux/userSlice";
import { useConfig } from "@/hooks/useConfig";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatBot from "../components/Features/ChatBot";
import ScrollToTop from "../components/Common/ScrollToTop";
import { ROUTES, AUTH_CONFIG } from "../configs/constants";
import { isAdminPortalPath } from "../configs/portalRouting";
import { GoogleOAuthProvider } from "@react-oauth/google";
import tokenService from "../services/tokenService";
import ErrorBoundary from "../components/ErrorBoundary";
import MaintenanceModeScreen from "../components/Common/MaintenanceModeScreen";
import {
  MAINTENANCE_MODE_CODE,
  MAINTENANCE_MODE_EVENT,
  getMaintenanceModeDetail,
  isMaintenanceModeError,
  notifyMaintenanceMode,
  type MaintenanceModeDetail,
} from "../utils/maintenanceMode";

export default function ClientAppRoot({ children }: { children: React.ReactNode }) {
  const hasMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const dispatch = useAppDispatch();
  const { allConfig, isLoadingConfig, errorConfig } = useConfig();
  const [maintenanceDetail, setMaintenanceDetail] =
    React.useState<MaintenanceModeDetail | null>(null);
  const configMaintenanceDetail = getMaintenanceModeDetail(errorConfig);
  const effectiveMaintenanceDetail = maintenanceDetail ?? configMaintenanceDetail;
  const hasCachedConfig = !!allConfig;
  const { currentUser } = useAppSelector((state) => state.user);

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
    pathname.startsWith(`/${ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', '')}`);
  
  const canShowChatBot = !isAdminPortal && !isChatPage && !isInterviewPage;
  const isMaintenanceMode =
    !!effectiveMaintenanceDetail || !!allConfig?.systemSettings?.maintenanceMode;
  const shouldShowMaintenanceMode = isMaintenanceMode && !isAdminPortal;
  const isInitializing =
    !shouldShowMaintenanceMode &&
    !isJobSeekerInterviewRoute &&
    !hasCachedConfig &&
    isLoadingConfig;

  React.useEffect(() => {
    if (!hasMounted || isJobSeekerInterviewRoute) return;
    if (currentUser?.id) return;
    if (isAdminPortal || pathname.startsWith('/employer') || pathname.startsWith('/nha-tuyen-dung')) return;
    const hasAccessToken = !!tokenService.getAccessTokenFromCookie();
    if (!hasAccessToken) return;

    dispatch(getUserInfo()).unwrap().catch(() => {
      // Ignore stale/invalid token errors at bootstrap.
    });
  }, [currentUser?.id, dispatch, hasMounted, isAdminPortal, isJobSeekerInterviewRoute, pathname]);

  React.useEffect(() => {
    if (isAdminPortal && maintenanceDetail) {
      setMaintenanceDetail(null);
    }
  }, [isAdminPortal, maintenanceDetail]);

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
      if (isMaintenanceModeError(event.reason)) {
        notifyMaintenanceMode(event.reason);
        return;
      }

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

    const handleAuthExpired = () => {
      dispatch(removeUserInfo({ accessToken: '' }));
    };

    const handleMaintenanceMode = (event: Event) => {
      setMaintenanceDetail(
        (event as CustomEvent<MaintenanceModeDetail>).detail ?? {
          code: MAINTENANCE_MODE_CODE,
          status: 503,
        },
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("auth:expired", handleAuthExpired as EventListener);
    window.addEventListener(MAINTENANCE_MODE_EVENT, handleMaintenanceMode as EventListener);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("auth:expired", handleAuthExpired as EventListener);
      window.removeEventListener(MAINTENANCE_MODE_EVENT, handleMaintenanceMode as EventListener);
    };
  }, [dispatch]);

  if (hasMounted && shouldShowMaintenanceMode) {
    return <MaintenanceModeScreen detail={effectiveMaintenanceDetail} />;
  }

  if (!hasMounted || isInitializing) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>
          {children}
          <ToastContainer autoClose={1300} transition={Bounce} position="top-right" theme="colored" />
          {canShowChatBot && <ChatBot />}
      </GoogleOAuthProvider>
      <ScrollToTop />
    </ErrorBoundary>
  );
}
