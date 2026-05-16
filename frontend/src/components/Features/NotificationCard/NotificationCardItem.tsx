import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import TimeAgo from '@/components/Common/TimeAgo';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { IMAGES } from '@/configs/constants';
import type { AppNotification } from '@/hooks/useNotifications';

export type NotificationItem = AppNotification;

type Props = {
  value: NotificationItem;
  onClickItem: (item: NotificationItem) => void;
  onRemove: (key: string) => void;
};

const NotificationCardItem = ({ value, onClickItem, onRemove }: Props) => {
  const { t } = useTranslation('common');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClickItem(value);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: value.is_read ? 'divider' : 'error.light',
        bgcolor: value.is_read ? 'background.paper' : 'rgba(211, 47, 47, 0.04)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          bgcolor: 'rgba(0,0,0,0.01)',
        },
      }}
    >
      <Box sx={{ cursor: 'pointer' }} onClick={() => onClickItem(value)} role="button" tabIndex={0}>
        <MuiImageCustom
          width={65}
          height={65}
          src={value?.image || value?.imageUrl || IMAGES.notificationImageDefault}
          sx={{
            p: 0.5,
            borderRadius: 1.5,
            maxHeight: 150,
            border: 0.5,
            borderColor: '#d1c4e9',
          }}
          duration={500}
        />
      </Box>

      <Box
        sx={{ cursor: 'pointer', minWidth: 0 }}
        flex={1}
        onClick={() => onClickItem(value)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: value?.is_read === true ? 400 : 600,
              color: value?.is_read === true ? 'text.secondary' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {value.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {value.content}
          </Typography>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.disabled">
              <TimeAgo date={(value?.time?.seconds ?? 0) * 1000} type="fromNow" />
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: value?.is_read ? 'text.disabled' : 'error.main',
                fontWeight: value?.is_read ? 400 : 500,
              }}
            >
              {value?.is_read === true
                ? t('notification.read', { defaultValue: 'Read' })
                : t('notification.new', { defaultValue: 'New' })}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box>
        <IconButton aria-label="delete" color="error" size="small" onClick={() => onRemove(value.key)}>
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default NotificationCardItem;
