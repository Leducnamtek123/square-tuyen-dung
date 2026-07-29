'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Button, Drawer, Stack, Divider, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/hooks';
import Link from 'next/link';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import errorHandling from '../../../../utils/errorHandling';
import { IMAGES, ROUTES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import { removeUserInfo } from '../../../../redux/userSlice';
import tokenService from '../../../../services/tokenService';
import AccountSwitchMenu from '../AccountSwitchMenu';
import { isEmployerPortalPath } from '../../../../configs/portalRouting';
import type { ApiError } from '../../../../types/api';
import type { AxiosError } from 'axios';
import type { AppDispatch } from '../../../../redux/store';
import {
  resetSearchCompany,
  resetSearchJobPostFilter,
  resetSearchResume,
} from '../../../../redux/filterSlice';

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

const DRAWER_WIDTH_SM = 260;
const DRAWER_WIDTH_XS = '80vw';

const LeftDrawer = ({ windowProp, pages, mobileOpen, handleDrawerToggle, showPublicActions = true }: LeftDrawerProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
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

    (dispatch as AppDispatch)(removeUserInfo({ accessToken, backend }))
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
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: { xs: DRAWER_WIDTH_XS, sm: DRAWER_WIDTH_SM },
          maxWidth: DRAWER_WIDTH_SM,
          boxShadow: (theme) => theme.customShadows?.card || '0 8px 32px rgba(0,0,0,0.15)',
          border: 'none',
          borderRadius: '0 16px 16px 0',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box
            component={Link}
            href="/"
            onClick={handleDrawerToggle}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
          >
            <Box
              component="img"
              src={IMAGES.getTextLogo('dark')}
              alt="Logo"
              sx={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <Typography variant="h6" fontWeight={700} color="primary.main">
              INFO HR
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <List sx={{ py: 1.5 }}>
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
                    sx={{ mb: 0.5, mx: 1, width: 'auto', cursor: 'pointer' }}
                  >
                    <ListItemButton
                      sx={{
                        textAlign: 'left',
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        color: 'text.primary',
                        justifyContent: 'space-between',
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
                      <ListItemText primary={page.label} slotProps={{ primary: { fontSize: '0.9rem', fontWeight: 600 } }} />
                      {hasSubItems && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                          {isSubOpen ? '▲' : '▼'}
                        </Typography>
                      )}
                    </ListItemButton>
                  </ListItem>

                  {hasSubItems && isSubOpen && (
                    <List disablePadding sx={{ pl: 2, pr: 1, mb: 1 }}>
                      {page.children?.map((child) => (
                        <ListItem
                          key={child.id}
                          component={Link}
                          href={child.path}
                          disablePadding
                          onClick={() => handleDrawerToggle()}
                          sx={{ mb: 0.5 }}
                        >
                          <ListItemButton sx={{ borderRadius: 1.5, py: 0.75 }}>
                            <ListItemText
                              primary={child.label}
                              secondary={child.description}
                              slotProps={{
                                primary: { fontSize: '0.825rem', fontWeight: 600, color: '#334155' },
                                secondary: { fontSize: '0.725rem', color: '#64748b' },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </React.Fragment>
              );
            })}
          </List>

          {showPublicActions && !isAuthenticated && (
            <Box onClick={(e) => e.stopPropagation()}>
              <Divider sx={{ mx: 2, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontSize: '0.7rem' }}>
                  {isEmployerPortal ? t('nav.switch.forJobSeekers') : t('nav.switch.forEmployers')}
                </Typography>
              </Divider>
              <Box sx={{ px: 2, py: 1.5 }}>
                <AccountSwitchMenu isShowButton={true} />
              </Box>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
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
                textTransform: 'none',
                fontWeight: 600,
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
                  textTransform: 'none',
                  fontSize: '0.85rem',
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
                  textTransform: 'none',
                  fontSize: '0.85rem',
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
