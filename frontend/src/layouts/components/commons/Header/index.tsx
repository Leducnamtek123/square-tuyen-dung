'use client';
import * as React from "react";
import { useAppSelector } from '@/redux/hooks';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import { useTheme } from "@mui/material/styles";

import { AppBar, Box, Container, Divider, IconButton, Stack, Toolbar, useMediaQuery } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import { HOST_NAME, IMAGES, ROUTES } from "@/configs/constants";

import LeftDrawer from "../LeftDrawer";

import AccountSwitchMenu from "../AccountSwitchMenu";
import WorkspaceSwitchMenu from "../WorkspaceSwitchMenu";

const NotificationCard = React.lazy(() => import("../../../../components/Features/NotificationCard"));
const ChatCard = React.lazy(() => import("../../../../components/Features/ChatCard"));

import LanguageSwitcher from "../LanguageSwitcher";
import { isAdminPortalPath, isEmployerPortalPath } from "@/configs/portalRouting";
import { localizeRoutePath } from "@/configs/routeLocalization";
import HeaderNavLinks from "./HeaderNavLinks";
import HeaderAuthArea from "./HeaderAuthArea";

import { useQuery } from '@tanstack/react-query';
import contentService from '@/services/contentService';

interface HeaderProps {
  windowProp?: () => Window;
}

const Header = (_props: HeaderProps) => {

  const { t, i18n } = useTranslation('common');

  const { data: dynamicCategories = [] } = useQuery({
    queryKey: ['public-article-categories'],
    queryFn: async () => {
      const res = await contentService.getPublicArticleCategories();
      return res || [];
    },
    staleTime: 5 * 60_000,
  });

  const infoChildren = React.useMemo(() => {
    if (dynamicCategories.length > 0) {
      return dynamicCategories.map((cat) => ({
        id: String(cat.id),
        label: cat.name,
        description: cat.description || '',
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}?category=${cat.slug}`, i18n.language),
        iconName: cat.iconName || 'book',
      }));
    }

    return [
      {
        id: 'info-1',
        label: t('nav.careerGuide', 'Cẩm nang nghề nghiệp'),
        description: t('nav.careerGuideDesc', 'Kinh nghiệm và định hướng phát triển sự nghiệp'),
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}?category=cam-nang`, i18n.language),
        iconName: 'book',
      },
      {
        id: 'info-2',
        label: t('nav.laborRights', 'Thủ tục & Quyền lợi lao động'),
        description: t('nav.laborRightsDesc', 'BHXH, hợp đồng lao động và chế độ người lao động'),
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}?category=thu-tuc-lao-dong`, i18n.language),
        iconName: 'gavel',
      },
      {
        id: 'info-3',
        label: t('nav.taxGuide', 'Thuế & Quyết toán TNCN'),
        description: t('nav.taxGuideDesc', 'Hướng dẫn kê khai và quyết toán thuế thu nhập'),
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}?category=thue-tncn`, i18n.language),
        iconName: 'tax',
      },
      {
        id: 'info-4',
        label: t('nav.cvInterviewTips', 'Bí quyết viết CV & Phỏng vấn'),
        description: t('nav.cvInterviewTipsDesc', 'Mẫu CV chuẩn và kỹ năng phỏng vấn thành công'),
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}?category=bi-quyet-cv`, i18n.language),
        iconName: 'cv',
      },
      {
        id: 'info-5',
        label: t('nav.recruitmentTrends', 'Báo cáo & Xu hướng tuyển dụng'),
        description: t('nav.recruitmentTrendsDesc', 'Cập nhật báo cáo và thông tin thị trường nhân sự'),
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}?category=xu-huong`, i18n.language),
        iconName: 'trend',
      },
    ];
  }, [dynamicCategories, i18n.language, t]);

  const aboutChildren = React.useMemo(() => [
    {
      id: 'about-1',
      label: t('nav.aboutInfoHR', 'Về InfoHR & Hệ sinh thái'),
      description: t('nav.aboutInfoHRDesc', 'Giới thiệu về nền tảng tuyển dụng & giải pháp quản lý nhân sự InfoHR'),
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.ABOUT_US}`, i18n.language),
      iconName: 'infohr',
    },
    {
      id: 'about-2',
      label: t('nav.ailaPlatform', 'AILA AI - Platform Phỏng vấn'),
      description: t('nav.ailaPlatformDesc', 'Truy cập giải pháp phỏng vấn giọng nói & video tự động tại aila.infohr.vn'),
      path: 'https://aila.infohr.vn/',
      iconName: 'aila',
    },
  ], [i18n.language, t]);

  const pages = React.useMemo(() => ({

    [HOST_NAME.PROJECT]: [
      { id: '1', label: t('nav.jobs'), path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language), isHighlight: true },
      { id: '2', label: t('nav.companies'), path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.COMPANY}`, i18n.language) },
      {
        id: '3',
        label: t('nav.information', 'Thông tin'),
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}`, i18n.language),
        children: infoChildren,
      },
      {
        id: '4',
        label: t('nav.aboutUs'),
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.ABOUT_US}`, i18n.language),
        children: aboutChildren,
      },
    ],
    [HOST_NAME.EMPLOYER_PROJECT]: [
      { id: '1', label: t('nav.introServices', 'Giới thiệu & Dịch vụ'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.INTRODUCE}`, i18n.language) },
      { id: '2', label: t('nav.findCandidates', 'Tìm ứng viên'), path: localizeRoutePath(`/${ROUTES.EMPLOYER.PROFILE}`, i18n.language), requireAuth: true, isHighlight: true },
      { id: '3', label: t('nav.pricing', { defaultValue: 'Bảng giá' }), path: localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language) },
      { id: '4', label: t('nav.support', { defaultValue: 'Hỗ trợ' }), path: localizeRoutePath(`/${ROUTES.EMPLOYER.SUPPORT}`, i18n.language) },
    ],
  }), [t, i18n.language, infoChildren, aboutChildren]);

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

  const { push } = useRouter();

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
      push(`/${ROUTES.ADMIN_AUTH.LOGIN}`);
      return;
    }
    if (isEmployerPortal) {
      push(`/${ROUTES.EMPLOYER_AUTH.LOGIN}`);
      return;
    }
    push(`/${ROUTES.AUTH.LOGIN}`);

  };

  const handleSignUp = () => {

    if (isAdminPortal) return;
    if (isEmployerPortal) {
      push(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`);
      return;
    }
    push(`/${ROUTES.AUTH.REGISTER}`);

  };

  return (

    <>

      <AppBar
        position="sticky"
        id="common-header"
        sx={{
          boxShadow: '0 2px 18px rgba(15, 23, 42, 0.08)',
          background: 'rgba(255, 255, 255, 0.92)',
          color: '#1f2937',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
        }}
      >

        <Container maxWidth="xl">

          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 56, sm: 64 },
              px: { xs: 0.75, sm: 1.5, md: 2 },
              gap: { xs: 0.5, sm: 1 },
              overflow: 'hidden',
              justifyContent: 'space-between',
            }}
          >

            {/* ── Mobile: Hamburger icon TRƯỚC logo (chuẩn MUI) ── */}
            <IconButton
              color="inherit"
              aria-label={t('actions.openDrawer')}
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: { xs: 0.5, sm: 1 },
                p: { xs: 1, sm: 1.25 },
                minWidth: 44,
                minHeight: 44,
                display: { md: "none" },
                flexShrink: 0,
              }}
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
                alt="InfoHR Logo"
                sx={{
                  height: { xs: 26, sm: 30, md: 34 },
                  width: 'auto',
                  maxWidth: { xs: 105, sm: 140, md: 'none' },
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
                borderColor: 'rgba(226, 232, 240, 0.9)',
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
            <Box sx={{ flexGrow: 1, minWidth: { xs: 4, sm: 8 }, display: { xs: "flex", md: "none" } }} />

            {/* ── Right side: icons + auth ── */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.25, sm: 0.75, md: 1.5 }}
              sx={{ flexShrink: 0, minWidth: 0 }}
            >
              {/* LanguageSwitcher: visible on all screen sizes */}
              <LanguageSwitcher />

              {isAuthenticated && <WorkspaceSwitchMenu />}

              {/* Notification + Chat: chỉ hiện từ sm trở lên trên mobile */}
              {isAuthenticated && (
                <React.Suspense fallback={<Box width={36} height={36} />}>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <NotificationCard />
                  </Box>
                </React.Suspense>
              )}
              {isAuthenticated && (
                <React.Suspense fallback={<Box width={36} height={36} />}>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <ChatCard />
                  </Box>
                </React.Suspense>
              )}

              {/* Auth buttons - hide on xs when not authenticated (available in drawer) */}
              {!isAdminPortal && (
                <Box sx={{ display: isAuthenticated ? 'flex' : { xs: 'none', sm: 'flex' }, flexShrink: 0 }}>
                  <HeaderAuthArea
                    isAuthenticated={isAuthenticated}
                    currentUserName={currentUser?.fullName}
                    currentUserAvatarUrl={currentUser?.avatarUrl ?? undefined}
                    isVerified={Boolean(currentUser?.isOnboarded || currentUser?.isPhoneVerified || currentUser?.isVerifyEmail)}
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
