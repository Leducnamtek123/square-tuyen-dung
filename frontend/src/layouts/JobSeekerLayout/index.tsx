'use client';

import React from "react";
import { Box, CircularProgress, Container, Grid2 as Grid } from "@mui/material";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import DefaultLayout from "../DefaultLayout";
import Header from "../components/commons/Header";
import Footer from "../components/commons/Footer";
import CandidateSidebar from "@/views/components/jobSeekers/CandidateDashboard/CandidateSidebar";
import SpaContentTransition from "@/components/Common/SpaContentTransition";
import { ROUTES, ROLES_NAME } from "@/configs/constants";
import { localizeRoutePath } from "@/configs/routeLocalization";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserInfo, setActiveWorkspace } from "@/redux/userSlice";
import tokenService from "@/services/tokenService";
import { canAccessJobSeekerPortal } from "@/utils/accessControl";
import OnboardingProgressBanner from "@/views/onboardingPages/components/OnboardingProgressBanner";

let hasVerifiedCandidateAuthGlobal = false;

const isAdaptivePublicRoute = (path: string): boolean => {
  const cleanPath = path.replace(/^\/(vi|en)/, '');
  return (
    cleanPath === '/practice' ||
    cleanPath.startsWith('/practice/') ||
    cleanPath === '/luyen-phong-van' ||
    cleanPath.startsWith('/luyen-phong-van/') ||
    cleanPath === '/phong-van-thu' ||
    cleanPath.startsWith('/phong-van-thu/') ||
    cleanPath === '/salary' ||
    cleanPath.startsWith('/salary/') ||
    cleanPath === '/tra-cuu-luong' ||
    cleanPath.startsWith('/tra-cuu-luong/')
  );
};

function AuthLoadingScreen() {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={40} thickness={4} />
    </Box>
  );
}

const JobSeekerLayout = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname() || "/";
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation("common");
  const { currentUser, activeWorkspace } = useAppSelector((state) => state.user);

  const isAdaptive = isAdaptivePublicRoute(pathname);

  const [isAllowed, setIsAllowed] = React.useState(() => {
    if (currentUser?.isOnboarded === false) {
      return false;
    }
    if (isAdaptive) {
      if (typeof window !== 'undefined' && !tokenService.getAccessTokenFromCookie()) {
        return true;
      }
      return Boolean(
        hasVerifiedCandidateAuthGlobal ||
          (tokenService.getAccessTokenFromCookie() && currentUser)
      );
    }
    return Boolean(
      hasVerifiedCandidateAuthGlobal ||
        (tokenService.getAccessTokenFromCookie() && currentUser)
    );
  });

  const hasCheckedAuthRef = React.useRef(false);

  React.useEffect(() => {
    let isMounted = true;

    const redirectTo = (path: string) => {
      window.location.replace(path);
    };

    if (
      hasCheckedAuthRef.current &&
      hasVerifiedCandidateAuthGlobal &&
      currentUser &&
      canAccessJobSeekerPortal(currentUser)
    ) {
      const jobSeekerWorkspace = (currentUser.workspaces || []).find((workspace) => workspace.type === "job_seeker");
      if (jobSeekerWorkspace && activeWorkspace?.type !== "job_seeker") {
        dispatch(setActiveWorkspace(jobSeekerWorkspace));
      }
      return;
    }

    const checkAuth = async () => {
      const token = tokenService.getAccessTokenFromCookie();
      const loginPath = localizeRoutePath(`/${ROUTES.AUTH.LOGIN}`, i18n.language);

      if (!token) {
        if (isAdaptive) {
          if (isMounted) {
            setIsAllowed(true);
          }
          return;
        }
        redirectTo(loginPath);
        return;
      }

      let user = currentUser;
      if (!user) {
        try {
          user = await dispatch(getUserInfo()).unwrap();
        } catch {
          if (isAdaptive) {
            if (isMounted) {
              setIsAllowed(true);
            }
            return;
          }
          redirectTo(loginPath);
          return;
        }
      }

      if (!canAccessJobSeekerPortal(user)) {
        if (isAdaptive) {
          if (isMounted) {
            setIsAllowed(true);
          }
          return;
        }

        if (user?.roleName === ROLES_NAME.ADMIN) {
          redirectTo(localizeRoutePath(`/${ROUTES.ADMIN.DASHBOARD}`, i18n.language));
          return;
        }

        if (user?.roleName === ROLES_NAME.EMPLOYER || user?.canAccessEmployerPortal) {
          redirectTo(localizeRoutePath(`/${ROUTES.EMPLOYER.DASHBOARD}`, i18n.language));
          return;
        }

        redirectTo("/");
        return;
      }

      if (user?.isOnboarded === false && !pathname.includes('/onboarding')) {
        hasVerifiedCandidateAuthGlobal = false;
        redirectTo('/onboarding/candidate');
        return;
      }

      const jobSeekerWorkspace = (user?.workspaces || []).find((workspace) => workspace.type === "job_seeker");
      if (jobSeekerWorkspace && activeWorkspace?.type !== "job_seeker") {
        dispatch(setActiveWorkspace(jobSeekerWorkspace));
      }

      hasVerifiedCandidateAuthGlobal = true;
      hasCheckedAuthRef.current = true;
      if (isMounted) {
        setIsAllowed(true);
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspace?.type, currentUser, dispatch, i18n.language, isAdaptive, pathname]);

  const token = typeof window !== 'undefined' ? tokenService.getAccessTokenFromCookie() : null;
  const isGuestOrNonCandidate = !token || Boolean(currentUser && !canAccessJobSeekerPortal(currentUser));

  if (isAdaptive && isGuestOrNonCandidate) {
    return <DefaultLayout>{children}</DefaultLayout>;
  }

  if (!isAllowed) {
    return <AuthLoadingScreen />;
  }

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Persistent Header */}
      <Header />

      {/* Progressive Onboarding Banner for Incomplete Profiles */}
      <OnboardingProgressBanner role="candidate" />

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 1, sm: 2, md: 3 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
          <Grid container spacing={{ xs: 1.5, md: 3 }}>
            {/* Persistent Candidate Sidebar Menu */}
            <Grid size={{ xs: 12, md: 3.5, lg: 2.8 }}>
              <CandidateSidebar />
            </Grid>

            {/* Dynamic SPA Content Area with Animated Transition & Skeleton Loading */}
            <Grid size={{ xs: 12, md: 8.5, lg: 9.2 }}>
              <SpaContentTransition>
                {children}
              </SpaContentTransition>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Persistent Footer */}
      <Footer />
    </Box>
  );
};

export default JobSeekerLayout;
