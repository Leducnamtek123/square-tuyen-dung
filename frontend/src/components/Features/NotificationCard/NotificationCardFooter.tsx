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
    <Stack spacing={1}>
      {hasMore && (
        <Button
          fullWidth
          size="small"
          onClick={onLoadMore}
          disabled={isLoading}
          sx={{
            py: 0.75,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            bgcolor: 'action.hover',
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          {t('notification.loadMore')}
        </Button>
      )}

      {notificationsLength > 0 && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          {onViewAll ? (
            <Button
              size="small"
              startIcon={<OpenInFullIcon sx={{ fontSize: 15 }} />}
              onClick={onViewAll}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'primary.main',
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' },
              }}
            >
              {t('notification.viewAll')}
            </Button>
          ) : (
            <Box />
          )}

          <Button
            size="small"
            color="error"
            startIcon={<DeleteSweepIcon sx={{ fontSize: 16 }} />}
            onClick={onClearAll}
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              '&:hover': {
                color: 'error.main',
                bgcolor: 'rgba(239, 68, 68, 0.08)',
              },
            }}
          >
            {t('clearAll')}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default NotificationCardFooter;
