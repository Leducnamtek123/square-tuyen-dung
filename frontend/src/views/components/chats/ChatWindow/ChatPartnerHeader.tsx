import React from 'react';
import { Avatar, Badge, Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import type { UserAccount } from '../LeftSidebar/useChatRooms';

interface ChatPartnerHeaderProps {
  partner?: UserAccount | null;
  isMobile?: boolean;
  onBack?: () => void;
  onToggleRightDrawer?: () => void;
}

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1]?.charAt(0)?.toUpperCase() || name.charAt(0)?.toUpperCase() || 'U';
};

export const ChatPartnerHeader = ({
  partner,
  isMobile,
  onBack,
  onToggleRightDrawer,
}: ChatPartnerHeaderProps) => {
  const { t } = useTranslation('chat');
  const partnerName = partner?.name || partner?.company?.companyName || t('conversationPartner', 'Người liên hệ');
  const partnerCompany = partner?.company?.companyName;
  const partnerEmail = partner?.email;
  const subtext =
    partnerCompany && partnerCompany !== partnerName
      ? partnerCompany
      : partnerEmail || t('activeNow', 'Đang hoạt động');
  const safeAvatarUrl =
    partner?.avatarUrl &&
    partner.avatarUrl.trim() &&
    partner.avatarUrl !== 'null' &&
    partner.avatarUrl !== 'undefined' &&
    partner.avatarUrl !== '[object Object]'
      ? partner.avatarUrl
      : undefined;

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2.5 },
        py: 1.25,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        {isMobile && onBack && (
          <IconButton
            size="small"
            onClick={onBack}
            aria-label={t('backToList', 'Quay lại danh sách')}
            sx={{
              mr: -0.5,
              color: '#475569',
              bgcolor: 'rgba(241, 245, 249, 0.8)',
              '&:hover': { bgcolor: 'rgba(226, 232, 240, 1)' },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}

        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#22c55e',
              color: '#22c55e',
              boxShadow: '0 0 0 2px #fff',
            },
          }}
        >
          <Avatar
            src={safeAvatarUrl}
            alt={partnerName}
            sx={{
              width: { xs: 40, sm: 46 },
              height: { xs: 40, sm: 46 },
              bgcolor: 'primary.main',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#fff',
              border: '2px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
            }}
          >
            {getInitials(partnerName)}
          </Avatar>
        </Badge>

        <Stack spacing={0.2} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                color: '#0f172a',
                letterSpacing: '-0.01em',
              }}
            >
              {partnerName}
            </Typography>
            {partnerCompany ? (
              <Chip
                icon={<WorkOutlineRoundedIcon style={{ fontSize: 12 }} />}
                label={t('employerBadge', 'Nhà tuyển dụng')}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  borderRadius: '6px',
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            ) : (
              <Chip
                icon={<PersonOutlineRoundedIcon style={{ fontSize: 12 }} />}
                label={t('candidateBadge', 'Ứng viên')}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  borderRadius: '6px',
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            )}
          </Stack>

          <Typography
            variant="caption"
            noWrap
            sx={{
              color: '#64748b',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {subtext}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        {onToggleRightDrawer && (
          <Tooltip title={t('viewDetails', 'Xem thông tin liên quan')} arrow>
            <IconButton
              size="small"
              onClick={onToggleRightDrawer}
              sx={{
                color: '#475569',
                bgcolor: 'rgba(241, 245, 249, 0.8)',
                borderRadius: 2,
                p: 0.75,
                '&:hover': {
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                },
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
};
