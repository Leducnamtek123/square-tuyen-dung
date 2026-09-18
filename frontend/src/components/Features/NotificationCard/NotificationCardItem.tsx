import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
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

  const tone = React.useMemo(() => {
    const type = String(value?.type || '').toUpperCase();
    const isRead = Boolean(value?.is_read);

    let categoryIcon = NotificationsActiveIcon;
    let categoryAccent = '#2563eb';

    if (type.includes('NEW_MESSAGE')) {
      categoryIcon = ChatBubbleOutlineIcon;
      categoryAccent = '#2563eb';
    } else if (type.includes('APPLY_JOB')) {
      categoryIcon = WorkOutlineIcon;
      categoryAccent = '#ea580c';
    } else if (type.includes('POST_VERIFY_REQUIRED')) {
      categoryIcon = VerifiedOutlinedIcon;
      categoryAccent = '#2563eb';
    }

    if (isRead) {
      return {
        icon: categoryIcon,
        accent: '#334155',
        softBg: '#ffffff',
        border: 'rgba(226, 232, 240, 0.8)',
        badgeBg: '#94a3b8',
        tagBg: '#f1f5f9',
        tagColor: '#64748b',
        label: t('notification.read'),
        isRead: true,
      };
    }

    return {
      icon: categoryIcon,
      accent: categoryAccent,
      softBg: 'rgba(37, 99, 235, 0.04)',
      border: 'rgba(37, 99, 235, 0.16)',
      badgeBg: categoryAccent,
      tagBg: 'rgba(37, 99, 235, 0.1)',
      tagColor: '#2563eb',
      label: t('notification.new'),
      isRead: false,
    };
  }, [t, value?.is_read, value?.type]);

  const ToneIcon = tone.icon;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClickItem(value);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1.75}
      alignItems="flex-start"
      sx={{
        position: 'relative',
        p: 1.75,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: tone.border,
        bgcolor: tone.softBg,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
          borderColor: tone.isRead ? '#cbd5e1' : 'rgba(37, 99, 235, 0.3)',
        },
      }}
    >
      <Box
        sx={{ cursor: 'pointer', flexShrink: 0, pt: 0.25 }}
        onClick={() => onClickItem(value)}
        role="button"
        tabIndex={0}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            border: '1px solid',
            borderColor: tone.border,
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          }}
        >
          <MuiImageCustom
            width={48}
            height={48}
            src={value?.image || value?.imageUrl || IMAGES.notificationImageDefault}
            sx={{
              p: 0.5,
              borderRadius: 1.5,
              objectFit: 'contain',
            }}
            duration={500}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: tone.badgeBg,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            <ToneIcon sx={{ fontSize: 11 }} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{ cursor: 'pointer', minWidth: 0, pr: 3 }}
        flex={1}
        onClick={() => onClickItem(value)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {!tone.isRead && (
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#2563eb',
                  flexShrink: 0,
                }}
              />
            )}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: tone.isRead ? 500 : 700,
                color: tone.isRead ? 'text.primary' : '#0f172a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem',
              }}
            >
              {value.title}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.8125rem',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {value.content}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
              <TimeAgo date={(value?.time?.seconds ?? 0) * 1000} type="fromNow" />
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: tone.tagColor,
                fontWeight: 600,
                px: 1,
                py: 0.2,
                bgcolor: tone.tagBg,
                borderRadius: 1,
                fontSize: '0.7rem',
              }}
            >
              {tone.label}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton
          aria-label={t('actions.delete')}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(value.key);
          }}
          sx={{
            color: 'text.disabled',
            p: 0.5,
            transition: 'all 0.2s',
            '&:hover': {
              color: 'error.main',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
            },
          }}
        >
          <ClearIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default NotificationCardItem;
