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
import { useAppSelector } from "@/redux/hooks";
import tokenService from "@/services/tokenService";
import { useTranslation } from "react-i18next";
import { localizeRoutePath } from "@/configs/routeLocalization";

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
  children?: HeaderNavSubLink[];
};

type HeaderNavLinksProps = {
  pages: HeaderNavLink[];
  activePathname: string;
  onClose: () => void;
};

const getNavIcon = (iconName?: string) => {
  switch (iconName) {
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

const UnderlineStrokeSvg = ({ isVisible }: { isVisible: boolean }) => (
  <svg
    className="underline-stroke"
    viewBox="0 0 100 22"
    preserveAspectRatio="none"
    style={{
      position: 'absolute',
      bottom: 2,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '88%',
      height: '10px',
      pointerEvents: 'none',
      opacity: isVisible ? 0.95 : 0,
      transition: 'opacity 0.2s ease-in-out',
    }}
  >
    <path
      d="M 3,14 C 25,6 55,18 78,9 C 88,5 95,10 97,12 M 10,17 C 32,12 60,16 88,14"
      fill="none"
      stroke="#38bdf8"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeaderNavLinks = ({ pages, activePathname, onClose }: HeaderNavLinksProps) => {
  const router = useRouter();
  const { i18n } = useTranslation('common');
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
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, alignItems: 'center' }}>
      {pages.map((page) => {
        const isHighlight = page.isHighlight || page.label === 'Tìm ứng viên';
        const isActive = activePathname.startsWith(page.path);
        const hasChildren = Boolean(page.children && page.children.length > 0);
        const anchorEl = dropdownAnchors[page.id] || null;
        const isMenuOpen = Boolean(anchorEl);

        const buttonNode = (
          <Button
            color="inherit"
            variant="text"
            onClick={(e) => {
              if (hasChildren) {
                handleOpenDropdown(e, page.id);
              } else {
                handleClick(e, page);
              }
            }}
            endIcon={hasChildren ? <KeyboardArrowDownIcon sx={{ fontSize: '18px !important', ml: -0.5 }} /> : undefined}
            sx={{
              my: 1,
              mr: 0.75,
              color: '#0f172a',
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: '0.925rem',
              px: isHighlight ? 2.5 : 2,
              py: isHighlight ? 0.9 : 0.85,
              borderRadius: isHighlight ? '12px' : '8px',
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
                '& .underline-stroke': { opacity: 0.95 },
              },
              '&:focus, &:active': {
                textDecoration: "none",
              },
            }}
          >
            <Box component="span" sx={{ position: 'relative', display: 'inline-block', pb: isHighlight ? 0.6 : 0 }}>
              {page.label}
              {isHighlight && <UnderlineStrokeSvg isVisible={isActive} />}
            </Box>
          </Button>
        );

        return (
          <React.Fragment key={page.id}>
            {hasChildren ? (
              buttonNode
            ) : (
              <Link
                href={page.path}
                onClick={(e) => handleClick(e, page)}
                style={{ textDecoration: "none" }}
              >
                {buttonNode}
              </Link>
            )}

            {/* Dropdown Menu Popup */}
            {hasChildren && (
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={() => handleCloseDropdown(page.id)}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      mt: 1.25,
                      p: 1,
                      width: 360,
                      borderRadius: 3,
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
                      router.push(child.path);
                    }}
                    sx={{
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 2,
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
