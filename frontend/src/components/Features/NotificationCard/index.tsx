'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Box, CircularProgress, IconButton, Menu, Stack, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTranslation } from 'react-i18next';
import { ROLES_NAME, ROUTES } from '@/configs/constants';
import { useAppSelector } from '@/hooks/useAppStore';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationTargetPath, isExternalNotificationTarget } from '@/utils/notificationRouting';
import NotificationCardItem from './NotificationCardItem';
import NotificationCardFooter from './NotificationCardFooter';
import type { AppNotification } from '@/hooks/useNotifications';

const PAGE_SIZE = 5;

const NotificationCard: React.FC = () => {
  const { push } = useRouter();
  const { t } = useTranslation('common');
  const { currentUser } = useAppSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const {
    count,
    unreadCount,
    isLoading,
    notifications,
    loadMore,
    hasMore,
    handleRead,
    handleRemove,
    handleMakeAllRead,
    handleRemoveAll,
  } = useNotifications({ pageSize: PAGE_SIZE, listEnabled: open });

  const openNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const allNotificationsPath = React.useMemo(() => {
    if (currentUser?.roleName === ROLES_NAME.EMPLOYER) return `/${ROUTES.EMPLOYER.NOTIFICATION}`;
    if (currentUser?.roleName === ROLES_NAME.JOB_SEEKER) return `/${ROUTES.JOB_SEEKER.NOTIFICATION}`;
    return null;
  }, [currentUser?.roleName]);

  const handleClickItem = async (item: AppNotification) => {
    await handleRead(item.key);

    const targetPath = getNotificationTargetPath(item, currentUser?.roleName);
    if (targetPath) {
      if (isExternalNotificationTarget(targetPath)) {
        window.location.assign(targetPath);
      } else {
        push(targetPath);
      }
    }

    handleClose();
  };

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <IconButton size="large" aria-label={t('notification.openMenu', { defaultValue: 'Open notifications' })} color="inherit" onClick={openNotificationsMenu}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="noti-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: 2,
              width: { xs: 'calc(100vw - 24px)', sm: 500 },
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: 500,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ py: 2, px: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, pb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('footer.notifications')}
            </Typography>
            {count > 0 && (
              <Typography variant="caption" color="text.secondary">
                {t('notification.unreadCount', { count: unreadCount, defaultValue: '{{count}} unread' })}
              </Typography>
            )}
          </Stack>
          <Box sx={{ overflowY: 'auto', maxHeight: 450 }}>
            <Box sx={{ p: 1 }}>
              {isLoading && notifications.length === 0 ? (
                <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : notifications.length === 0 ? (
                <Typography textAlign="center" variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('notification.empty')}
                </Typography>
              ) : (
                notifications.map((value) => (
                  <NotificationCardItem key={value.key} value={value} onClickItem={handleClickItem} onRemove={handleRemove} />
                ))
              )}
            </Box>
          </Box>

          <NotificationCardFooter
            hasMore={hasMore}
            isLoading={isLoading}
            notificationsLength={notifications.length}
            onLoadMore={loadMore}
            onMarkAllRead={handleMakeAllRead}
            onClearAll={handleRemoveAll}
            onViewAll={allNotificationsPath ? () => {
              handleClose();
              push(allNotificationsPath);
            } : undefined}
          />
        </Box>
      </Menu>
    </React.Fragment>
  );
};

export default NotificationCard;
