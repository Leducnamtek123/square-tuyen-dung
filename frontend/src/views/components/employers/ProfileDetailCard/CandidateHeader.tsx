'use client';

import React, { useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import toastMessages from '@/utils/toastMessages';
import type { ResumeDetailResponse } from '@/types/models';
import { useToggleSaveResumeOptimistic } from '../hooks/useEmployerQueries';
import { getSafeResourceUrl } from '@/utils/safeExternalUrl';

interface CandidateHeaderProps {
  profileDetail: ResumeDetailResponse;
  candidateName: string;
  avatarUrl?: string;
  locationText?: string;
  fileUrl?: string;
  sourceName?: string;
  candidateCode?: string;
}

const getInitials = (name?: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'UV';
  return parts.slice(-2).map((part) => part[0]).join('').toUpperCase();
};

export const CandidateHeader: React.FC<CandidateHeaderProps> = ({
  profileDetail,
  candidateName,
  avatarUrl,
  locationText,
  fileUrl,
  sourceName = 'Website InfoHR',
  candidateCode,
}) => {
  const { t } = useTranslation(['employer', 'common']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tags, setTags] = useState<string[]>(['Kinh nghiệm tốt', 'Phù hợp']);
  const { toggleSaveResume, isMutating } = useToggleSaveResumeOptimistic();
  const isSaved = Boolean((profileDetail as any).isSaved);


  const safeFileUrl = getSafeResourceUrl(fileUrl || profileDetail.fileUrl);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toastMessages.success(t('common:messages.copied', { defaultValue: 'Đã sao chép liên kết vào bộ nhớ tạm' }));
    }
    setAnchorEl(null);
  };

  const handleAddTag = () => {
    const newTag = prompt('Nhập tên tag mới cho ứng viên:');
    if (newTag && newTag.trim()) {
      setTags((prev) => [...prev, newTag.trim()]);
      toastMessages.success('Đã thêm tag');
    }
  };

  const code = candidateCode || (profileDetail.id ? `UV${String(profileDetail.id).padStart(8, '0')}` : '-');

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Soft Accent Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 400,
          height: '100%',
          background: 'radial-gradient(ellipse at top right, rgba(37, 99, 235, 0.04), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        spacing={3}
        sx={{ position: 'relative' }}
      >
        {/* Left: Avatar & Candidate Title */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          {/* Avatar with Online Status Indicator */}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#22C55E',
                color: '#22C55E',
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #FFFFFF',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
              },
            }}
          >
            <Avatar
              src={avatarUrl}
              sx={{
                width: { xs: 72, md: 84 },
                height: { xs: 72, md: 84 },
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                fontSize: { xs: '1.5rem', md: '1.875rem' },
                fontWeight: 800,
                border: '3px solid #F1F5F9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              {getInitials(candidateName)}
            </Avatar>
          </Badge>

          {/* Name, Position, Location & Tags */}
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.4rem', md: '1.75rem' },
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                {candidateName}
              </Typography>

              {/* Status Pill Badge */}
              <Chip
                label="Ứng viên tiềm năng"
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 24,
                  borderRadius: '6px',
                }}
              />
            </Stack>

            {/* Position / Title */}
            <Typography
              variant="body1"
              sx={{
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.95rem',
                mb: 1.25,
              }}
            >
              {profileDetail.title || 'Chưa cập nhật chức danh'}
            </Typography>

            {/* Location & Tags Row */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {locationText && (
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: '15px !important', color: '#64748B' }} />}
                  label={locationText}
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 26,
                    borderRadius: '6px',
                  }}
                />
              )}

              {tags.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    height: 24,
                    borderRadius: '6px',
                  }}
                />
              ))}

              <Chip
                icon={<AddIcon sx={{ fontSize: '13px !important' }} />}
                label="Thêm tag"
                size="small"
                onClick={handleAddTag}
                clickable
                sx={{
                  bgcolor: 'transparent',
                  color: '#2563EB',
                  border: '1px dashed #93C5FD',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 24,
                  borderRadius: '6px',
                  '&:hover': {
                    bgcolor: '#EFF6FF',
                  },
                }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* Right: Metadata (Candidate ID, Source) & Action CTAs */}
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ width: { xs: '100%', lg: 'auto' } }}
        >
          {/* Metadata Block */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                Mã ứng viên
              </Typography>
              <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 800, fontFamily: 'monospace' }}>
                {code}
              </Typography>
            </Box>

            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                Nguồn
              </Typography>
              <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 800 }}>
                {sourceName}
              </Typography>
            </Box>
          </Stack>

          {/* Primary Action Buttons */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {/* Save / Bookmark Button */}
            <Tooltip title={isSaved ? 'Đã lưu hồ sơ' : 'Lưu hồ sơ'}>
              <Button
                variant={isSaved ? 'contained' : 'outlined'}
                color={isSaved ? 'secondary' : 'inherit'}
                onClick={() => toggleSaveResume(profileDetail.slug)}
                disabled={isMutating}
                size="small"
                startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                sx={{
                  height: 38,
                  borderRadius: '8px',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                  borderColor: '#CBD5E1',
                }}
              >
                {isSaved ? 'Đã lưu' : 'Lưu'}
              </Button>
            </Tooltip>


            {/* Export Profile / CV Button */}
            {safeFileUrl ? (
              <Button
                variant="outlined"
                color="inherit"
                component="a"
                href={safeFileUrl}
                download
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{
                  height: 38,
                  borderRadius: '8px',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                    borderColor: '#94A3B8',
                  },
                }}
              >
                Xuất hồ sơ
              </Button>
            ) : null}

            {/* Quick Contact Button */}
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<EmailIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                const candidateEmail = profileDetail.user?.email || (profileDetail as any).email;
                const candidatePhone = profileDetail.user?.phone || (profileDetail as any).phone || (profileDetail as any).jobSeekerProfile?.phone;
                if (candidateEmail) {
                  window.open(`mailto:${candidateEmail}?subject=Trao đổi cơ hội việc làm từ Nhà tuyển dụng&body=Chào ${candidateName},`);
                } else if (candidatePhone) {
                  window.open(`tel:${candidatePhone}`);
                } else {
                  toastMessages.info('Ứng viên chưa cập nhật thông tin email hoặc số điện thoại.');
                }
              }}
              sx={{
                height: 38,
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.8125rem',
                boxShadow: 'none',
                bgcolor: '#2563EB',
                '&:hover': {
                  bgcolor: '#1D4ED8',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                },
              }}
            >
              Liên hệ ngay
            </Button>

            {/* More Options Dropdown */}
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                color: '#64748B',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                },
              }}
            >
              <MoreHorizIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  minWidth: 190,
                  p: 0.5,
                },
              }}
            >
              <MenuItem onClick={handleCopyLink} sx={{ borderRadius: '6px', py: 1, fontSize: '0.85rem' }}>
                <ListItemIcon>
                  <ContentCopyIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Sao chép liên kết" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  window.open(`mailto:${profileDetail.user?.email || ''}`);
                  setAnchorEl(null);
                }}
                sx={{ borderRadius: '6px', py: 1, fontSize: '0.85rem' }}
              >
                <ListItemIcon>
                  <EmailIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Gửi email cho ứng viên" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (typeof navigator !== 'undefined' && (navigator as any).share) {
                    (navigator as any).share({ title: candidateName, url: window.location.href });
                  } else {
                    handleCopyLink();
                  }
                  setAnchorEl(null);
                }}
                sx={{ borderRadius: '6px', py: 1, fontSize: '0.85rem' }}
              >
                <ListItemIcon>
                  <ShareIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Chia sẻ hồ sơ" />
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CandidateHeader;
