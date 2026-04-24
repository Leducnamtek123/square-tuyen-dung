'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  IconButton, 
  Stack, 
  Tooltip, 
  Typography,
  Chip,
  alpha,
  useTheme
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import type { ColumnDef, PaginationState, SortingState, OnChangeFn } from '@tanstack/react-table';

import AIAnalysisDrawer, { AIAnalysisData } from '../AIAnalysisDrawer';
import { CV_TYPES, ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/Common/DataTable';
import { formatRoute } from '@/utils/funcUtils';

import SendEmailComponent from './SendEmailComponent';
import AppliedStatusComponent from './AppliedStatusComponent';
import AIAnalysisComponent from './AIAnalysisComponent';
import { useConfig } from '@/hooks/useConfig';
import type { JobPostActivity } from '@/types/models';

interface AppliedResumeTableProps {
  rows: JobPostActivity[];
  isLoading: boolean;
  handleChangeApplicationStatus: (id: string | number, value: string | number, callback: (result: boolean) => void) => void;
  handleDelete: (id: string | number) => void;
  onAnalysisStateChange?: (id: string | number, nextState: Pick<JobPostActivity, 'aiAnalysisStatus' | 'aiAnalysisProgress'>) => void;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

const AppliedResumeTable: React.FC<AppliedResumeTableProps> = (props) => {
  const { t } = useTranslation(['employer', 'common']);
  const nav = useRouter();
  const theme = useTheme();
  const { 
    rows, 
    isLoading, 
    handleChangeApplicationStatus, 
    handleDelete,
    onAnalysisStateChange,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange
  } = props;
  const { allConfig } = useConfig();
  const [openDrawerId, setOpenDrawerId] = useState<string | number | null>(null);

  const selectedActivityInfo = useMemo(() => {
    if (!openDrawerId) return null;
    return rows.find(r => r.id === openDrawerId);
  }, [openDrawerId, rows]);

  const columns = useMemo<ColumnDef<JobPostActivity>[]>(() => [
    {
      accessorKey: 'fullName',
      header: t('appliedResume.table.profileName'),
      enableSorting: true,
      cell: (info) => (
        <Box sx={{ py: 0.5 }}>
          {(() => {
            const resumeType = info.row.original.type || info.row.original.resume?.type;
            const resumeTitle = info.row.original.title || info.row.original.resume?.title;
            // File URL for attached CV download
            const cvFileUrl = info.row.original.resume?.fileUrl || '';
            return (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.75 }}>
                  {String(info.getValue() ?? '')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {resumeType === CV_TYPES.cvWebsite ? (
                    /* Online CV – informational only */
                    <Tooltip title={t('appliedResume.table.onlineResume')} arrow>
                      <Box sx={{ 
                        display: 'flex', 
                        p: 0.5, 
                        borderRadius: 1, 
                        bgcolor: alpha(theme.palette.primary.main, 0.08), 
                        color: 'primary.main' 
                      }}>
                        <DescriptionIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Tooltip>
                  ) : (
                    /* Attached CV – click or hover to download */
                    <Tooltip
                      title={
                        cvFileUrl ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{t('appliedResume.table.attachedResume')}</span>
                            <DownloadIcon sx={{ fontSize: 13 }} />
                          </Box>
                        ) : t('appliedResume.table.attachedResume')
                      }
                      arrow
                    >
                      <Box
                        sx={{ 
                          display: 'flex', 
                          p: 0.5, 
                          borderRadius: 1, 
                          bgcolor: alpha(theme.palette.error.main, 0.08), 
                          color: 'error.main',
                          cursor: cvFileUrl ? 'pointer' : 'default',
                          textDecoration: 'none',
                          '&:hover': cvFileUrl ? { bgcolor: alpha(theme.palette.error.main, 0.16) } : {},
                          transition: 'background-color 0.15s',
                        }}
                        {...(cvFileUrl ? {
                          component: 'a' as const,
                          href: cvFileUrl,
                          download: true,
                          onClick: (e: React.MouseEvent) => e.stopPropagation(),
                        } : {})}
                      >
                        <PictureAsPdfIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Tooltip>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.2px' }}>
                    {resumeTitle || t('appliedResume.table.notUpdated')}
                  </Typography>
                </Box>
              </>
            );
          })()}
        </Box>
      ),
    },
    {
      accessorKey: 'jobName',
      header: t('appliedResume.table.appliedPosition'),
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: 'primary.main', maxWidth: 200 }}>
            {info.row.original.jobName ? String(info.row.original.jobName) : '---'}
        </Typography>
      ),
    },
    {
      accessorKey: 'createAt',
      header: t('appliedResume.table.appliedDate'),
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '---'}
        </Typography>
      ),
    },
    {
      id: 'type',
      header: t('appliedResume.table.profileType'),
      cell: (info) => {
        const resumeType = info.row.original.type || info.row.original.resume?.type;
        const isOnline = resumeType === CV_TYPES.cvWebsite;
        const cvFileUrl = info.row.original.resume?.fileUrl || '';
        return (
          <Tooltip
            title={!isOnline && cvFileUrl ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>{t('appliedResume.table.clickToDownload', { defaultValue: 'Nhấp để tải xuống' })}</span>
                <DownloadIcon sx={{ fontSize: 13 }} />
              </Box>
            ) : ''}
            arrow
            disableHoverListener={isOnline || !cvFileUrl}
          >
            <Chip 
                label={isOnline ? t('appliedResume.table.onlineResume') : t('appliedResume.table.attachedResume')} 
                size="small" 
                sx={{ 
                  fontWeight: 900, 
                  fontSize: '0.7rem',
                  borderRadius: 1.5,
                  bgcolor: isOnline ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.error.main, 0.08),
                  color: isOnline ? 'primary.main' : 'error.main',
                  border: '1px solid',
                  borderColor: isOnline ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                  '& .MuiChip-label': { px: 1.5 },
                  cursor: !isOnline && cvFileUrl ? 'pointer' : 'default',
                }}
                {...(!isOnline && cvFileUrl ? {
                  component: 'a' as const,
                  href: cvFileUrl,
                  download: true,
                  onClick: (e: React.MouseEvent) => e.stopPropagation(),
                } : {})}
            />
          </Tooltip>
        );
      },
    },
    {
      id: 'aiAnalysis',
      header: t('appliedResume.table.aiAnalysis'),
      meta: { align: 'center' },
      cell: (info) => <AIAnalysisComponent row={info.row.original} onOpenDrawer={() => setOpenDrawerId(info.row.original.id)} />,
    },
    {
      accessorKey: 'status',
      header: t('appliedResume.table.status'),
      meta: { align: 'right' },
      cell: (info) => (
        <AppliedStatusComponent
          options={allConfig?.applicationStatusOptions || []}
          defaultStatus={Number(info.getValue() ?? 0)}
          id={String(info.row.original.id)}
          handleChangeApplicationStatus={handleChangeApplicationStatus}
        />
      ),
    },
    {
      id: 'actions',
      header: t('appliedResume.table.actions'),
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
          <Tooltip title={t('appliedResume.table.tooltips.view')} arrow>
            <IconButton
              color="primary"
              size="small"
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
          
          <SendEmailComponent
            jobPostActivityId={String(info.row.original.id)}
            isSentEmail={info.row.original.isSentEmail || false}
            email={info.row.original.email || ''}
            fullName={info.row.original.fullName || ''}
          />

          <Tooltip title={t('appliedResume.table.tooltips.delete')} arrow>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(info.row.original.id)}
              sx={{ 
                bgcolor: alpha(theme.palette.error.main, 0.06),
                borderRadius: 1.5,
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t, allConfig, handleChangeApplicationStatus, handleDelete, nav, theme.palette]);

  return (
    <>
      {openDrawerId && selectedActivityInfo && (
        <AIAnalysisDrawer
          open={Boolean(openDrawerId)}
          onClose={() => setOpenDrawerId(null)}
          activityId={openDrawerId}
          onAnalysisStateChange={(nextState) => {
            if (!openDrawerId || !onAnalysisStateChange) return;
            onAnalysisStateChange(openDrawerId, nextState);
          }}
          initialData={{
            ...selectedActivityInfo,
            aiAnalysisSummary: selectedActivityInfo.aiAnalysisSummary ?? undefined
          } as AIAnalysisData}
        />
      )}
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
        emptyMessage={t('appliedResume.table.noCandidates')}
      />
    </>
  );
};

export default AppliedResumeTable;
