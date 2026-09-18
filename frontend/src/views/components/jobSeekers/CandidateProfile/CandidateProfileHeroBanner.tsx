'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Stack,
  Tooltip,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface CandidateProfileHeroBannerProps {
  fullName: string;
  title?: string;
  avatarUrl?: string;
  coverUrl?: string;
  experience?: string;
  updatedAt?: string;
  isJobSeeking?: boolean;
  isSubmittingStatus?: boolean;
  location?: string;
  onEditClick: () => void;
  onAvatarChange?: (file: File, localUrl: string) => void;
  onCoverChange?: (file: File, localUrl: string) => void;
  onViewCvClick?: () => void;
  onDownloadCvClick?: () => void;
  onSeekingStatusChange?: (newStatus: boolean) => Promise<void> | void;
}

const CandidateProfileHeroBanner: React.FC<CandidateProfileHeroBannerProps> = ({
  fullName,
  title = '',
  avatarUrl,
  coverUrl,
  experience,
  updatedAt,
  isJobSeeking = true,
  isSubmittingStatus = false,
  location = '',
  onEditClick,
  onAvatarChange,
  onCoverChange,
  onViewCvClick,
  onDownloadCvClick,
  onSeekingStatusChange,
}) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const [seekingStatus, setSeekingStatus] = React.useState(isJobSeeking);
  const [currentAvatar, setCurrentAvatar] = React.useState(avatarUrl);
  const [currentCover, setCurrentCover] = React.useState(coverUrl);

  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setSeekingStatus(isJobSeeking);
  }, [isJobSeeking]);

  React.useEffect(() => {
    setCurrentAvatar(avatarUrl);
  }, [avatarUrl]);

  React.useEffect(() => {
    setCurrentCover(coverUrl);
  }, [coverUrl]);

  const handleToggleSeeking = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    setSeekingStatus(newStatus);
    if (onSeekingStatusChange) {
      try {
        await onSeekingStatusChange(newStatus);
      } catch {
        setSeekingStatus(!newStatus);
      }
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCurrentAvatar(url);
      onAvatarChange?.(file, url);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCurrentCover(url);
      onCoverChange?.(file, url);
    }
  };

  return (
    <Box
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
        mb: 3,
      }}
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarFile}
      />
      <input
        type="file"
        ref={coverInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleCoverFile}
      />

      {/* Top Cover Banner */}
      <Box
        sx={{
          height: { xs: 130, sm: 150 },
          background: currentCover
            ? `url(${currentCover}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          p: 2,
        }}
      >
        <Tooltip title={t('jobSeeker:candidateProfile.hero.changeCoverTooltip', { defaultValue: 'Bấm để chọn và tải ảnh bìa mới từ máy tính' })}>
          <Button
            size="small"
            onClick={() => coverInputRef.current?.click()}
            startIcon={<PhotoCameraIcon sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: '0.775rem',
              fontWeight: 700,
              px: 1.75,
              py: 0.75,
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
              },
            }}
          >
            {t('jobSeeker:candidateProfile.hero.changeCover', { defaultValue: 'Đổi ảnh bìa' })}
          </Button>
        </Tooltip>
      </Box>

      {/* Profile Header Content Area */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          pb: 3,
          pt: 1,
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          {/* Avatar & Basic Info */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mt: -6 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={currentAvatar || avatarUrl || undefined}
                sx={{
                  width: { xs: 90, sm: 104 },
                  height: { xs: 90, sm: 104 },
                  bgcolor: '#2563eb',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  border: '4px solid #ffffff',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.15)',
                }}
              >
                {fullName ? fullName.trim().charAt(0).toUpperCase() : ''}
              </Avatar>
              <Tooltip title={t('jobSeeker:candidateProfile.hero.changeAvatarTooltip', { defaultValue: 'Bấm để chọn và cập nhật ảnh đại diện mới' })}>
                <IconButton aria-label="Thao tác"
                  size="small"
                  onClick={() => avatarInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    p: 0.75,
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    '&:hover': { backgroundColor: '#2563eb' },
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ pt: { xs: 6, sm: 6.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {fullName || t('jobSeeker:candidateProfile.hero.candidateFallback', { defaultValue: 'Ứng viên' })}
                </Typography>
                <Chip
                  size="small"
                  label={t('jobSeeker:candidateProfile.hero.verified', { defaultValue: 'Đã xác thực' })}
                  sx={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 700,
                    fontSize: '0.675rem',
                    height: 20,
                  }}
                />
              </Box>

              <Typography variant="subtitle2" sx={{ color: title ? '#334155' : '#94a3b8', fontWeight: title ? 700 : 500, fontSize: '0.925rem', mt: 0.5 }}>
                {title || t('jobSeeker:candidateProfile.hero.noTitle', { defaultValue: 'Chưa cập nhật chức danh' })}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mt: 0.75, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: location ? '#475569' : '#94a3b8', fontSize: '0.8rem' }}>
                    {location || t('jobSeeker:candidateProfile.hero.noLocation', { defaultValue: 'Chưa cập nhật địa điểm' })}
                  </Typography>
                </Box>
                {experience && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WorkOutlineIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>
                      {experience}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.25} sx={{ width: { xs: '100%', sm: 'auto' }, pt: { xs: 1, sm: 0 } }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onEditClick}
              startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '12px',
                borderColor: '#cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.825rem',
                textTransform: 'none',
                px: 2,
                py: 0.9,
                '&:hover': {
                  borderColor: '#0f172a',
                  backgroundColor: '#f8fafc',
                },
              }}
            >
              {t('jobSeeker:candidateProfile.hero.edit', { defaultValue: 'Chỉnh sửa' })}
            </Button>

            {onViewCvClick && (
              <Button
                variant="outlined"
                size="small"
                onClick={onViewCvClick}
                startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '12px',
                  borderColor: '#cbd5e1',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  textTransform: 'none',
                  px: 2,
                  py: 0.9,
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: '#eff6ff',
                  },
                }}
              >
                {t('jobSeeker:candidateProfile.hero.viewCv', { defaultValue: 'Xem CV' })}
              </Button>
            )}

            {onDownloadCvClick && (
              <Button
                variant="contained"
                size="small"
                onClick={onDownloadCvClick}
                startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  textTransform: 'none',
                  px: 2,
                  py: 0.9,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                }}
              >
                {t('jobSeeker:candidateProfile.hero.downloadCv', { defaultValue: 'Tải CV PDF' })}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Bottom Banner Status Bar */}
        <Box
          sx={{
            pt: 2,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {/* Job Seeking Status Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={seekingStatus}
                  onChange={handleToggleSeeking}
                  disabled={isSubmittingStatus}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                  {t('jobSeeker:candidateProfile.hero.seekingSwitchLabel', { defaultValue: 'Bật trạng thái nhận cơ hội việc làm' })}
                </Typography>
              }
              sx={{ mr: 0 }}
            />
            <Chip
              size="small"
              label={seekingStatus ? t('jobSeeker:candidateProfile.hero.seekingActive', { defaultValue: 'Đang mở cửa nhận việc' }) : t('jobSeeker:candidateProfile.hero.seekingInactive', { defaultValue: 'Đang tạm dừng nhận việc' })}
              sx={{
                backgroundColor: seekingStatus ? '#dcfce7' : '#f1f5f9',
                color: seekingStatus ? '#15803d' : '#64748b',
                fontWeight: 700,
                fontSize: '0.725rem',
                borderRadius: '8px',
              }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem' }}>
            {t('jobSeeker:candidateProfile.hero.lastUpdated', {
              date: updatedAt && dayjs(updatedAt).isValid() ? dayjs(updatedAt).format('DD/MM/YYYY') : t('jobSeeker:account.notUpdated', { defaultValue: 'Chưa cập nhật' }),
              defaultValue: `Hồ sơ cập nhật lần cuối: ${updatedAt && dayjs(updatedAt).isValid() ? dayjs(updatedAt).format('DD/MM/YYYY') : 'Chưa cập nhật'}`
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CandidateProfileHeroBanner;
