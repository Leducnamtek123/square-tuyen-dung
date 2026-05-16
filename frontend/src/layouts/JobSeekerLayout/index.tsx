'use client';

import React from "react";
import { Box, CircularProgress, Container } from "@mui/material";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import Header from "../components/commons/Header";
import TabBar from "../components/jobSeekers/TabBar";
import Footer from "../components/commons/Footer";
import { ROUTES, ROLES_NAME } from "@/configs/constants";
import { buildPortalPath } from "@/configs/portalRouting";
import { localizeRoutePath } from "@/configs/routeLocalization";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserInfo, setActiveWorkspace } from "@/redux/userSlice";
import tokenService from "@/services/tokenService";
import { canAccessJobSeekerPortal } from "@/utils/accessControl";

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
  const [isAllowed, setIsAllowed] = React.useState(false);

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
          redirectTo(buildPortalPath("admin", "/dashboard", i18n.language));
          return;
        }

        if (user?.roleName === ROLES_NAME.EMPLOYER || user?.canAccessEmployerPortal) {
          redirectTo(buildPortalPath("employer", "/dashboard", i18n.language));
          return;
        }

        redirectTo("/");
        return;
      }

      const jobSeekerWorkspace = (user.workspaces || []).find((workspace) => workspace.type === "job_seeker");
      if (jobSeekerWorkspace) {
        dispatch(setActiveWorkspace(jobSeekerWorkspace));
      }

      if (isMounted) {
        setIsAllowed(true);
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [currentUser, dispatch, i18n.language, pathname]);

  if (!isAllowed) {
    return <AuthLoadingScreen />;
  }

  return (

    <Box>

      <Header />

      <Box>

        <Container maxWidth="xl">

          <TabBar />

        </Container>

      </Box>

      <Container

        maxWidth="xl"

        sx={{

          my: {

            xs: 1.5,

            sm: 2,

            md: 3,

            lg: 3,

            xl: 3,

          },

          paddingLeft: { xs: 1, sm: 4, md: 6, lg: 8, xl: 8 },

          paddingRight: { xs: 1, sm: 4, md: 6, lg: 8, xl: 8 },

        }}

      >

        {children}

      </Container>

      <Box

        sx={{

          mt: {

            xs: 0,

            sm: 2,

            md: 6,

            lg: 8,

            xl: 10,

          },

          px: {

            xs: 1,

            sm: 5,

            md: 8,

            lg: 10,

            xl: 14,

          },

          py: {

            xs: 2,

            sm: 2,

            md: 2,

            lg: 5,

            xl: 5,

          },

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
