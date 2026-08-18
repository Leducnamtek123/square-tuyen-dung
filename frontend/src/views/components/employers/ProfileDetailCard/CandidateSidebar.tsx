'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import dayjs from '@/configs/dayjs-config';

import toastMessages from '@/utils/toastMessages';
import { getSafeResourceUrl } from '@/utils/safeExternalUrl';
import { useConfig } from '@/hooks/useConfig';
import { tConfig } from '@/utils/tConfig';
import type { ResumeDetailResponse } from '@/types/models';

interface CandidateSidebarProps {
  profileDetail: ResumeDetailResponse;
  fileUrl?: string;
}

export const CandidateSidebar: React.FC<CandidateSidebarProps> = ({ profileDetail, fileUrl }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [isSavingRating, setIsSavingRating] = useState(false);

  const user = profileDetail.user || (profileDetail as any).userDict || {};
  const seeker = profileDetail.jobSeekerProfile || (profileDetail as any).jobSeekerProfileDict || {};

  const email = user.email || seeker.userDict?.email || '';
  const phone = seeker.phone || user.phone || '';
  const workLocation = tConfig(
    typeof profileDetail.city === 'object' && profileDetail.city
      ? profileDetail.city.name
      : allConfig?.cityDict?.[String(profileDetail.city ?? '')]
  );

  const actualFileUrl =
    fileUrl ||
    profileDetail.fileUrl ||
    (profileDetail as any).resumeFileUrl ||
    (profileDetail.sourcePayload as any)?.cvFileUrl ||
    (profileDetail.sourcePayload as any)?.cv_file_url ||
    '';
  const safeFileUrl = getSafeResourceUrl(actualFileUrl);

  const updatedAt = profileDetail.updateAt || profileDetail.createAt;
  const lastUpdatedText = updatedAt ? dayjs(updatedAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật';
  const viewCount = profileDetail.viewEmployerNumber || 0;

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined' && text) {
      navigator.clipboard.writeText(text);
      toastMessages.success(`Đã sao chép ${label}`);
    }
  };

  const handleSaveRating = () => {
    if (!rating && !comment.trim()) {
      toastMessages.warn('Vui lòng chọn số sao hoặc nhập nhận xét');
      return;
    }

    setIsSavingRating(true);
    setTimeout(() => {
      setIsSavingRating(false);
      toastMessages.success('Đã lưu đánh giá ứng viên');
    }, 400);
  };

  return (
    <Stack spacing={3}>
      {/* 1. THÔNG TIN LIÊN HỆ */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Thông tin liên hệ
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {/* Email Item */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#F1F5F9',
                color: '#2563EB',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              <EmailOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                Email
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: email ? '#0F172A' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  lineHeight: 1.3,
                  overflowWrap: 'anywhere',
                }}
              >
                {email || 'Chưa cập nhật'}
              </Typography>
            </Box>
            {email && (
              <Tooltip title="Sao chép email">
                <IconButton aria-label="Thao tác" size="small" onClick={() => handleCopy(email, 'email')} sx={{ color: '#94A3B8' }}>
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Phone Item */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#F1F5F9',
                color: '#2563EB',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              <PhoneOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                Số điện thoại
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: phone ? '#0F172A' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  lineHeight: 1.3,
                }}
              >
                {phone || 'Chưa cập nhật'}
              </Typography>
            </Box>
            {phone && (
              <Tooltip title="Sao chép số điện thoại">
                <IconButton aria-label="Thao tác" size="small" onClick={() => handleCopy(phone, 'số điện thoại')} sx={{ color: '#94A3B8' }}>
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Work Location Item */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#F1F5F9',
                color: '#2563EB',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              <PlaceOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                Địa điểm làm việc
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: workLocation ? '#0F172A' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  lineHeight: 1.3,
                }}
              >
                {workLocation || 'Chưa cập nhật'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* 2. THÔNG TIN NHANH */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Thông tin nhanh
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {/* Status Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <AssignmentIndOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8125rem' }}>
                Trạng thái hồ sơ
              </Typography>
            </Stack>
            <Chip
              label="Chưa cập nhật"
              size="small"
              sx={{
                bgcolor: '#FEF3C7',
                color: '#D97706',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 22,
                borderRadius: '6px',
              }}
            />
          </Stack>

          {/* Views Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <RemoveRedEyeOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8125rem' }}>
                Lượt xem
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.8125rem' }}>
              {viewCount} lần
            </Typography>
          </Stack>

          {/* Last Updated Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8125rem' }}>
                Cập nhật lần cuối
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.8125rem' }}>
              {lastUpdatedText}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* 3. THAO TÁC NHANH */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <MoreHorizIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Thao tác nhanh
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {safeFileUrl ? (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                component="a"
                href={safeFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                sx={{
                  py: 1.1,
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  bgcolor: '#2563EB',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  '&:hover': {
                    bgcolor: '#1D4ED8',
                  },
                }}
              >
                Mở tab mới
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                component="a"
                href={safeFileUrl}
                download
                startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  py: 1.1,
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                    borderColor: '#94A3B8',
                  },
                }}
              >
                Tải xuống hồ sơ
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              disabled
              startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 1.1,
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.875rem',
              }}
            >
              Chưa có file CV
            </Button>
          )}
        </Stack>
      </Paper>

      {/* 4. ĐÁNH GIÁ NHANH */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
            Đánh giá nhanh
          </Typography>
          <Rating
            value={rating}
            onChange={(_, val) => setRating(val)}
            size="small"
            icon={<StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />}
            emptyIcon={<StarBorderIcon sx={{ color: '#CBD5E1', fontSize: 18 }} />}
          />
        </Stack>

        <TextField
          placeholder="Nhập nhận xét của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={3}
          fullWidth
          size="small"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: '#F8FAFC',
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: '#E2E8F0',
              },
              '&:hover fieldset': {
                borderColor: '#CBD5E1',
              },
            },
          }}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={isSavingRating}
          onClick={handleSaveRating}
          sx={{
            py: 1,
            borderRadius: '10px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.8125rem',
            bgcolor: '#F1F5F9',
            color: '#475569',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#E2E8F0',
              color: '#0F172A',
            },
          }}
        >
          {isSavingRating ? 'Đang lưu...' : 'Lưu đánh giá'}
        </Button>
      </Paper>
    </Stack>
  );
};

export default CandidateSidebar;
