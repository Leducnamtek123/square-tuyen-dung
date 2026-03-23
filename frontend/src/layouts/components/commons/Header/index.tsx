import * as React from "react";
import { useAppSelector } from '@/redux/hooks';

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from 'react-i18next';

import { useTheme } from "@mui/material/styles";

import { AppBar, Avatar, Box, Button, Card, Container, Divider, IconButton, Stack, Toolbar, Typography, useMediaQuery } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import { HOST_NAME, IMAGES, ROUTES } from "../../../../configs/constants";

import UserMenu from "../UserMenu";

import LeftDrawer from "../LeftDrawer";

import AccountSwitchMenu from "../AccountSwitchMenu";
import WorkspaceSwitchMenu from "../WorkspaceSwitchMenu";

import NotificationCard from "../../../../components/NotificationCard";

import ChatCard from "../../../../components/ChatCard";

import LanguageSwitcher from "../LanguageSwitcher";
import { isAdminPortalPath, isEmployerPortalPath } from "../../../../configs/portalRouting";

interface HeaderProps {
  [key: string]: any;
}

const Header = (props: HeaderProps) => {

  const { t } = useTranslation('common');

  const pages = React.useMemo(() => ({

    [HOST_NAME.PROJECT]: [
      { id: '1', label: t('nav.jobs'), path: `/${ROUTES.JOB_SEEKER.JOBS}` },
      { id: '2', label: t('nav.companies'), path: `/${ROUTES.JOB_SEEKER.COMPANY}` },
      { id: '3', label: t('nav.aboutUs'), path: `/${ROUTES.JOB_SEEKER.ABOUT_US}` },
    ],
    [HOST_NAME.EMPLOYER_PROJECT]: [
      { id: '1', label: t('nav.introduction'), path: `/${ROUTES.EMPLOYER.INTRODUCE}` },
      { id: '2', label: t('nav.services'), path: `/${ROUTES.EMPLOYER.SERVICE}` },
      { id: '3', label: t('nav.pricing'), path: `/${ROUTES.EMPLOYER.PRICING}` },
      { id: '4', label: t('nav.support'), path: `/${ROUTES.EMPLOYER.SUPPORT}` },
      { id: '5', label: t('nav.blog'), path: `/${ROUTES.EMPLOYER.BLOG}` },
    ],

  }), [t]);

  const theme = useTheme();

  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const location = useLocation();

  const hostName = window.location.hostname;

  const fullPathname = window.location.pathname;
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

  const nav = useNavigate();

  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {

    setMobileOpen((prevState) => !prevState);

  };

  const handleCloseNavMenu = () => {

    setAnchorElNav(null);

  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {

    setAnchorElUser(event.currentTarget);

  };

  const handleCloseUserMenu = () => {

    setAnchorElUser(null);

  };

  const handleLogin = () => {
    if (isAdminPortal) {
      nav(`/${ROUTES.ADMIN_AUTH.LOGIN}`);
      return;
    }
    if (isEmployerPortal) {
      nav(`/${ROUTES.EMPLOYER_AUTH.LOGIN}`);
      return;
    }
    nav(`/${ROUTES.AUTH.LOGIN}`);

  };

  const handleSignUp = () => {

    if (isAdminPortal) return;
    if (isEmployerPortal) {
      nav(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`);
      return;
    }
    nav(`/${ROUTES.AUTH.REGISTER}`);

  };

  const authArea = isAuthenticated ? (

    <Box sx={{ flexGrow: 0, ml: 1 }}>

      <Card

        variant="outlined"

        onClick={handleOpenUserMenu}

        role="button"

        tabIndex={0}

        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenUserMenu(e as any); } }}

        sx={{

          p: 0.5,

          borderRadius: 50,

          backgroundColor: "rgba(255, 255, 255, 0.1)",

          borderColor: "rgba(255, 255, 255, 0.4)",

          cursor: "pointer",

          transition: 'all 0.3s ease',

          backdropFilter: 'blur(8px)',

          '&:hover': {

            backgroundColor: 'rgba(255, 255, 255, 0.2)',

            borderColor: 'rgba(255, 255, 255, 0.6)',

            transform: 'translateY(-1px)',

          },

        }}

      >

        <Stack direction="row" justifyContent="center" alignItems="center">

          <Avatar
            alt="User Avatar"
            src={currentUser?.avatarUrl ?? undefined}
            sx={{
              width: 36,
              height: 36,
              border: '2px solid rgba(255, 255, 255, 0.6)',
            }}
          />

          <Typography

            variant="subtitle2"

            sx={{

              px: 1,

              color: "white",

              fontWeight: 600,

              display: {

                xs: "none",

                sm: "block",

              },

            }}

          >

            {currentUser?.fullName}

          </Typography>

        </Stack>

      </Card>

      {/* Start: User menu */}

      <UserMenu

        anchorElUser={anchorElUser}

        open={Boolean(anchorElUser)}

        handleCloseUserMenu={handleCloseUserMenu}

      />

      {/* End: User menu */}

    </Box>

  ) : (

    <Box

      sx={{

        ml: 1,

        display: "block",

      }}

    >

      <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>

        <Button

          variant="outlined"

          color="inherit"

          sx={{
            color: "white",
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: "24px",
            px: { xs: 1.5, sm: 2.5 },
            py: 0.75,
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            fontWeight: 600,
            textTransform: 'none',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: "white",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              transform: 'translateY(-1px)',
            },
          }}

          onClick={handleLogin}

        >

          {t('nav.login')}

        </Button>

        <Button

          variant="contained"

          sx={{

            color: "primary.main",
            backgroundColor: "white",
            borderRadius: "24px",
            px: { xs: 1.5, sm: 2.5 },
            py: 0.75,
            fontSize: { xs: '0.72rem', sm: '0.85rem' },
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            },

          }}

          onClick={handleSignUp}

        >

          {t('nav.register')}

        </Button>

      </Stack>

    </Box>

  );

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

          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>

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
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={IMAGES.getTextLogo("light")}
                alt="Square Logo"
                sx={{
                  height: { xs: 26, md: 34 },
                  width: 'auto',
                  display: 'block',
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
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {(pages[currentPortalHost] || []).map((page) => (
                <Link to={page.path} key={page.id} onClick={handleCloseNavMenu}>
                  <Button
                    color="primary"
                    sx={{
                      my: 1,
                      mr: 0.5,
                      color: "white",
                      display: "block",
                      whiteSpace: 'nowrap',
                      backgroundColor: location?.pathname?.startsWith(page.path)
                        ? "rgba(255, 255, 255, 0.1)"
                        : null,
                    }}
                  >
                    {page.label}
                  </Button>
                </Link>
              ))}
            </Box>

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
                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <NotificationCard />
                </Box>
              )}
              {isAuthenticated && (
                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <ChatCard />
                </Box>
              )}

              {/* Auth buttons */}
              {!isAdminPortal && authArea}

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
