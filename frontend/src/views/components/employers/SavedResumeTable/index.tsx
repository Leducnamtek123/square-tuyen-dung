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
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import DataTable from '../../../../components/Common/DataTable';
import { formatRoute } from '@/utils/funcUtils';

import { formatLocalizedSalaryRange } from '../../../../utils/customData';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { ResumeSaved } from '@/types/models';
import pc from '@/utils/muiColors';
import { getSavedResumeActionState } from './savedResumeActions';

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
  const { t, i18n } = useTranslation(['employer', 'common']);
  const { push } = useRouter();
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
            <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: pc.primary( 0.08), color: 'primary.main', display: 'flex' }}>
              <DescriptionIcon sx={{ fontSize: 18 }} />
            </Box>
          ) : (
            <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: pc.error( 0.08), color: 'error.main', display: 'flex' }}>
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
        const str = formatLocalizedSalaryRange(info.row.original.resume?.salaryMin, info.row.original.resume?.salaryMax, i18n.language);
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
              bgcolor: pc.primary( 0.08),
              color: 'primary.main',
              border: '1px solid',
              borderColor: pc.primary( 0.1)
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
      cell: (info) => {
        const actionState = getSavedResumeActionState(info.row.original);
        const detailHref = actionState.canView
          ? localizeRoutePath(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, actionState.slug)}`, i18n.language)
          : undefined;

        return (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title={t('employer:savedResumeTable.title.viewprofile')} arrow>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={!actionState.canView}
                  onClick={() => {
                    if (!detailHref) return;
                    push(detailHref);
                  }}
                  sx={{
                    bgcolor: pc.primary(0.06),
                    '&:hover': { bgcolor: pc.primary( 0.12) }
                  }}
                >
                  <RemoveRedEyeIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('employer:savedResumeTable.label.unsave')} arrow>
              <span>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  disabled={!actionState.canUnsave}
                  sx={{
                      textTransform: 'none',
                      minWidth: 100,
                      fontWeight: 900,
                      boxShadow: (theme) => theme.customShadows?.z1,
                      '&:hover': { bgcolor: 'error.dark' }
                  }}
                  startIcon={<FavoriteIcon fontSize="small" />}
                  onClick={() => {
                    if (!actionState.canUnsave) return;
                    handleUnsave(actionState.slug);
                  }}
                >
                  {t('employer:savedResumeTable.label.unsave')}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ], [allConfig, handleUnsave, i18n.language, push, t]);

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
