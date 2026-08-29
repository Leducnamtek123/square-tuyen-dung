'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  Skeleton,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useAppliedResumes } from '../hooks/useEmployerQueries';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';

dayjs.extend(relativeTime);

export default function RecentApplicationsWidget() {
  const { t, i18n } = useTranslation('employer');
  const { data, isLoading } = useAppliedResumes({ pageSize: 4, page: 1 });

  const applications = data?.results || [];
  const appliedProfilesHref = localizeRoutePath(`/${ROUTES.EMPLOYER.APPLIED_PROFILE}`, i18n.language);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 10px 25px -5px rgba(15, 23, 42, 0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Widget Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 1.5,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
            }}
          >
            <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0F172A', lineHeight: 1.2 }}>
              Ứng viên mới nộp hồ sơ
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Danh sách hồ sơ ứng tuyển mới nhất
            </Typography>
          </Box>
        </Stack>

        <Button
          component={Link}
          href={appliedProfilesHref}
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
          sx={{
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#2563EB',
            borderRadius: '8px',
            px: 1.25,
            py: 0.5,
            '&:hover': {
              bgcolor: '#EFF6FF',
            },
          }}
        >
          Xem tất cả
        </Button>
      </Box>

      {/* Widget Body */}
      {isLoading ? (
        <Stack spacing={2} sx={{ flexGrow: 1, my: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton width="40%" height={20} />
                <Skeleton width="70%" height={16} />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : applications.length === 0 ? (
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
            Chưa có ứng viên nào nộp hồ sơ gần đây
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
          {applications.map((app) => {
            const candidateName =
              app.fullName ||
              app.userDict?.fullName ||
              'Ứng viên';

            const jobTitle = app.jobName || app.jobPostDict?.jobName || 'Vị trí tuyển dụng';
            const aiScore = app.aiAnalysisScore || app.aiAnalysisEffectiveScore;
            const applyTime = app.createAt ? dayjs(app.createAt).locale('vi').fromNow() : '';

            return (
              <Box
                key={app.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.25,
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                  },
                }}
              >
                {/* Left: Avatar & Candidate Info */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#2563EB',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                    }}
                  >
                    {candidateName.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: '#0F172A',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {candidateName}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {jobTitle}
                    </Typography>
                  </Box>
                </Stack>

                {/* Right: AI Score & Time */}
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0 }}>
                  {typeof aiScore === 'number' && aiScore > 0 ? (
                    <Chip
                      icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
                      label={`${aiScore}% AI`}
                      size="small"
                      sx={{
                        bgcolor: '#DCFCE7',
                        color: '#166534',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        height: 24,
                        border: '1px solid #BBF7D0',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  ) : null}

                  {applyTime && (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#94A3B8' }}>
                      <AccessTimeIcon sx={{ fontSize: 13 }} />
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 500 }}>
                        {applyTime}
                      </Typography>
                    </Stack>
                  )}

                  <Button
                    component={Link}
                    href={appliedProfilesHref}
                    size="small"
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      borderColor: '#E2E8F0',
                      color: '#334155',
                      minWidth: 'auto',
                      px: 1.2,
                      py: 0.4,
                      '&:hover': {
                        bgcolor: '#EFF6FF',
                        borderColor: '#93C5FD',
                        color: '#2563EB',
                      },
                    }}
                  >
                    Xem
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
