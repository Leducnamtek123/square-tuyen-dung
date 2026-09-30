'use client';

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { useAppSelector } from "@/redux/hooks";
import tokenService from "@/services/tokenService";
import { useTranslation } from "react-i18next";
import { localizeRoutePath } from "@/configs/routeLocalization";
import AnimatedFlame from "@/components/Common/AnimatedFlame";

type HeaderNavSubLink = {
  id: string;
  label: string;
  description?: string;
  path: string;
  iconName?: string;
};

type HeaderNavLink = {
  id: string;
  label: string;
  path: string;
  requireAuth?: boolean;
  isHighlight?: boolean;
  isHot?: boolean;
  children?: HeaderNavSubLink[];
};

type HeaderNavLinksProps = {
  pages: HeaderNavLink[];
  activePathname: string;
  onClose: () => void;
};

const getNavIcon = (iconName?: string) => {
  switch (iconName) {
    case 'infohr':
      return <BusinessOutlinedIcon fontSize="small" sx={{ color: '#2563eb' }} />;
    case 'aila':
      return <SmartToyOutlinedIcon fontSize="small" sx={{ color: '#fc054b' }} />;
    case 'book':
      return <MenuBookOutlinedIcon fontSize="small" sx={{ color: '#e11d48' }} />;
    case 'gavel':
      return <GavelOutlinedIcon fontSize="small" sx={{ color: '#2563eb' }} />;
    case 'tax':
      return <AccountBalanceOutlinedIcon fontSize="small" sx={{ color: '#059669' }} />;
    case 'cv':
      return <DescriptionOutlinedIcon fontSize="small" sx={{ color: '#d97706' }} />;
    case 'trend':
      return <InsightsOutlinedIcon fontSize="small" sx={{ color: '#dc2626' }} />;
    default:
      return <MenuBookOutlinedIcon fontSize="small" sx={{ color: '#e11d48' }} />;
  }
};

const DoodleUnderlineSvg = ({ isVisible = true }: { isVisible?: boolean }) => {
  const gradId = React.useId();

  return (
    <Box
      component="svg"
      className="doodle-underline-stroke"
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={{
        position: 'absolute',
        bottom: -2,
        left: 0,
        width: '100%',
        height: '5px',
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* 1 đường lượn sóng mỏng duy nhất, bám chuẩn độ dài của chữ */}
      <path
        d="M 0,4.5 Q 25,1.5 50,4.5 T 100,4.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );
};

const HeaderNavLinks = ({ pages, activePathname, onClose }: HeaderNavLinksProps) => {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [dropdownAnchors, setDropdownAnchors] = React.useState<Record<string, HTMLElement | null>>({});

  const handleOpenDropdown = (e: React.MouseEvent<HTMLElement>, pageId: string) => {
    setDropdownAnchors((prev) => ({ ...prev, [pageId]: e.currentTarget }));
  };

  const handleCloseDropdown = (pageId: string) => {
    setDropdownAnchors((prev) => ({ ...prev, [pageId]: null }));
  };

  const handleClick = (e: React.MouseEvent, page: HeaderNavLink) => {
    onClose();
    if (page.requireAuth) {
      const hasToken = Boolean(tokenService.getAccessTokenFromCookie());
      if (!hasToken || !isAuthenticated) {
        e.preventDefault();
        router.push(localizeRoutePath('/nha-tuyen-dung/login', i18n.language));
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, alignItems: 'center', minWidth: 0 }}>
      {pages.map((page) => {
        const isHighlight =
          Boolean(page.isHighlight) ||
          page.label === 'Tìm ứng viên' ||
          page.label === 'Việc làm' ||
          page.label === t('nav.jobs', { defaultValue: 'Việc làm' }) ||
          page.path.includes('/viec-lam') ||
          page.path.includes('/nha-tuyen-dung/ung-vien');
        const isActive = page.path === '/'
          ? (activePathname === '/' || activePathname === '')
          : activePathname.startsWith(page.path);
        const hasChildren = Boolean(page.children && page.children.length > 0);
        const anchorEl = dropdownAnchors[page.id] || null;
        const isMenuOpen = Boolean(anchorEl);

        return (
          <React.Fragment key={page.id}>
            <Button
              component={hasChildren ? 'button' : Link}
              {...(!hasChildren && { href: page.path })}
              color="inherit"
              variant="text"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                if (hasChildren) {
                  handleOpenDropdown(e, page.id);
                } else {
                  handleClick(e, page);
                }
              }}
              endIcon={hasChildren ? <KeyboardArrowDownIcon sx={{ fontSize: '16px !important', ml: -0.5 }} /> : undefined}
              sx={{
                my: 1,
                mr: { md: 0.15, lg: 0.35, xl: 0.75 },
                color: '#0f172a',
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: { md: '0.78rem', lg: '0.84rem', xl: '0.925rem' },
                px: { md: 0.75, lg: 1.25, xl: 2 },
                py: isHighlight ? 0.8 : 0.75,
                borderRadius: 0,
                position: 'relative',
                backgroundColor: isActive
                  ? isHighlight
                    ? '#f1f5f9'
                    : 'rgba(15, 23, 42, 0.06)'
                  : 'transparent',
                border: "1px solid",
                borderColor: isActive
                  ? isHighlight
                    ? '#e2e8f0'
                    : 'rgba(15, 23, 42, 0.10)'
                  : 'transparent',
                boxShadow: isActive && isHighlight ? '0 2px 6px rgba(15, 23, 42, 0.04)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: isHighlight ? '#f1f5f9' : 'rgba(15, 23, 42, 0.04)',
                  borderColor: isHighlight ? '#e2e8f0' : 'rgba(15, 23, 42, 0.10)',
                  transform: isHighlight ? 'translateY(-1px)' : 'none',
                  textDecoration: "none",
                  '& .doodle-underline-stroke': {
                    transform: 'scaleY(1.15)',
                    opacity: 1,
                  },
                },
                '&:focus, &:active': {
                  textDecoration: "none",
                },
              }}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: { md: 0.5, lg: 0.75 } }}>
                <Box
                  component="span"
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    lineHeight: 1.2,
                    pb: isHighlight ? 0.35 : 0,
                  }}
                >
                  <span>{page.label}</span>
                  {isHighlight && <DoodleUnderlineSvg isVisible={true} />}
                </Box>
                {page.isHot && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      verticalAlign: 'middle',
                      lineHeight: 1,
                      ml: 0.35,
                      transform: 'translateY(-1px)',
                    }}
                    title="HOT"
                    aria-label="HOT"
                  >
                    <AnimatedFlame size={16} />
                  </Box>
                )}
              </Box>
            </Button>

            {/* Dropdown Menu Popup */}
            {hasChildren && (
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={() => handleCloseDropdown(page.id)}
                disableScrollLock
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      mt: 1.25,
                      p: 1,
                      width: 360,
                      borderRadius: 0,
                      boxShadow: '0 20px 48px rgba(15, 23, 42, 0.18)',
                      border: '1px solid rgba(226, 232, 240, 0.95)',
                    },
                  },
                }}
              >
                {page.children?.map((child) => (
                  <MenuItem
                    key={child.id}
                    onClick={() => {
                      handleCloseDropdown(page.id);
                      onClose();
                      if (child.path.startsWith('http://') || child.path.startsWith('https://')) {
                        window.open(child.path, '_blank', 'noopener,noreferrer');
                      } else {
                        router.push(child.path);
                      }
                    }}
                    sx={{
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 0,
                      mb: 0.5,
                      whiteSpace: 'normal',
                      '&:hover': {
                        backgroundColor: 'rgba(225, 29, 72, 0.08)',
                        '& .MuiTypography-root': { color: '#e11d48' },
                      },
                    }}
                  >
                    <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', mt: 0.25 }}>
                      {getNavIcon(child.iconName)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} fontSize="0.875rem" color="#0f172a" sx={{ transition: 'color 0.15s ease' }}>
                        {child.label}
                      </Typography>
                      {child.description && (
                        <Typography fontSize="0.75rem" color="#64748b" sx={{ mt: 0.25, lineHeight: 1.35 }}>
                          {child.description}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default HeaderNavLinks;
