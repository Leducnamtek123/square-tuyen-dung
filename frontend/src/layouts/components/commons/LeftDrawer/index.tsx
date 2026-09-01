'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Button, Drawer, Stack, Divider, List, ListItem, ListItemButton, ListItemText, Typography, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Link from 'next/link';
import { confirmModal } from '@/utils/sweetalert2Modal';
import errorHandling from '@/utils/errorHandling';
import { IMAGES, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { removeUserInfo } from '@/redux/userSlice';
import tokenService from '@/services/tokenService';
import AccountSwitchMenu from '../AccountSwitchMenu';
import { isEmployerPortalPath } from '@/configs/portalRouting';
import type { ApiError } from '@/types/api';
import type { AxiosError } from 'axios';
import type { AppDispatch } from '@/redux/store';
import {
  resetSearchCompany,
  resetSearchJobPostFilter,
  resetSearchResume,
} from '@/redux/filterSlice';

interface PageItem {
  id: string;
  path: string;
  label: string;
  requireAuth?: boolean;
  children?: {
    id: string;
    path: string;
    label: string;
    description?: string;
    iconName?: string;
  }[];
}

interface LeftDrawerProps {
  windowProp?: () => Window;
  pages: PageItem[];
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  showPublicActions?: boolean;
}

const DRAWER_WIDTH = 'min(320px, 85vw)';

const LeftDrawer = ({ windowProp, pages, mobileOpen, handleDrawerToggle, showPublicActions = true }: LeftDrawerProps) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const pathname = usePathname() || '';
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  const toggleSubMenu = (pageId: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const container = windowProp !== undefined ? () => windowProp().document.body : undefined;
  const isEmployerPortal = isEmployerPortalPath(pathname);
  const loginRoute = isEmployerPortal ? ROUTES.EMPLOYER_AUTH.LOGIN : ROUTES.AUTH.LOGIN;
  const registerRoute = isEmployerPortal ? ROUTES.EMPLOYER_AUTH.REGISTER : ROUTES.AUTH.REGISTER;

  const handleLogout = () => {
    const accessToken = tokenService.getAccessTokenFromCookie() || '';
    const backend = tokenService.getProviderFromCookie() || '';

    dispatch(removeUserInfo({ accessToken, backend }))
      .unwrap()
      .then(() => {
        dispatch(resetSearchJobPostFilter());
        dispatch(resetSearchCompany());
        dispatch(resetSearchResume());
        push(`/${ROUTES.AUTH.LOGIN}`);
      })
      .catch((error: AxiosError<{ errors?: ApiError }>) => {
        errorHandling(error);
      });
  };

  const { i18n } = useTranslation('common');

  const handleItemClick = (e: React.MouseEvent, page: PageItem) => {
    if (page.children && page.children.length > 0) {
      e.preventDefault();
      toggleSubMenu(page.id);
      return;
    }

    handleDrawerToggle();
    if (page.requireAuth) {
      const hasToken = Boolean(tokenService.getAccessTokenFromCookie());
      if (!hasToken || !isAuthenticated) {
        e.preventDefault();
        push(localizeRoutePath('/nha-tuyen-dung/login', i18n.language));
      }
    }
  };

  return (
    <Drawer
      container={container}
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
        disableRestoreFocus: true,
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
          maxWidth: 320,
          boxShadow: (theme) => theme.customShadows?.card || '0 8px 32px rgba(0,0,0,0.15)',
          border: 'none',
          borderRadius: '0 16px 16px 0',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }} role="dialog" aria-label={t('nav.mainNav', { defaultValue: 'Menu điều hướng' })}>
        {/* Drawer Header with Logo & Accessible Close Button */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <Box
            component={Link}
            href="/"
            onClick={handleDrawerToggle}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', minWidth: 0 }}
          >
            <Box
              component="img"
              src={IMAGES.getTextLogo('dark')}
              alt="InfoHR"
              sx={{ height: 30, width: 'auto', maxWidth: 130, objectFit: 'contain' }}
            />
          </Box>

          <IconButton
            aria-label={t('actions.closeDrawer', { defaultValue: 'Đóng menu' })}
            onClick={handleDrawerToggle}
            size="small"
            sx={{
              minWidth: 40,
              minHeight: 40,
              color: 'text.secondary',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Scrollable Navigation Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }} component="nav" aria-label={t('nav.mobileMenu', { defaultValue: 'Menu chính' })}>
          <List sx={{ py: 1.5, minWidth: 0 }}>
            {pages.map((page) => {
              const hasSubItems = Boolean(page.children && page.children.length > 0);
              const isSubOpen = Boolean(openSubMenus[page.id]);

              return (
                <React.Fragment key={page.id}>
                  <ListItem
                    component={hasSubItems ? 'div' : Link}
                    href={hasSubItems ? undefined : page.path}
                    className={pathname.startsWith(page.path) ? 'active' : ''}
                    disablePadding
                    onClick={(e: React.MouseEvent<HTMLElement>) => handleItemClick(e, page)}
                    sx={{ mb: 0.5, mx: 1, width: 'auto', cursor: 'pointer', minWidth: 0 }}
                  >
                    <ListItemButton
                      aria-expanded={hasSubItems ? isSubOpen : undefined}
                      aria-haspopup={hasSubItems ? 'true' : undefined}
                      sx={{
                        minHeight: 44,
                        textAlign: 'left',
                        borderRadius: 2,
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        color: 'text.primary',
                        justifyContent: 'space-between',
                        minWidth: 0,
                        px: 1.5,
                        '&:focus-visible': {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                          outlineOffset: '2px',
                        },
                        '&.active': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '& .MuiListItemText-primary': {
                            fontWeight: 700,
                          },
                        },
                        '&:hover': {
                          backgroundColor: (theme) => (theme.palette.mode === 'light' ? 'grey.100' : 'grey.800'),
                        },
                      }}
                    >
                      <ListItemText
                        primary={page.label}
                        slotProps={{
                          primary: {
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            sx: { overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 },
                          },
                        }}
                      />
                      {hasSubItems && (
                        <KeyboardArrowDownIcon
                          sx={{
                            fontSize: 18,
                            color: 'text.secondary',
                            ml: 1,
                            flexShrink: 0,
                            transform: isSubOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>

                  {hasSubItems && (
                    <Collapse in={isSubOpen} timeout="auto" unmountOnExit>
                      <List disablePadding sx={{ pl: 2, pr: 1, mb: 1, minWidth: 0 }}>
                        {page.children?.map((child) => (
                          <ListItem
                            key={child.id}
                            component={Link}
                            href={child.path}
                            disablePadding
                            onClick={() => handleDrawerToggle()}
                            sx={{ mb: 0.5, minWidth: 0 }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: 44,
                                borderRadius: 1.5,
                                py: 0.75,
                                px: 1.25,
                                minWidth: 0,
                                alignItems: 'flex-start',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                transition: 'background-color 0.15s ease',
                                '&:focus-visible': {
                                  outline: '2px solid',
                                  outlineColor: 'primary.main',
                                  outlineOffset: '2px',
                                },
                              }}
                            >
                              <ListItemText
                                primary={child.label}
                                secondary={child.description}
                                slotProps={{
                                  primary: {
                                    fontSize: '0.825rem',
                                    fontWeight: 600,
                                    color: '#334155',
                                    sx: { overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 },
                                  },
                                  secondary: {
                                    fontSize: '0.725rem',
                                    color: '#64748b',
                                    sx: { overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0, mt: 0.25 },
                                  },
                                }}
                                sx={{ m: 0, minWidth: 0, width: '100%' }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            })}
          </List>

          {showPublicActions && !isAuthenticated && (
            <Box onClick={(e) => e.stopPropagation()} sx={{ minWidth: 0 }}>
              <Divider sx={{ mx: 2, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontSize: '0.7rem' }}>
                  {isEmployerPortal ? t('nav.switch.forJobSeekers') : t('nav.switch.forEmployers')}
                </Typography>
              </Divider>
              <Box sx={{ px: 2, py: 1.5, minWidth: 0 }}>
                <AccountSwitchMenu isShowButton={true} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom Actions with Safe Area Inset */}
        <Box
          sx={{
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
            pb: 'max(16px, env(safe-area-inset-bottom, 16px))',
            minWidth: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isAuthenticated ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              size="medium"
              sx={{
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'error.main',
                  color: 'white',
                },
              }}
              onClick={() => confirmModal(handleLogout, t('nav.logoutTitle'), t('nav.logoutConfirm'), 'logout')}
            >
              {t('nav.logout')}
            </Button>
          ) : showPublicActions ? (
            <Stack spacing={1}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                size="medium"
                sx={{
                  minHeight: 44,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
                onClick={() => {
                  push(`/${loginRoute}`);
                  handleDrawerToggle();
                }}
              >
                {t('nav.login')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="medium"
                sx={{
                  minHeight: 44,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
                onClick={() => {
                  push(`/${registerRoute}`);
                  handleDrawerToggle();
                }}
              >
                {t('nav.register')}
              </Button>
            </Stack>
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
};

export default LeftDrawer;
