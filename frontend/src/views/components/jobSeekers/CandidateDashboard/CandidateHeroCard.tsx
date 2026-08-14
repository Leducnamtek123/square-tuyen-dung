'use client';

import React from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import type { User } from '@/types/models';
import type { ExtendedResume } from '@/components/Features/CVDoc';
import dayjs from 'dayjs';

interface CandidateHeroCardProps {
  user: User | null;
  resume: ExtendedResume | null;
  completenessPercent?: number;
}

const CandidateHeroCard = ({
  user,
  resume,
  completenessPercent = 0,
}: CandidateHeroCardProps) => {
  const displayName = user?.fullName || 'Ứng viên';
  const displayTitle = resume?.title || 'Chưa cập nhật chức danh';
  const displayEmail = user?.email || 'Chưa cập nhật';
  const displayPhone = (user as { phone?: string })?.phone || (user as { phoneNumber?: string })?.phoneNumber || (resume as any)?.jobSeekerProfile?.phone || 'Chưa cập nhật';
  const displayLocation = (typeof (resume as any)?.city === 'object' ? (resume as any)?.city?.name : (resume as any)?.city) || 'Chưa cập nhật';
  const rawDob = (user as any)?.jobSeekerProfile?.birthday;
  const displayDob = rawDob && dayjs(rawDob).isValid() ? dayjs(rawDob).format('DD/MM/YYYY') : 'Chưa cập nhật';
  const rawGender = (user as any)?.jobSeekerProfile?.gender;
  const displayGender = rawGender === 'M' ? 'Nam' : rawGender === 'F' ? 'Nữ' : rawGender ? 'Khác' : 'Chưa cập nhật';
  const rawUpdated = resume?.updateAt || (resume as any)?.createdAt;
  const displayUpdated = rawUpdated && dayjs(rawUpdated).isValid() ? dayjs(rawUpdated).format('DD/MM/YYYY') : 'Chưa cập nhật';

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'flex-start', lg: 'center' },
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        {/* Profile Info Left */}
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Avatar with Camera Icon */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatarUrl || undefined}
              sx={{
                width: 90,
                height: 90,
                bgcolor: '#cbd5e1',
                color: '#ffffff',
                fontSize: '2.25rem',
                fontWeight: 700,
                border: '3px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                p: 0.5,
                '&:hover': { backgroundColor: '#f8fafc' },
              }}
            >
              <CameraAltOutlinedIcon sx={{ fontSize: 14, color: '#475569' }} />
            </IconButton>

            {/* Green Dot Active Status */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 1,
              }}
            >
              <Chip
                size="small"
                label="Đang tìm việc"
                sx={{
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.725rem',
                  height: 22,
                  '& .MuiChip-label': { px: 1 },
                }}
                icon={
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#16a34a',
                      ml: 1,
                    }}
                  />
                }
              />
            </Box>
          </Box>

          {/* Text Meta Info */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {displayName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#334155' }}>
                {displayTitle}
              </Typography>
              <EditOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8', cursor: 'pointer' }} />
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1} sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ fontSize: '0.825rem' }}>{displayLocation}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ fontSize: '0.825rem' }}>{displayEmail}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ fontSize: '0.825rem' }}>{displayPhone}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#f1f5f9' }} />

            <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1} sx={{ color: '#64748b' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>Ngày sinh: {displayDob}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonOutlineOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>{displayGender}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>Cập nhật: {displayUpdated}</Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Profile Completeness Ring Right */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            pl: { lg: 3 },
            borderLeft: { lg: '1px solid #f1f5f9' },
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={68}
              thickness={4.5}
              sx={{ color: '#e2e8f0' }}
            />
            <CircularProgress
              variant="determinate"
              value={completenessPercent}
              size={68}
              thickness={4.5}
              sx={{
                color: '#2563eb',
                position: 'absolute',
                left: 0,
                strokeLinecap: 'round',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="subtitle2" component="div" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {completenessPercent}%
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Mức độ hoàn thiện hồ sơ
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
              Hồ sơ đầy đủ sẽ giúp bạn nổi bật hơn
            </Typography>

            <Button
              variant="contained"
              size="small"
              sx={{
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                fontWeight: 700,
                textTransform: 'none',
                px: 2,
                py: 0.75,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  boxShadow: 'none',
                },
              }}
            >
              Hoàn thiện hồ sơ
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CandidateHeroCard;
