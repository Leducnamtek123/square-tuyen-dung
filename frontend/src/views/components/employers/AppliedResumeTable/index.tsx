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
import EventIcon from '@mui/icons-material/Event';
import type { ColumnDef, PaginationState, SortingState, OnChangeFn, RowSelectionState } from '@tanstack/react-table';

import { getAppliedResumeJobPostId } from '../appliedResumeUtils';
import AIAnalysisDrawer, { AIAnalysisData } from '../AIAnalysisDrawer';
import { CV_TYPES, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import DataTable from '@/components/Common/DataTable';
import { formatRoute, downloadPdf } from '@/utils/funcUtils';
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
  onQuickScheduleInterview?: (activity: JobPostActivity) => void;
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
    onQuickScheduleInterview,
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
            const fullNameVal = String(info.getValue() ?? '');
            const isAnonymized = blindMode || fullNameVal.startsWith('Candidate #');
            const resumeTitle = info.row.original.title || info.row.original.resume?.title;
            const isManualCandidate = Boolean(info.row.original.isManualCandidate);
            // File URL for attached CV download
            const cvFileUrl = info.row.original.resumeFileUrl || info.row.original.resume?.fileUrl || '';
            const safeCvFileUrl = getSafeResourceUrl(cvFileUrl);
            const resumeSlug = info.row.original.resumeSlug || info.row.original.resume?.slug || '';
            const publicCvHref = resumeSlug ? `/cv/${resumeSlug}` : undefined;
            const hasCvTarget = Boolean(safeCvFileUrl || publicCvHref);

            const rawDisplayTitle = isAnonymized
              ? (isManualCandidate ? 'Hồ sơ thủ công ẩn danh' : 'Hồ sơ ứng viên ẩn danh')
              : (resumeTitle || '---');
            const displayTitle = rawDisplayTitle.replace(/^[-•*–—\s]+/, '').trim() || '---';

            return (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.75 }}>
                  {fullNameVal}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isManualCandidate && (
                    <Chip
                      size="small"
                      label={t('manualCandidate.badge')}
                      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900 }}
                    />
                  )}
                  {!isAnonymized && hasCvTarget && (
                    <Tooltip title={t('appliedResume.table.clickToDownload')} arrow>
                      <IconButton aria-label="Thao tác"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (safeCvFileUrl) {
                            downloadPdf(safeCvFileUrl, fullNameVal || resumeTitle || 'CV');
                          } else if (publicCvHref) {
                            window.open(publicCvHref, '_blank', 'noopener,noreferrer');
                          }
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
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 260,
                    }}
                    title={displayTitle}
                  >
                    {displayTitle}
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
        <Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
          {(() => {
            const isAnonymized = blindMode || String(info.row.original.fullName ?? '').startsWith('Candidate #');
            const detailSlug = info.row.original.resumeSlug || info.row.original.resume?.slug || '';
            const detailHref = detailSlug && !isAnonymized
              ? localizeRoutePath(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, detailSlug)}`, i18n.language)
              : undefined;
            return (
              <Tooltip title={isAnonymized ? t('appliedResume.table.tooltips.blindDisabled', { defaultValue: 'Hồ sơ đang ở chế độ ẩn danh' }) : t('appliedResume.table.tooltips.view')} arrow>
                <span>
                  <IconButton aria-label="Xem chi tiết"
                    size="small"
                    disabled={isAnonymized || !detailSlug}
                    onClick={() => {
                      if (isAnonymized || !detailHref) return;
                      push(detailHref);
                    }}
                    sx={{ 
                      width: 32,
                      height: 32,
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      transition: 'all 0.15s ease',
                      '&:hover': { 
                        bgcolor: '#DBEAFE',
                        borderColor: '#2563EB',
                        transform: 'translateY(-1px)',
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#F1F5F9',
                        borderColor: '#E2E8F0',
                        color: '#94A3B8',
                      },
                    }}
                  >
                    <RemoveRedEyeIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </span>
              </Tooltip>
            );
          })()}

          {(() => {
            const item = info.row.original;
            const jobPostId = getAppliedResumeJobPostId(item);
            const canScheduleInterview = !blindMode && Boolean(item.userId) && Boolean(jobPostId);
            const scheduleHref = canScheduleInterview
              ? localizeRoutePath(
                  `/${ROUTES.EMPLOYER.INTERVIEW_CREATE}?candidate=${item.userId}&jobPost=${jobPostId}`,
                  i18n.language
                )
              : undefined;

            return (
              <Tooltip title={t('appliedResume.table.tooltips.scheduleInterview', { defaultValue: 'Lên lịch phỏng vấn' })} arrow>
                <span>
                  <IconButton
                    aria-label={t('appliedResume.table.tooltips.scheduleInterview', { defaultValue: 'Lên lịch phỏng vấn' })}
                    size="small"
                    disabled={!canScheduleInterview}
                    onClick={() => {
                      if (onQuickScheduleInterview) {
                        onQuickScheduleInterview(item);
                      } else if (scheduleHref) {
                        push(scheduleHref);
                      }
                    }}
                    sx={{
                      width: 32,
                      height: 32,
                      color: '#7C3AED',
                      bgcolor: '#F5F3FF',
                      border: '1px solid #DDD6FE',
                      transition: 'all 0.15s ease',
                      '&:hover': { 
                        bgcolor: '#EDE9FE',
                        borderColor: '#7C3AED',
                        transform: 'translateY(-1px)',
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#F1F5F9',
                        borderColor: '#E2E8F0',
                        color: '#94A3B8',
                      },
                    }}
                  >
                    <EventIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </span>
              </Tooltip>
            );
          })()}
          
          {(() => {
            const isAnonymized = blindMode || String(info.row.original.fullName ?? '').startsWith('Candidate #');
            if (isAnonymized) return null;
            return (
              <SendEmailComponent
                jobPostActivityId={String(info.row.original.id)}
                isSentEmail={info.row.original.isSentEmail || false}
                email={info.row.original.email || ''}
                fullName={info.row.original.fullName || ''}
              />
            );
          })()}

          {!blindMode && info.row.original.hrmEmployeeId ? (
            <Tooltip title={t('employees.hrm.convert.openEmployee')} arrow>
              <IconButton aria-label="Mở hồ sơ nhân viên HRM"
                size="small"
                onClick={() => {
                  if (info.row.original.hrmEmployeeUrl) {
                    openExternalUrlSafely(info.row.original.hrmEmployeeUrl);
                  }
                }}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  transition: 'all 0.15s ease',
                  '&:hover': { 
                    bgcolor: '#D1FAE5',
                    borderColor: '#059669',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <PersonAddAltIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          ) : (!blindMode && [4, 5].includes(Number(info.row.original.status)) && onCreateEmployee && (
            <Tooltip title={t('employees.hrm.convert.action')} arrow>
              <IconButton aria-label="Tiếp nhận nhân sự vào HRM"
                size="small"
                onClick={() => onCreateEmployee(info.row.original)}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  transition: 'all 0.15s ease',
                  '&:hover': { 
                    bgcolor: '#D1FAE5',
                    borderColor: '#059669',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <PersonAddAltIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          ))}

          <Tooltip title={t('appliedResume.table.tooltips.delete')} arrow>
            <IconButton aria-label="Xóa hồ sơ"
              size="small"
              onClick={() => handleDelete(info.row.original.id)}
              sx={{ 
                width: 32,
                height: 32,
                bgcolor: '#FFF1F2',
                color: '#DC2626',
                border: '1px solid #FECDD3',
                transition: 'all 0.15s ease',
                '&:hover': { 
                  bgcolor: '#FFE4E6',
                  borderColor: '#DC2626',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <DeleteIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t, allConfig, handleChangeApplicationStatus, handleDelete, onCreateEmployee, onQuickScheduleInterview, push, blindMode, i18n.language]);

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
