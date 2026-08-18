'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import dayjs from 'dayjs';

import type { Resume } from '@/types/models';
import { CV_TYPES } from '@/configs/constants';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';

export interface MasterCandidateItemProps {
  resume: Resume;
  isSelected: boolean;
  onSelect: () => void;
  onSave: (slug: string) => void;
}

export const MasterCandidateItem: React.FC<MasterCandidateItemProps> = ({
  resume,
  isSelected,
  onSelect,
  onSave,
}) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

  const user = resume.userDict || resume.user;
  const fullName = user?.fullName || resume.title || 'Ứng viên';
  const age = resume.jobSeekerProfileDict?.old;
  const experienceLabel =
    resume.experience && allConfig?.experienceDict?.[resume.experience]
      ? tConfig(String(allConfig.experienceDict[resume.experience]))
      : null;
  const cityLabel =
    resume.city?.id && allConfig?.cityDict?.[resume.city.id]
      ? tConfig(String(allConfig.cityDict[resume.city.id]))
      : null;

  const matchScore = typeof resume.matchScore === 'number' ? resume.matchScore : 0;

  const updatedAtLabel = useMemo(() => {
    if (!resume.updateAt) return '';
    const now = dayjs();
    const updated = dayjs(resume.updateAt);
    const diffHours = now.diff(updated, 'hour');
    if (diffHours < 1) {
      const diffMins = Math.max(1, now.diff(updated, 'minute'));
      return `${diffMins} phút trước`;
    }
    if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    }
    if (diffHours < 48) {
      return 'Hôm qua';
    }
    return updated.format('DD/MM/YYYY');
  }, [resume.updateAt]);

  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 1.75,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : '#E2E8F0',
        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
        boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {/* Avatar */}
        <Avatar
          src={(user as any)?.avatar || (user as any)?.avatarUrl || undefined}
          variant="rounded"
          sx={{
            width: 46,
            height: 46,
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            flexShrink: 0,
            mt: 0.25,
          }}
        />

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                color: isSelected ? 'primary.main' : '#0F172A',
                lineHeight: 1.3,
              }}
            >
              {fullName}
              {age && String(age) !== '---' && (
                <Box component="span" sx={{ fontWeight: 500, color: '#64748B', ml: 0.5, fontSize: '0.78rem' }}>
                  ({age} tuổi)
                </Box>
              )}
            </Typography>

            <Tooltip title={resume.isSaved ? 'Bỏ lưu hồ sơ' : 'Lưu hồ sơ'} arrow>
              <IconButton
                size="small"
                aria-label={resume.isSaved ? 'Bỏ lưu hồ sơ' : 'Lưu hồ sơ'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(resume.slug);
                }}
                sx={{
                  p: 0.4,
                  color: resume.isSaved ? 'primary.main' : '#94A3B8',
                  '&:hover': { color: 'primary.main', bgcolor: '#EFF6FF' },
                }}
              >
                {resume.isSaved ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Active status & AI Match Score Chip */}
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mt: 0.4, mb: 0.5 }}>
            <Chip
              label="Đang tìm việc"
              size="small"
              sx={{
                height: 19,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#FEF3C7',
                color: '#D97706',
                borderRadius: '4px',
              }}
            />
            {matchScore > 0 && (
              <Chip
                icon={
                  <AutoAwesomeIcon
                    sx={{
                      fontSize: '12px !important',
                      color: matchScore >= 70 ? '#059669 !important' : '#2563EB !important',
                    }}
                  />
                }
                label={`${matchScore}% ${t('employer:profileCard.aiMatch.badgeText', 'Phù hợp')}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  bgcolor: matchScore >= 70 ? '#ECFDF5' : '#EFF6FF',
                  color: matchScore >= 70 ? '#059669' : '#2563EB',
                  border: `1px solid ${matchScore >= 70 ? '#A7F3D0' : '#BFDBFE'}`,
                  borderRadius: '6px',
                  pl: 0.25,
                }}
              />
            )}
          </Stack>

          {/* Job Title */}
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 600,
              color: '#334155',
              fontSize: '0.8125rem',
              lineHeight: 1.3,
            }}
          >
            {resume.title || 'Chưa cập nhật vị trí'}
          </Typography>

          {/* Experience & City Tags */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
            {experienceLabel && (
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.725rem', fontWeight: 500 }}>
                • {experienceLabel}
              </Typography>
            )}
            {cityLabel && (
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.725rem', fontWeight: 500 }}>
                • {cityLabel}
              </Typography>
            )}
          </Stack>

          {/* Bottom Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 500 }}>
              Cập nhật: {updatedAtLabel}
            </Typography>
            {resume.type === CV_TYPES.cvUpload && (
              <Chip
                icon={<PictureAsPdfIcon sx={{ fontSize: '12px !important', color: '#EF4444' }} />}
                label="CV PDF"
                size="small"
                sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 600 }}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default MasterCandidateItem;
