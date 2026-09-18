import React from 'react';
import { Box, Chip, IconButton, Stack, Typography, Tooltip } from '@mui/material';
import Link from 'next/link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import dayjs from '@/configs/dayjs-config';
import type { InterviewSession } from '@/types/models';

type StatusColor = 'success' | 'primary' | 'info' | 'error' | 'warning' | 'default';

interface UseInterviewListCardColumnsArgs {
  count: number;
  onDelete: (id: string | number) => void;
  onCancel: (roomName: string) => void;
}

const getStatusColor = (status: string): StatusColor => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'scheduled':
      return 'info';
    case 'cancelled':
      return 'error';
    case 'processing':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Hardcoded rgba values matching the theme palette.
 * Required because MUI v6 returns CSS variable strings (e.g. var(--mui-palette-info-main, #64748b))
 * from theme.palette[color].main, which alpha() cannot process → MUI error #9.
 */
const STATUS_BG_COLORS: Record<StatusColor, { bg: string; border: string; text: string }> = {
  success:  { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857' },
  primary:  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  info:     { bg: '#F0F9FF', border: '#BAE6FD', text: '#0284C7' },
  error:    { bg: '#FEF2F2', border: '#FECDD3', text: '#DC2626' },
  warning:  { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  default:  { bg: '#F1F5F9', border: '#CBD5E1', text: '#475569' },
};

export const useInterviewListCardColumns = ({ count, onDelete, onCancel }: UseInterviewListCardColumnsArgs) => {
  const { t, i18n } = useTranslation(['interview', 'common', 'employer']);

  return React.useMemo<ColumnDef<InterviewSession>[]>(
    () => [
      {
        header: t('interview:interviewListCard.candidate'),
        accessorKey: 'candidateName',
        enableSorting: true,
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.25 }}>
              {row.original.candidateName || '---'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, opacity: 0.8 }}>
              {row.original.candidateEmail || '---'}
            </Typography>
          </Box>
        ),
      },
      {
        header: t('interview:interviewListCard.position'),
        accessorKey: 'jobName',
        enableSorting: true,
        cell: ({ getValue }) => (
          <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: 'primary.main', maxWidth: 200 }}>
            {String(getValue() || '---')}
          </Typography>
        ),
      },
      {
        header: t('interview:interviewListCard.time'),
        accessorKey: 'scheduledAt',
        enableSorting: true,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {getValue()
              ? dayjs(getValue() as string).format('DD/MM/YYYY HH:mm')
              : '---'}
          </Typography>
        ),
      },
      {
        header: t('interview:interviewListCard.status'),
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusColor = getStatusColor(status);
          return (
            <Chip
              label={status ? t(`interview:interviewListCard.statuses.${status}`) : '---'}
              size="small"
              sx={{
                fontWeight: 900,
                borderRadius: 1.5,
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
                bgcolor: STATUS_BG_COLORS[statusColor].bg,
                color: STATUS_BG_COLORS[statusColor].text,
                border: '1px solid',
                borderColor: STATUS_BG_COLORS[statusColor].border,
              }}
            />
          );
        },
      },
      {
        header: t('interview:interviewListCard.aiScore'),
        accessorKey: 'aiOverallScore',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const score = row.original.ai_overall_score || row.original.aiOverallScore;
          if (score) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="secondary" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                  {score}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 800 }}>
                  /10
                </Typography>
              </Box>
            );
          }
          return (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontWeight: 700 }}>
              {row.original.status === 'completed' ? t('interview:interviewListCard.grading') : '---'}
            </Typography>
          );
        },
      },
      {
        header: t('common:actionsLabel'),
        id: 'actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const session = row.original;
          const canEdit = ['draft', 'scheduled'].includes(session.status);
          const canCancel = session.status === 'scheduled';
          const detailHref = localizeRoutePath(
            `/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_DETAIL, String(session.id), ':id')}`,
            i18n.language
          );
          const editHref = localizeRoutePath(
            `/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_EDIT, String(session.id), ':id')}`,
            i18n.language
          );

          return (
            <Stack direction="row" spacing={0.75} justifyContent="flex-end">
              <Tooltip title={t('common:view')} arrow>
                <IconButton
                  aria-label="Xem chi tiết"
                  component={Link}
                  href={detailHref}
                  size="small"
                  sx={{
                    color: '#2563EB',
                    bgcolor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px',
                    width: 32,
                    height: 32,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#DBEAFE', transform: 'scale(1.05)' },
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {canEdit && (
                <Tooltip title={t('interview:interviewListCard.editInterview')} arrow>
                  <IconButton
                    aria-label="Chỉnh sửa"
                    component={Link}
                    href={editHref}
                    size="small"
                    sx={{
                      color: '#0284C7',
                      bgcolor: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '8px',
                      width: 32,
                      height: 32,
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#E0F2FE', transform: 'scale(1.05)' },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {canCancel && (
                <Tooltip title={t('interview:interviewListCard.cancelInterview')} arrow>
                  <IconButton
                    aria-label="Hủy phỏng vấn"
                    onClick={() => onCancel(session.roomName)}
                    size="small"
                    sx={{
                      color: '#D97706',
                      bgcolor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      width: 32,
                      height: 32,
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#FEF3C7', transform: 'scale(1.05)' },
                    }}
                  >
                    <BlockIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={t('interview:interviewListCard.deleteInterview')} arrow>
                <IconButton
                  aria-label="Xóa phỏng vấn"
                  onClick={() => onDelete(session.id)}
                  size="small"
                  sx={{
                    color: '#DC2626',
                    bgcolor: '#FEF2F2',
                    border: '1px solid #FECDD3',
                    borderRadius: '8px',
                    width: 32,
                    height: 32,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#FEE2E2', transform: 'scale(1.05)' },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [onCancel, onDelete, t, i18n.language]
  );
};
