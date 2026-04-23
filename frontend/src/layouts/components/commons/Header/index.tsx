import * as React from "react";
import { useAppSelector } from '@/redux/hooks';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import { useTheme } from "@mui/material/styles";

import { AppBar, Box, Container, Divider, IconButton, Stack, Toolbar, useMediaQuery } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import { HOST_NAME, IMAGES, ROUTES } from "../../../../configs/constants";

import LeftDrawer from "../LeftDrawer";

import AccountSwitchMenu from "../AccountSwitchMenu";
import WorkspaceSwitchMenu from "../WorkspaceSwitchMenu";

const NotificationCard = React.lazy(() => import("../../../../components/Features/NotificationCard"));
const ChatCard = React.lazy(() => import("../../../../components/Features/ChatCard"));

import LanguageSwitcher from "../LanguageSwitcher";
import { isAdminPortalPath, isEmployerPortalPath } from "../../../../configs/portalRouting";
import { localizeRoutePath } from "../../../../configs/routeLocalization";
import HeaderNavLinks from "./HeaderNavLinks";
import HeaderAuthArea from "./HeaderAuthArea";

interface HeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

const Header = (_props: HeaderProps) => {

  const { t, i18n } = useTranslation('common');

  const pages = React.useMemo(() => ({

    [HOST_NAME.PROJECT]: [
      { id: '1', label: t('nav.jobs'), path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language) },
      { id: '2', label: t('nav.companies'), path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.COMPANY}`, i18n.language) },
      { id: '3', label: t('nav.aboutUs'), path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.ABOUT_US}`, i18n.language) },
    ],
    [HOST_NAME.EMPLOYER_PROJECT]: [
      { id: '1', label: t('nav.introduction'), path: `/${ROUTES.EMPLOYER.INTRODUCE}` },
      { id: '2', label: t('nav.services'), path: `/${ROUTES.EMPLOYER.SERVICE}` },
      { id: '3', label: t('nav.pricing'), path: `/${ROUTES.EMPLOYER.PRICING}` },
      { id: '4', label: t('nav.support'), path: `/${ROUTES.EMPLOYER.SUPPORT}` },
      { id: '5', label: t('nav.blog'), path: `/${ROUTES.EMPLOYER.BLOG}` },
    ],
  }), [t, i18n.language]);

  const theme = useTheme();

  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const pathname = usePathname();

  const hostName = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const fullPathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isAdminPortal =
    isAdminPortalPath(fullPathname) ||
    hostName === HOST_NAME.ADMIN_PROJECT;
  const isEmployerPortal =
    isEmployerPortalPath(fullPathname) ||
    hostName === HOST_NAME.EMPLOYER_PROJECT;

  const currentPortalHost = isAdminPortal
    ? HOST_NAME.ADMIN_PROJECT
    : isEmployerPortal
      ? HOST_NAME.EMPLOYER_PROJECT
      : HOST_NAME.PROJECT;

  const nav = useRouter();

  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {

    setMobileOpen((prevState) => !prevState);

  };

  const handleCloseNavMenu = () => {
    void 0;
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {

    setAnchorElUser(event.currentTarget);

  };

  const handleCloseUserMenu = () => {

    setAnchorElUser(null);

  };

  const handleLogin = () => {
    if (isAdminPortal) {
      nav.push(`/${ROUTES.ADMIN_AUTH.LOGIN}`);
      return;
    }
    if (isEmployerPortal) {
      nav.push(`/${ROUTES.EMPLOYER_AUTH.LOGIN}`);
      return;
    }
    nav.push(`/${ROUTES.AUTH.LOGIN}`);

  };

  const handleSignUp = () => {

    if (isAdminPortal) return;
    if (isEmployerPortal) {
      nav.push(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`);
      return;
    }
    nav.push(`/${ROUTES.AUTH.REGISTER}`);

  };

  return (

    <>

      <AppBar
        position="sticky"
        id="common-header"
        sx={{
          boxShadow: '0 2px 20px rgba(15, 57, 127, 0.35)',
          background: 'linear-gradient(135deg, #1e6bb8 0%, #1a407d 45%, #0f2d5e 100%)',
        }}
      >

        <Container maxWidth="xl">

          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 }, overflow: 'hidden' }}>

            {/* ── Mobile: Hamburger icon TRƯỚC logo (chuẩn MUI) ── */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            {/* ── Logo ── */}
            <Box
              component={Link}
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                flexShrink: { xs: 1, md: 0 },
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={IMAGES.getTextLogo("light")}
                alt="Square Logo"
                sx={{
                  height: { xs: 28, md: 34 },
                  width: 'auto',
                  maxWidth: { xs: 120, sm: 160, md: 'none' },
                  display: 'block',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
              />
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              variant="middle"
              sx={{
                mx: 1.5,
                borderColor: "rgba(255,255,255,0.3)",
                display: { xs: "none", md: "flex" },
              }}
            />

            {/* ── Desktop: nav links (flex grow) ── */}
            <HeaderNavLinks
              pages={pages[currentPortalHost] || []}
              activePathname={pathname}
              onClose={handleCloseNavMenu}
            />

            {/* ── Mobile: spacer để đẩy icons sang phải ── */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }} />

            {/* ── Right side: icons + auth ── */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.5, sm: 1, md: 2 }}
            >
              {/* LanguageSwitcher: visible on all screen sizes */}
              <LanguageSwitcher />

              {isAuthenticated && <WorkspaceSwitchMenu />}

              {/* Notification + Chat: chỉ hiện từ sm trở lên trên mobile */}
              {isAuthenticated && (
                <React.Suspense fallback={<Box width={40} height={40} />}>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <NotificationCard />
                  </Box>
                </React.Suspense>
              )}
              {isAuthenticated && (
                <React.Suspense fallback={<Box width={40} height={40} />}>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <ChatCard />
                  </Box>
                </React.Suspense>
              )}

              {/* Auth buttons — hide on xs when not authenticated (available in drawer) */}
              {!isAdminPortal && (
                <Box sx={{ display: isAuthenticated ? 'flex' : { xs: 'none', sm: 'flex' } }}>
                  <HeaderAuthArea
                    isAuthenticated={isAuthenticated}
                    currentUserName={currentUser?.fullName}
                    currentUserAvatarUrl={currentUser?.avatarUrl ?? undefined}
                    anchorElUser={anchorElUser}
                    onOpenUserMenu={handleOpenUserMenu}
                    onCloseUserMenu={handleCloseUserMenu}
                    onLogin={handleLogin}
                    onSignUp={handleSignUp}
                  />
                </Box>
              )}

              {!isSmall && !isAuthenticated && !isAdminPortal && (
                <>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ mx: 0.5, height: 24, alignSelf: 'center', borderColor: "rgba(255, 255, 255, 0.3)" }}
                  />
                  <AccountSwitchMenu />
                </>
              )}
            </Stack>

          </Toolbar>

        </Container>

      </AppBar>

      <Box component="nav">

        <LeftDrawer

          pages={pages[currentPortalHost] || []}
          showPublicActions={!isAdminPortal}

          mobileOpen={mobileOpen}

          handleDrawerToggle={handleDrawerToggle}

        />

      </Box>

    </>

  );

};

export default Header;
