import * as React from "react";

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import { useTranslation } from 'react-i18next';

import { useTheme } from "@mui/material/styles";

import { AppBar, Avatar, Box, Button, Card, Container, Divider, IconButton, Menu, MenuItem, Stack, Toolbar, Typography, useMediaQuery } from "@mui/material";

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

      { id: 1, label: t('nav.jobs'), path: `/${ROUTES.JOB_SEEKER.JOBS}` },

      { id: 2, label: t('nav.companies'), path: `/${ROUTES.JOB_SEEKER.COMPANY}` },

      { id: 3, label: t('nav.aboutUs'), path: `/${ROUTES.JOB_SEEKER.ABOUT_US}` },

    ],

    [HOST_NAME.EMPLOYER_PROJECT]: [

      { id: 1, label: t('nav.introduction'), path: `/${ROUTES.EMPLOYER.INTRODUCE}` },

      { id: 2, label: t('nav.services'), path: `/${ROUTES.EMPLOYER.SERVICE}` },

      { id: 3, label: t('nav.pricing'), path: `/${ROUTES.EMPLOYER.PRICING}` },

      { id: 4, label: t('nav.support'), path: `/${ROUTES.EMPLOYER.SUPPORT}` },

      { id: 5, label: t('nav.blog'), path: `/${ROUTES.EMPLOYER.BLOG}` },

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

  const { currentUser, isAuthenticated } = useSelector((state: any) => state.user);

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

        sx={{

          p: 0.5,

          borderRadius: 50,

          backgroundColor: "transparent",

          borderColor: "#7e57c2",

          cursor: "pointer",

        }}

      >

        <Stack direction="row" justifyContent="center" alignItems="center">

          <Avatar alt="User Avatar" src={currentUser?.avatarUrl} />

          <Typography

            variant="subtitle1"

            sx={{

              px: 1,

              color: (theme: any) =>

                theme.palette.mode === "light" ? "white" : "white",

              display: {

                xs: "none",

                sm: "block",

                md: "block",

                lg: "block",

                xl: "block",

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

        display: {

          xs: "block",

          sm: "block",

          md: "block",

          lg: "block",

          xl: "block",

        },

      }}

    >

      <Stack direction="row" spacing={1}>

        <Button

          variant="outlined"

          color="inherit"

          sx={{ color: "white" }}

          onClick={handleLogin}

        >

          {t('nav.login')}

        </Button>

        <Button

          variant="outlined"

          color="inherit"

          sx={{

            color: "white",

            display: {

              xs: "none",

              sm: "block",

              md: "block",

              lg: "block",

              xl: "block",

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

      <AppBar position="sticky" sx={{ boxShadow: 0 }} id="common-header">

        <Container maxWidth="xl">

          <Toolbar disableGutters>

            <Stack

              direction="row"

              alignItems="center"

              justifyContent="space-between"

              component={Link}

              to="/"

            >

              <Avatar

                src={IMAGES.getTextLogo("light")}

                sx={{

                  display: { xs: "none", md: "flex" },

                  mr: 1,

                  width: "100%",

                  height: 42,

                }}

                variant="square"

                alt="LOGO"

              />

            </Stack>

            <Divider

              orientation="vertical"

              flexItem

              variant="middle"

              sx={{

                mx: 1,

                borderColor: "lightgray",

                display: { xs: "none", md: "flex" },

              }}

            />

            <IconButton

              color="inherit"

              aria-label="open drawer"

              edge="start"

              onClick={handleDrawerToggle}

              sx={{ mr: 2, display: { md: "none" } }}

            >

              <MenuIcon />

            </IconButton>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>

              <Avatar

                src={IMAGES.getLogo("medium", "light")}

                sx={{

                  display: {

                    xs: "flex",

                    sm: "flex",

                    md: "none",

                    lg: "none",

                    xl: "none",

                  },

                  mr: 1,

                  width: 40,

                  height: 40,

                }}

                variant="square"

                alt="LOGO"

              />

              <Menu

                anchorEl={anchorElNav}

                anchorOrigin={{

                  vertical: "bottom",

                  horizontal: "left",

                }}

                keepMounted

                transformOrigin={{

                  vertical: "top",

                  horizontal: "left",

                }}

                open={Boolean(anchorElNav)}

                onClose={handleCloseNavMenu}

                sx={{

                  display: { xs: "block", md: "none" },

                }}

              >

                {(pages[currentPortalHost] || []).map((page) => (

                  <MenuItem

                    key={page.id}

                    onClick={handleCloseNavMenu}

                    component={NavLink}

                    to={page.path}

                  >

                    <Typography textAlign="center">{page.label}</Typography>

                  </MenuItem>

                ))}

              </Menu>

            </Box>

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

            <Stack direction="row" alignItems="center" spacing={2}>

              <LanguageSwitcher />

              {isAuthenticated && <WorkspaceSwitchMenu />}

              {/* start: NotificationCard */}

              {isAuthenticated && <NotificationCard />}

              {/* End: NotificationCard */}

              {/* start: ChatCard */}

              {isAuthenticated && <ChatCard />}

              {/* End: ChatCard */}

              {/* Start: authArea */}

              {!isAdminPortal && authArea}

              {/* End: authArea */}

              {!isSmall && !isAuthenticated && !isAdminPortal && (

                <>

                  <Divider

                    orientation="vertical"

                    flexItem

                    sx={{ mx: 1, height: 24, alignSelf: 'center', borderColor: "rgba(255, 255, 255, 0.3)" }}

                  />

                  {/* Start: Account switch menu */}

                  <AccountSwitchMenu />

                  {/* Start: Account switch menu */}

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
