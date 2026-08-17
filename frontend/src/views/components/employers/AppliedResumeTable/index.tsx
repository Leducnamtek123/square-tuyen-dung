'use client';
import React, { useCallback, useMemo, useState } from 'react';
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
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import type { ColumnDef, PaginationState, SortingState, OnChangeFn, RowSelectionState } from '@tanstack/react-table';

import AIAnalysisDrawer, { AIAnalysisData } from '../AIAnalysisDrawer';
import { CV_TYPES, ROUTES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import DataTable from '../../../../components/Common/DataTable';
import { formatRoute } from '@/utils/funcUtils';
import { getSafeResourceUrl, openExternalUrlSafely } from '@/utils/safeExternalUrl';

import SendEmailComponent from './SendEmailComponent';
import AppliedStatusComponent from './AppliedStatusComponent';
import AIAnalysisComponent from './AIAnalysisComponent';
import { useConfig } from '@/hooks/useConfig';
import type { JobPostActivity } from '@/types/models';
import pc from '@/utils/muiColors';

interface AppliedResumeTableProps {
  rows: JobPostActivity[];
  isLoading: boolean;
  handleChangeApplicationStatus: (id: string | number, value: string | number, callback: (result: boolean) => void) => void;
  handleDelete: (id: string | number) => void;
  onCreateEmployee?: (activity: JobPostActivity) => void;
  onAnalysisStateChange?: (id: string | number, nextState: Partial<JobPostActivity>) => void;
  blindMode?: boolean;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  variant?: 'card' | 'flat';
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

const AppliedResumeTable: React.FC<AppliedResumeTableProps> = (props) => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const { push } = useRouter();
  const { 
    rows, 
    isLoading, 
    handleChangeApplicationStatus, 
    handleDelete,
    onCreateEmployee,
    onAnalysisStateChange,
    blindMode = false,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    variant = 'card',
    stickyHeader = true,
    maxHeight,
  } = props;
  const { allConfig } = useConfig();
  const [openDrawerId, setOpenDrawerId] = useState<string | number | null>(null);

  const selectedActivityInfo = useMemo(() => {
    if (!openDrawerId) return null;
    return rows.find(r => r.id === openDrawerId);
  }, [openDrawerId, rows]);

  const handleDrawerAnalysisStateChange = useCallback((nextState: Partial<JobPostActivity>) => {
    if (!openDrawerId || !onAnalysisStateChange) return;
    onAnalysisStateChange(openDrawerId, nextState);
  }, [openDrawerId, onAnalysisStateChange]);

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
            const isManualCandidate = Boolean(info.row.original.isManualCandidate);
            // File URL for attached CV download
            const cvFileUrl = info.row.original.resumeFileUrl || info.row.original.resume?.fileUrl || '';
            const safeCvFileUrl = getSafeResourceUrl(cvFileUrl);
            return (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.75 }}>
                  {String(info.getValue() ?? '')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isManualCandidate && (
                    <Chip
                      size="small"
                      label={t('manualCandidate.badge')}
                      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900 }}
                    />
                  )}
                  {safeCvFileUrl && (
                    <Tooltip title={t('appliedResume.table.clickToDownload')} arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(safeCvFileUrl, '_blank', 'noopener,noreferrer');
                        }}
                        sx={{
                          p: 0.5,
                          borderRadius: 1,
                          bgcolor: pc.error(0.08),
                          color: 'error.main',
                          '&:hover': { bgcolor: pc.error(0.16) },
                        }}
                      >
                        <PictureAsPdfIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {resumeTitle || '---'}
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
      id: 'jobName',
      header: t('appliedResume.table.appliedPosition'),
      cell: (info) => {
        const row = info.row.original as any;
        const rawTitle =
          (info.getValue() as string) ||
          row.jobName ||
          row.jobPost?.jobName ||
          row.job_post?.job_name ||
          row.jobPostDict?.jobName ||
          '';
        const cleanTitle = rawTitle.replace(/^\[?TUYỂN GẤP\]?\|?\s*/i, '').trim();
        return (
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {cleanTitle ? `[TUYỂN GẤP] ${cleanTitle}` : '---'}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'createAt',
      header: t('appliedResume.table.appliedDate'),
      cell: (info) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '---'}
        </Typography>
      ),
    },
    {
      accessorKey: 'aiAnalysisScore',
      id: 'aiAnalysisScore',
      header: t('appliedResume.table.aiAnalysis'),
      meta: { align: 'center' },
      enableSorting: true,
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
          {(() => {
            const detailSlug = info.row.original.resumeSlug || info.row.original.resume?.slug || '';
            const detailHref = detailSlug
              ? localizeRoutePath(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, detailSlug)}`, i18n.language)
              : undefined;
            return (
          <Tooltip title={t('appliedResume.table.tooltips.view')} arrow>
            <span>
              <IconButton
                color="primary"
                size="small"
                disabled={blindMode || !detailSlug}
                onClick={() => {
                  if (blindMode || !detailHref) return;
                  push(detailHref);
                }}
                sx={{ 
                  bgcolor: pc.primary( 0.06),
                  
                  '&:hover': { bgcolor: pc.primary( 0.12) }
                }}
              >
                <RemoveRedEyeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
            );
          })()}
          
          {!blindMode && (
            <SendEmailComponent
              jobPostActivityId={String(info.row.original.id)}
              isSentEmail={info.row.original.isSentEmail || false}
              email={info.row.original.email || ''}
              fullName={info.row.original.fullName || ''}
            />
          )}

          {!blindMode && info.row.original.hrmEmployeeId ? (
            <Tooltip title={t('employees.hrm.convert.openEmployee')} arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  if (info.row.original.hrmEmployeeUrl) {
                    openExternalUrlSafely(info.row.original.hrmEmployeeUrl);
                  }
                }}
                sx={{
                  bgcolor: pc.primary(0.06),
                  
                  '&:hover': { bgcolor: pc.primary(0.12) }
                }}
              >
                <PersonAddAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (!blindMode && [4, 5].includes(Number(info.row.original.status)) && onCreateEmployee && (
            <Tooltip title={t('employees.hrm.convert.action')} arrow>
              <IconButton
                size="small"
                color="success"
                onClick={() => onCreateEmployee(info.row.original)}
                sx={{
                  bgcolor: pc.success(0.06),
                  
                  '&:hover': { bgcolor: pc.success(0.12) }
                }}
              >
                <PersonAddAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ))}

          <Tooltip title={t('appliedResume.table.tooltips.delete')} arrow>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(info.row.original.id)}
              sx={{ 
                bgcolor: pc.error( 0.06),
                
                '&:hover': { bgcolor: pc.error( 0.12) }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t, allConfig, handleChangeApplicationStatus, handleDelete, onCreateEmployee, push, blindMode, i18n.language]);

  return (
    <>
      {openDrawerId && selectedActivityInfo && (
        <AIAnalysisDrawer
          open={Boolean(openDrawerId)}
          onClose={() => setOpenDrawerId(null)}
          activityId={openDrawerId}
          onAnalysisStateChange={handleDrawerAnalysisStateChange}
          initialData={{
            ...selectedActivityInfo,
            aiAnalysisSummary: selectedActivityInfo.aiAnalysisSummary ?? undefined
          } as AIAnalysisData}
        />
      )}
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
        emptyMessage={t('appliedResume.table.noCandidates')}
        stickyHeader={stickyHeader}
        maxHeight={maxHeight}
      />
    </>
  );
};

export default AppliedResumeTable;
