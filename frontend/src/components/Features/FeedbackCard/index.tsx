import React from 'react';
import {
  Avatar,
  Box,
  Card,
  Chip,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTranslation } from 'react-i18next';

export type FeedbackUserType = 'employer' | 'candidate';

export interface FeedbackCardProps {
  id?: string | number;
  avatarUrl?: string;
  fullName?: string;
  content?: string;
  roleTitle?: string;
  companyName?: string;
  companyLogo?: string;
  userType?: FeedbackUserType;
  rating?: number;
  impactTag?: string;
  verified?: boolean;
}

const pickFallbackAvatar = (seed: string | number) => {
  const avatars = [
    '/images/avatars/user-1.jpg',
    '/images/avatars/user-2.jpg',
    '/images/avatars/user-3.jpg',
    '/images/avatars/user-4.jpg',
    '/images/avatars/user-5.jpg',
    '/images/avatars/user-6.jpg',
  ];
  const num = typeof seed === 'number' ? seed : String(seed).length;
  return avatars[Math.abs(num) % avatars.length];
};

const FeedbackCard = ({
  id,
  avatarUrl = '',
  fullName = '',
  content = '',
  roleTitle,
  companyName,
  userType = 'candidate',
  rating = 5,
  impactTag,
  verified = true,
}: FeedbackCardProps) => {
  const { t } = useTranslation('public');
  const fallbackAvatar = React.useMemo(() => pickFallbackAvatar(id || fullName), [id, fullName]);
  const resolvedAvatar = avatarUrl || fallbackAvatar;
  const isEmployer = userType === 'employer' || Boolean(companyName);

  const displayRole = roleTitle || (isEmployer ? t('feedback.employerRole', 'Nhà tuyển dụng') : t('feedback.candidateRole', 'Ứng viên tìm việc'));
  const displayImpact =
    impactTag ||
    (isEmployer
      ? t('feedback.employerImpact', 'Tuyển dụng nhanh & chính xác')
      : t('feedback.candidateImpact', 'Ứng tuyển thành công'));

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: 280,
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.9)',
        bgcolor: '#ffffff',
        boxShadow: '0 2px 12px -2px rgba(15, 23, 42, 0.04)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 28px -6px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box>
        {/* Header: User Avatar + Name + Role + Company/Persona Badge */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={resolvedAvatar}
                alt={fullName}
                sx={{
                  width: 46,
                  height: 46,
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                }}
              />
              {verified && (
                <VerifiedIcon
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    fontSize: 16,
                    color: '#2563eb',
                    bgcolor: '#ffffff',
                    borderRadius: '50%',
                  }}
                />
              )}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: '#0f172a',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fullName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.775rem',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayRole}
              </Typography>
            </Box>
          </Stack>

          {/* Right badge: Company or Persona pill */}
          <Box sx={{ flexShrink: 0, ml: 1 }}>
            {companyName ? (
              <Chip
                icon={<BusinessRoundedIcon sx={{ fontSize: '14px !important', color: '#64748b' }} />}
                label={companyName}
                size="small"
                sx={{
                  bgcolor: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 26,
                  maxWidth: 150,
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    px: 0.75,
                  },
                }}
              />
            ) : (
              <Chip
                icon={<PersonOutlineRoundedIcon sx={{ fontSize: '14px !important', color: '#64748b' }} />}
                label={isEmployer ? t('feedback.enterpriseBadge', 'Doanh nghiệp') : t('feedback.candidateBadge', 'Ứng viên')}
                size="small"
                sx={{
                  bgcolor: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 26,
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            )}
          </Box>
        </Stack>

        {/* Star Rating & Quote mark */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Rating
            value={rating}
            readOnly
            size="small"
            sx={{
              color: '#f59e0b',
              fontSize: '1rem',
            }}
          />
          <FormatQuoteRoundedIcon sx={{ color: '#cbd5e1', fontSize: 24, transform: 'rotate(180deg)' }} />
        </Stack>

        {/* Content Body */}
        <Typography
          variant="body2"
          sx={{
            color: '#334155',
            lineHeight: 1.65,
            fontSize: '0.875rem',
            minHeight: 68,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {content}
        </Typography>
      </Box>

      {/* Footer: Impact Metric Tag */}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <CheckCircleRoundedIcon
            sx={{
              fontSize: 15,
              color: '#2563eb',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayImpact}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
};

const Loading = () => (
  <Card
    elevation={0}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: 280,
      p: { xs: 2.5, sm: 3 },
      borderRadius: 4,
      border: '1px solid rgba(226, 232, 240, 0.9)',
      bgcolor: '#ffffff',
    }}
  >
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={48} height={48} />
          <Box>
            <Skeleton variant="text" width={110} height={22} />
            <Skeleton variant="text" width={80} height={16} />
          </Box>
        </Stack>
        <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 2 }} />
      </Stack>
      <Skeleton variant="text" width={90} height={20} sx={{ mb: 1.5 }} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="92%" height={18} />
      <Skeleton variant="text" width="75%" height={18} />
    </Box>
    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
      <Skeleton variant="text" width="65%" height={18} />
    </Box>
  </Card>
);

FeedbackCard.Loading = Loading;

export default FeedbackCard;
