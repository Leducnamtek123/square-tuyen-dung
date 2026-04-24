import React from 'react';
import { Box, Chip, IconButton, Stack, Typography, Tooltip, alpha, useTheme } from '@mui/material';
import Link from 'next/link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../configs/constants';
import { formatRoute } from '../../../../utils/funcUtils';
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

export const useInterviewListCardColumns = ({ count, onDelete, onCancel }: UseInterviewListCardColumnsArgs) => {
  const { t } = useTranslation(['interview', 'common', 'employer']);
  const theme = useTheme();

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
              ? new Date(getValue() as string).toLocaleString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
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
              label={t(`interview:interviewListCard.statuses.${status}`, {
                defaultValue: status?.replaceAll('_', ' ')?.toUpperCase() || '---',
              })}
              size="small"
              sx={{
                fontWeight: 900,
                borderRadius: 1.5,
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
                bgcolor:
                  statusColor === 'default'
                    ? alpha(theme.palette.action.disabled, 0.08)
                    : alpha(theme.palette[statusColor].main, 0.08),
                color: statusColor === 'default' ? 'text.secondary' : `${statusColor}.main`,
                border: '1px solid',
                borderColor:
                  statusColor === 'default'
                    ? alpha(theme.palette.action.disabled, 0.1)
                    : alpha(theme.palette[statusColor].main, 0.1),
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
        header: t('common:actionsLabel', { defaultValue: 'Action' }),
        id: 'actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const session = row.original;
          const canEdit = ['draft', 'scheduled'].includes(session.status);
          const canCancel = session.status === 'scheduled';

          return (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title={t('common:view')} arrow>
                <IconButton
                  component={Link}
                  href={`/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_DETAIL, String(session.id), ':id')}`}
                  color="primary"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {canEdit && (
                <Tooltip title={t('interview:interviewListCard.editInterview')} arrow>
                  <IconButton
                    component={Link}
                    href={`/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_EDIT, String(session.id), ':id')}`}
                    color="info"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.06),
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.12) },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {canCancel && (
                <Tooltip title={t('interview:interviewListCard.cancelInterview')} arrow>
                  <IconButton
                    onClick={() => onCancel(session.roomName)}
                    color="warning"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.06),
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.12) },
                    }}
                  >
                    <BlockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={t('interview:interviewListCard.deleteInterview')} arrow>
                <IconButton
                  onClick={() => onDelete(session.id)}
                  color="error"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.06),
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [onCancel, onDelete, t, theme]
  );
};
