'use client';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, Chip, IconButton, Tooltip, Stack, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import dayjs from 'dayjs';
import DataTable from '../../../../components/Common/DataTable';
import { JOB_POST_STATUS_BG_COLOR } from '../../../../configs/constants';
import { useConfig } from '@/hooks/useConfig';
import type { JobPost } from '../../../../types/models';
import type { ColumnDef, SortingState, Updater, PaginationState, RowSelectionState, OnChangeFn } from '@tanstack/react-table';
import pc from '@/utils/muiColors';

interface JobPostsTableProps {
  rows: JobPost[];
  isLoading: boolean;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  handleDelete: (slugOrId: string | number) => void;
  handleUpdate: (slugOrId: string | number) => void;
  onOpenAiRecommendation?: (jobPost: JobPost) => void;
  sorting: SortingState;
  onSortingChange: (sorting: Updater<SortingState>) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  variant?: 'card' | 'flat';
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

const JobPostsTable = ({
  rows,
  isLoading,
  rowCount,
  pagination,
  onPaginationChange,
  handleDelete,
  handleUpdate,
  onOpenAiRecommendation,
  sorting,
  onSortingChange,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  variant = 'card',
  stickyHeader = true,
  maxHeight,
}: JobPostsTableProps) => {

  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();

  const columns = useMemo<ColumnDef<JobPost>[]>(() => [
    {
      header: t('jobPost.table.jobTitle'),
      accessorKey: 'jobName',
      enableSorting: true,
      cell: (info) => (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {String(info.getValue() ?? '---')}
          </Typography>
          {info.row.original.isUrgent && (
            <Chip
              label={t('jobPost.urgent').toUpperCase()}
              size="small"
              sx={{ 
                fontWeight: 900, 
                height: 20, 
                fontSize: '0.65rem', 
                borderRadius: 1,
                bgcolor: pc.error( 0.12),
                color: 'error.main',
                border: '1px solid',
                borderColor: pc.error( 0.24),
                letterSpacing: 0.5
              }}
            />
          )}
        </Box>
      ),
    },
    {
      header: 'Gợi ý hồ sơ bởi AI',
      id: 'aiRecommendation',
      cell: (info) => {
        const job = info.row.original;
        const totalCount = job.aiRecommendedCount ?? (job as any).ai_recommended_count ?? 0;
        const rawAvatars = (job.aiRecommendedAvatars || (job as any).ai_recommended_avatars || []) as Array<{ name?: string; initial?: string; avatarUrl?: string | null }>;

        if (totalCount === 0) {
          return (
            <Typography
              onClick={() => onOpenAiRecommendation?.(job)}
              variant="caption"
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                fontStyle: 'italic',
                display: 'block',
                textAlign: 'center',
                '&:hover': { color: 'primary.main' }
              }}
            >
              --
            </Typography>
          );
        }

        const avatars = rawAvatars.length > 0 ? rawAvatars : [
          { name: 'Ứng viên 1', initial: 'A', avatarUrl: 'https://ui-avatars.com/api/?name=AI+Candidate+1&background=0D8ABC&color=fff&bold=true&rounded=true' },
          { name: 'Ứng viên 2', initial: 'B', avatarUrl: 'https://ui-avatars.com/api/?name=AI+Candidate+2&background=059669&color=fff&bold=true&rounded=true' },
          { name: 'Ứng viên 3', initial: 'C', avatarUrl: 'https://ui-avatars.com/api/?name=AI+Candidate+3&background=d97706&color=fff&bold=true&rounded=true' },
        ];

        const remainingCount = Math.max(0, totalCount - avatars.length);

        return (
          <Tooltip title={`Xem ${totalCount} hồ sơ được AI phân tích & đề xuất cho vị trí này`} arrow>
            <Box
              onClick={() => onOpenAiRecommendation?.(job)}
              sx={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                cursor: 'pointer',
                py: 0.5,
                transition: 'all 0.2s',
                '&:hover .view-list-link': {
                  textDecoration: 'underline',
                  color: '#1d4ed8',
                },
                '&:hover .avatar-stack': {
                  transform: 'scale(1.04)',
                },
              }}
            >
              <Stack
                className="avatar-stack"
                direction="row"
                alignItems="center"
                spacing={-0.85}
                sx={{ mb: 0.5, transition: 'transform 0.2s' }}
              >
                {avatars.slice(0, 3).map((item, idx) => (
                  <Avatar
                    key={idx}
                    src={item.avatarUrl || undefined}
                    alt={item.name}
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      border: '2px solid #ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  >
                    {item.initial || 'U'}
                  </Avatar>
                ))}

                {remainingCount > 0 && (
                  <Avatar
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      bgcolor: '#64748b',
                      border: '2px solid #ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  >
                    +{remainingCount}
                  </Avatar>
                )}
              </Stack>

              <Typography
                className="view-list-link"
                variant="caption"
                sx={{
                  fontSize: '0.725rem',
                  color: '#2563eb',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  cursor: 'pointer',
                }}
              >
                Xem danh sách
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      header: t('jobPost.table.postDate'),
      accessorKey: 'createAt',
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '---'}
        </Typography>
      ),
    },
    {
      header: t('jobPost.table.deadline'),
      accessorKey: 'deadline',
      enableSorting: true,
      cell: (info) => {
        const val = info.getValue() as string;
        const isExpired = info.row.original.isExpired;
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              color: isExpired ? 'error.main' : 'primary.main', 
              fontWeight: 800,
              bgcolor: isExpired ? pc.error( 0.08) : pc.primary( 0.08),
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              display: 'inline-block'
            }}
          >
            {val ? dayjs(val).format('DD/MM/YYYY') : '---'}
          </Typography>
        );
      },
    },
    {
      header: t('jobPost.table.applications'),
      accessorKey: 'appliedNumber',
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ fontWeight: 900, color: 'info.main', fontSize: '1rem' }}>
            {Number(info.getValue() ?? 0)}
        </Typography>
      )
    },
    {
      header: t('jobPost.table.views'),
      accessorKey: 'views',
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {Number(info.getValue() ?? 0)}
        </Typography>
      ),
    },
    {
      header: t('jobPost.table.status'),
      accessorKey: 'status',
      cell: (info) => {
        const val = String(info.getValue() ?? '');
        const label = allConfig?.jobPostStatusDict?.[val] || val.toUpperCase() || '---';
        const colorKey = ((JOB_POST_STATUS_BG_COLOR as Record<string, string>)[val]) || 'default';
        const muiColor = colorKey === 'default' ? 'default' : colorKey;
        
        // pc.X() is used here to avoid alpha(theme.palette[dynamic].main) which crashes in MUI v6
        const STATUS_CHIP_COLORS: Record<string, { bg: string; border: string }> = {
          primary:   { bg: pc.primary(0.12),   border: pc.primary(0.24) },
          secondary: { bg: pc.secondary(0.12), border: pc.secondary(0.24) },
          error:     { bg: pc.error(0.12),     border: pc.error(0.24) },
          info:      { bg: pc.info(0.12),      border: pc.info(0.24) },
          success:   { bg: pc.success(0.12),   border: pc.success(0.24) },
          warning:   { bg: pc.warning(0.12),   border: pc.warning(0.24) },
        };
        const chipColors = muiColor !== 'default' ? STATUS_CHIP_COLORS[muiColor] : null;
        return (
          <Chip
            label={label}
            size="small"
            sx={{ 
              fontWeight: 800, 
              borderRadius: 1.5,
              bgcolor: chipColors ? chipColors.bg : 'action.selected',
              color: muiColor !== 'default' ? `${muiColor}.main` : 'text.secondary',
              border: '1px solid',
              borderColor: chipColors ? chipColors.border : 'divider',
            }}
          />
        );
      },
    },
    {
      header: '',
      id: 'actions',
      cell: (info) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title={t('jobPost.tooltips.update')} arrow>
            <IconButton aria-label="Thao tác"
              size="small"
              onClick={() => handleUpdate(info.row.original.slug || info.row.original.id)}
              sx={{ 
                color: 'primary.main',
                bgcolor: pc.primary( 0.08),
                '&:hover': { bgcolor: pc.primary( 0.16) }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('jobPost.tooltips.delete')} arrow>
            <IconButton aria-label="Thao tác"
              size="small"
              onClick={() => handleDelete(info.row.original.slug || info.row.original.id)}
              sx={{ 
                color: 'error.main',
                bgcolor: pc.error( 0.08),
                '&:hover': { bgcolor: pc.error( 0.16) }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [allConfig, handleDelete, handleUpdate, t]);

  return (
    <DataTable
      variant={variant}
      columns={columns}
      data={rows}
      isLoading={isLoading}
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      enableSorting
      sorting={sorting}
      onSortingChange={onSortingChange}
      enableRowSelection={enableRowSelection}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      emptyMessage={t('jobPost.noData')}
      stickyHeader={stickyHeader}
      maxHeight={maxHeight}
    />
  );
};

export default JobPostsTable;