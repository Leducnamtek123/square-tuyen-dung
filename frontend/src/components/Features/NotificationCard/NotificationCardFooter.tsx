import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { useTranslation } from 'react-i18next';

type Props = {
  hasMore: boolean;
  isLoading?: boolean;
  notificationsLength: number;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onViewAll?: () => void;
};

const NotificationCardFooter = ({
  hasMore,
  isLoading = false,
  notificationsLength,
  onLoadMore,
  onMarkAllRead,
  onClearAll,
  onViewAll,
}: Props) => {
  const { t } = useTranslation('common');

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={1}
      sx={{ px: 1, pt: 1 }}
    >
      {hasMore ? (
        <Button size="small" onClick={onLoadMore} disabled={isLoading}>
          {t('notification.loadMore', { defaultValue: 'Load more' })}
        </Button>
      ) : (
        <Box />
      )}

      {notificationsLength > 0 && (
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
          {onViewAll && (
            <Button size="small" startIcon={<OpenInFullIcon />} onClick={onViewAll}>
              {t('notification.viewAll', { defaultValue: 'View all' })}
            </Button>
          )}
          <Button size="small" startIcon={<DoneAllIcon />} onClick={onMarkAllRead} disabled={isLoading}>
            {t('notification.markAllRead')}
          </Button>
          <Button size="small" color="error" startIcon={<DeleteSweepIcon />} onClick={onClearAll} disabled={isLoading}>
            {t('clearAll')}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default NotificationCardFooter;
