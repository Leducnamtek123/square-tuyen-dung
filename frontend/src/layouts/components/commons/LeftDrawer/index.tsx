import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Drawer, Stack, Avatar, Divider, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/hooks';
import Link from 'next/link';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import errorHandling from '../../../../utils/errorHandling';
import { IMAGES, ROUTES } from '../../../../configs/constants';
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
}

interface LeftDrawerProps {
  window?: () => Window;
  pages: PageItem[];
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  showPublicActions?: boolean;
}

const DRAWER_WIDTH_SM = 260;
const DRAWER_WIDTH_XS = '80vw';

const LeftDrawer = ({ window, pages, mobileOpen, handleDrawerToggle, showPublicActions = true }: LeftDrawerProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const nav = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const container = window !== undefined ? () => window().document.body : undefined;
  const pathname = globalThis?.window?.location?.pathname || '';
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
        nav.push(`/${ROUTES.AUTH.LOGIN}`);
      })
      .catch((error: AxiosError<{ errors?: ApiError }>) => {
        errorHandling(error);
      });
  };

  return (
    <Drawer
      container={container}
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', sm: 'block', md: 'none' },
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
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Box
          component={Link}
          href="/"
          onClick={handleDrawerToggle}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2.5,
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Avatar src={IMAGES.getTextLogo('dark')} sx={{ width: 'auto', height: 36 }} variant="square" alt="LOGO" />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <List sx={{ py: 1.5 }}>
            {pages.map((page) => (
              <ListItem
                key={page.id}
                component={Link}
                href={page.path}
                className={pathname.startsWith(page.path) ? 'active' : ''}
                disablePadding
                onClick={handleDrawerToggle}
                sx={{ mb: 0.5, mx: 1, width: 'auto' }}
              >
                <ListItemButton
                  sx={{
                    textAlign: 'left',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    color: 'text.primary',
                    '&.active': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '& .MuiListItemText-primary': {
                        fontWeight: 700,
                      },
                    },
                    '&:hover': {
                      backgroundColor: (theme) => (theme.palette.mode === 'light' ? 'grey.100' : 'grey.800'),
                      paddingLeft: '20px',
                    },
                  }}
                >
                  <ListItemText primary={page.label} slotProps={{ primary: { fontSize: '0.9rem' } }} />
                </ListItemButton>
              </ListItem>
            ))}
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
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'error.main',
                  color: 'white',
                },
              }}
              onClick={() => confirmModal(handleLogout, t('nav.logoutTitle'), t('nav.logoutConfirm'), 'question')}
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
                  borderRadius: 2,
                  fontSize: '0.85rem',
                }}
                onClick={() => {
                  nav.push(`/${loginRoute}`);
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
                  borderRadius: 2,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
                onClick={() => {
                  nav.push(`/${registerRoute}`);
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
