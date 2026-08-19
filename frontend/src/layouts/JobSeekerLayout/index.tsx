'use client';

import React from "react";
import { Box, CircularProgress, Container, Grid2 as Grid } from "@mui/material";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import Header from "../components/commons/Header";
import Footer from "../components/commons/Footer";
import CandidateSidebar from "@/views/components/jobSeekers/CandidateDashboard/CandidateSidebar";
import SpaContentTransition from "@/components/Commons/SpaContentTransition";
import { ROUTES, ROLES_NAME } from "@/configs/constants";
import { localizeRoutePath } from "@/configs/routeLocalization";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserInfo, setActiveWorkspace } from "@/redux/userSlice";
import tokenService from "@/services/tokenService";
import { canAccessJobSeekerPortal } from "@/utils/accessControl";

let hasVerifiedCandidateAuthGlobal = false;

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
  const { currentUser } = useAppSelector((state) => state.user);

  const [isAllowed, setIsAllowed] = React.useState(() => {
    return hasVerifiedCandidateAuthGlobal || Boolean(tokenService.getAccessTokenFromCookie() && currentUser);
  });

  React.useEffect(() => {
    let isMounted = true;

    const redirectTo = (path: string) => {
      window.location.replace(path);
    };

    const checkAuth = async () => {
      const token = tokenService.getAccessTokenFromCookie();
      const loginPath = localizeRoutePath(`/${ROUTES.AUTH.LOGIN}`, i18n.language);

      if (!token) {
        redirectTo(loginPath);
        return;
      }

      let user = currentUser;
      if (!user) {
        try {
          user = await dispatch(getUserInfo()).unwrap();
        } catch {
          redirectTo(loginPath);
          return;
        }
      }

      if (!canAccessJobSeekerPortal(user)) {
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
        redirectTo('/onboarding/candidate');
        return;
      }

      const jobSeekerWorkspace = (user.workspaces || []).find((workspace) => workspace.type === "job_seeker");
      if (jobSeekerWorkspace) {
        dispatch(setActiveWorkspace(jobSeekerWorkspace));
      }

      hasVerifiedCandidateAuthGlobal = true;
      if (isMounted) {
        setIsAllowed(true);
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [currentUser, dispatch, i18n.language]);

  if (!isAllowed) {
    return <AuthLoadingScreen />;
  }

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Persistent Header */}
      <Header />

      <Box sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Persistent Fixed Candidate Sidebar Menu */}
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
      <Box
        sx={{
          mt: 'auto',
          px: { xs: 2, sm: 5, md: 8, lg: 10 },
          py: { xs: 3, lg: 5 },
          color: "text.primary",
          bgcolor: "background.paper",
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
};

export default JobSeekerLayout;
