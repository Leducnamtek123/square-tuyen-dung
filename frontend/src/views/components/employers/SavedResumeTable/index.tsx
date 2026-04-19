'use client';
import React, { useMemo } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Stack, 
  Tooltip, 
  Typography,
  Chip,
  alpha,
  useTheme
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import type { ColumnDef, PaginationState, SortingState, OnChangeFn } from '@tanstack/react-table';

import { CV_TYPES, ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/Common/DataTable';
import { formatRoute } from '@/utils/funcUtils';

import { salaryString } from '../../../../utils/customData';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { ResumeSaved } from '@/types/models';

interface SavedResumeTableProps {
  rows: ResumeSaved[];
  isLoading: boolean;
  handleUnsave: (slug: string) => void;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

const SavedResumeTable: React.FC<SavedResumeTableProps> = (props) => {
  const { t } = useTranslation(['employer', 'common']);
  const theme = useTheme();
  const nav = useRouter();
  const { 
    rows, 
    isLoading, 
    handleUnsave,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange
  } = props;
  const { allConfig } = useConfig();

  const columns = useMemo<ColumnDef<ResumeSaved>[]>(() => [
    {
      accessorKey: 'resume.title',
      header: t('employer:savedResumeTable.label.resumeTitle'),
      enableSorting: true,
      cell: (info) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {info.row.original.resume?.type === CV_TYPES.cvWebsite ? (
            <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', display: 'flex' }}>
              <DescriptionIcon sx={{ fontSize: 18 }} />
            </Box>
          ) : (
            <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main', display: 'flex' }}>
              <PictureAsPdfIcon sx={{ fontSize: 18 }} />
            </Box>
          )}
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {String(info.getValue() ?? '') || (
              <Typography component="span" variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', fontWeight: 600 }}>
                {t('common:notUpdated')}
              </Typography>
            )}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'resume.userDict.fullName',
      header: t('employer:savedResumeTable.label.candidateName'),
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
            {String(info.getValue() ?? '---')}
        </Typography>
      ),
    },
    {
      id: 'salary',
      header: t('employer:savedResumeTable.label.salary'),
      cell: (info) => {
        const str = salaryString(info.row.original.resume?.salaryMin, info.row.original.resume?.salaryMax);
        return str ? (
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                {str}
            </Typography>
        ) : (
          <Typography component="span" variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', fontWeight: 600 }}>
            {t('common:notUpdated')}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'resume.experience',
      header: t('employer:savedResumeTable.label.experience'),
      cell: (info) => {
        const val = tConfig(allConfig?.experienceDict?.[info.getValue() as number]);
        return val ? (
          <Chip 
            label={val} 
            size="small" 
            sx={{ 
              fontWeight: 900,
              fontSize: '0.7rem',
              borderRadius: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1)
            }} 
          />
        ) : (
          <Typography component="span" variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', fontWeight: 600 }}>
            {t('common:notUpdated')}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'resume.city',
      header: t('employer:savedResumeTable.label.cityProvince'),
      cell: (info) => {
        const val = tConfig(allConfig?.cityDict?.[info.getValue() as number]);
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {val || (
                    <Typography component="span" variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', fontWeight: 600 }}>
                        {t('common:notUpdated')}
                    </Typography>
                )}
            </Typography>
        );
      },
    },
    {
      accessorKey: 'createAt',
      header: t('employer:savedResumeTable.label.savedDate'),
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '---'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: t('employer:savedResumeTable.label.actions'),
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title={t('employer:savedResumeTable.title.viewprofile')} arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={() => nav.push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, info.row.original.resumeSlug || info.row.original.resume?.slug || '')}`)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.06), 
                borderRadius: 1.5,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
              }}
            >
              <RemoveRedEyeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('employer:savedResumeTable.label.unsave')} arrow>
              <Button
                size="small"
                variant="contained"
                color="error"
                sx={{ 
                    textTransform: 'none', 
                    minWidth: 100, 
                    borderRadius: 2,
                    fontWeight: 900,
                    boxShadow: (theme) => theme.customShadows?.z1,
                    '&:hover': { bgcolor: 'error.dark' }
                }}
                startIcon={<FavoriteIcon fontSize="small" />}
                onClick={() => handleUnsave(info.row.original.resume?.slug || '')}
              >
                {t('employer:savedResumeTable.label.unsave')}
              </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ], [allConfig, handleUnsave, nav, t, theme]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      enableSorting
      sorting={sorting}
      onSortingChange={onSortingChange}
      emptyMessage={t('employer:savedResumeTable.title.youhaventsavedanycandidatesyet')}
    />
  );
};

export default SavedResumeTable;
