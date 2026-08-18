'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Stack, IconButton, Tooltip, Button, Chip } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import AdminDataGrid, { ColumnDef, BulkAction, FilterDef } from '@/components/Common/AdminDataGrid';
import AdminStatusBadge from '@/components/Common/AdminStatusBadge';
import AdminConfirmDialog from '@/components/Common/AdminConfirmDialog';
import AdminDetailDrawer from '@/components/Common/AdminDetailDrawer';

import { useJobs } from './hooks/useJobs';
import { useDebounce } from '../../../hooks';
import { JobPost } from '../../../types/models';
import dayjs from '../../../configs/dayjs-config';
import { ROUTES } from '../../../configs/routeConfig';
import { localizeRoutePath } from '../../../configs/routeLocalization';
import { formatRoute } from '../../../utils/funcUtils';
import LaunchIcon from '@mui/icons-material/Launch';

export default function JobsPage() {
  const { t, i18n } = useTranslation('admin');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJobs, setSelectedJobs] = useState<JobPost[]>([]);

  // Dialog & Drawer state
  const [inspectingJob, setInspectingJob] = useState<JobPost | null>(null);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: 'delete' | 'reject' | 'bulk_reject' | 'approve' | 'bulk_approve';
    job?: JobPost;
    title: string;
    message: string;
    requireReason?: boolean;
  }>({
    open: false,
    type: 'delete',
    title: '',
    message: '',
  });

  const debouncedSearch = useDebounce(searchTerm, 400);

  const statusParams = useMemo(() => {
    if (!statusFilter || statusFilter === 'all') return {};
    if (statusFilter === 'expired') return { isExpired: true };
    return { statusId: statusFilter };
  }, [statusFilter]);

  const {
    data,
    isLoading,
    approveJob,
    rejectJob,
    deleteJob,
    bulkApprove,
    bulkReject,
    isMutating,
  } = useJobs({
    page,
    pageSize,
    kw: debouncedSearch,
    ...statusParams,
    ordering: '-create_at',
  });

  const jobList = data?.results || [];
  const totalCount = data?.count || 0;

  // Single Action Handlers
  const handleOpenApprove = (job: JobPost) => {
    setDialogState({
      open: true,
      type: 'approve',
      job,
      title: t('pages.jobs.table.approveAction'),
      message: `Bạn có chắc chắn muốn phê duyệt tin "${job.jobName}" cho nhà tuyển dụng "${job.companyDict?.companyName}"?`,
    });
  };

  const handleOpenReject = (job: JobPost) => {
    setDialogState({
      open: true,
      type: 'reject',
      job,
      title: t('pages.jobs.table.rejectAction'),
      message: `Vui lòng nhập lý do từ chối tin "${job.jobName}" để thông báo cho nhà tuyển dụng.`,
      requireReason: true,
    });
  };

  const handleOpenDelete = (job: JobPost) => {
    setDialogState({
      open: true,
      type: 'delete',
      job,
      title: 'Xóa vĩnh viễn tin tuyển dụng',
      message: `Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa tin "${job.jobName}"?`,
    });
  };

  // Bulk Action Handlers
  const handleBulkApproveTrigger = (selected: JobPost[]) => {
    setDialogState({
      open: true,
      type: 'bulk_approve',
      title: 'Phê duyệt hàng loạt',
      message: `Bạn có chắc chắn muốn phê duyệt ${selected.length} tin tuyển dụng đã chọn?`,
    });
  };

  const handleBulkRejectTrigger = (selected: JobPost[]) => {
    setDialogState({
      open: true,
      type: 'bulk_reject',
      title: 'Từ chối hàng loạt',
      message: `Vui lòng nhập lý do từ chối chung cho ${selected.length} tin tuyển dụng đã chọn:`,
      requireReason: true,
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    const { type, job } = dialogState;
    try {
      if (type === 'approve' && job) {
        await approveJob(job.id);
      } else if (type === 'reject' && job) {
        await rejectJob(job.id);
      } else if (type === 'delete' && job) {
        await deleteJob(job.id);
      } else if (type === 'bulk_approve') {
        const ids = selectedJobs.map((j) => j.id);
        await bulkApprove(ids);
        setSelectedJobs([]);
      } else if (type === 'bulk_reject') {
        const ids = selectedJobs.map((j) => j.id);
        await bulkReject({ ids, reason });
        setSelectedJobs([]);
      }
      setDialogState((prev) => ({ ...prev, open: false }));
    } catch (e) {
      console.error(e);
    }
  };

  // Column definitions
  const columns: ColumnDef<JobPost>[] = useMemo(
    () => [
      {
        id: 'id',
        accessorKey: 'id',
        header: 'Mã tin',
        width: 80,
        cell: (row) => (
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
            #{row.id}
          </Typography>
        ),
      },
      {
        id: 'jobName',
        accessorKey: 'jobName',
        header: 'Tên vị trí & Doanh nghiệp',
        minWidth: 260,
        cell: (row) => (
          <Box>
            <Typography
              variant="body2"
              onClick={() => setInspectingJob(row)}
              sx={{
                fontWeight: 700,
                color: '#1E293B',
                cursor: 'pointer',
                '&:hover': { color: '#2563EB', textDecoration: 'underline' },
              }}
            >
              {row.jobName}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {row.companyDict?.companyName || 'Doanh nghiệp ẩn danh'}
              </Typography>
              {row.isHot && <Chip label="HOT" size="small" color="error" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 800 }} />}
              {row.isUrgent && <Chip label="GẤP" size="small" color="warning" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 800 }} />}
            </Stack>
          </Box>
        ),
      },
      {
        id: 'location',
        header: 'Địa điểm',
        cell: (row) => {
          const cityVal = row.location?.city;
          const cityName = typeof cityVal === 'object' && cityVal !== null
            ? (cityVal as { name?: string }).name
            : typeof cityVal === 'string'
            ? cityVal
            : 'Toàn quốc';
          return (
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8125rem' }}>
              {cityName || 'Toàn quốc'}
            </Typography>
          );
        },
      },
      {
        id: 'salary',
        header: 'Mức lương',
        cell: (row) => {
          const min = row.salaryMin ? `${(row.salaryMin / 1000000).toFixed(0)}Tr` : '';
          const max = row.salaryMax ? `${(row.salaryMax / 1000000).toFixed(0)}Tr` : '';
          const text = min && max ? `${min} - ${max}` : min ? `Từ ${min}` : max ? `Đến ${max}` : 'Thỏa thuận';
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8125rem' }}>
              {text}
            </Typography>
          );
        },
      },
      {
        id: 'status',
        header: t('common.status.label'),
        cell: (row) => {
          const isExpired = row.deadline && dayjs(row.deadline).isBefore(dayjs(), 'day');
          if (isExpired) {
            return <AdminStatusBadge status="inactive" label={t('pages.jobs.status.expired')} />;
          }
          if (row.status === 2) {
            return <AdminStatusBadge status="approved" label={t('pages.jobs.status.approved')} />;
          }
          if (row.status === 3) {
            return <AdminStatusBadge status="rejected" label={t('pages.jobs.status.rejected')} />;
          }
          if (row.status === 1) {
            return <AdminStatusBadge status="pending" label={t('pages.jobs.status.pending')} />;
          }
          return <AdminStatusBadge status="inactive" label={t('pages.jobs.status.unknown')} />;
        },
      },
      {
        id: 'deadline',
        header: 'Hạn nộp',
        cell: (row) => (
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {row.deadline ? dayjs(row.deadline).format('DD/MM/YYYY') : '—'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        align: 'right',
        cell: (row) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title={t('pages.jobs.table.view')}>
              <IconButton size="small" onClick={() => setInspectingJob(row)} sx={{ color: '#64748B' }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            {row.status !== 2 && (
              <Tooltip title={t('pages.jobs.table.approveAction')}>
                <IconButton size="small" onClick={() => handleOpenApprove(row)} sx={{ color: '#16A34A' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {row.status !== 3 && (
              <Tooltip title={t('pages.jobs.table.rejectAction')}>
                <IconButton size="small" onClick={() => handleOpenReject(row)} sx={{ color: '#DC2626' }}>
                  <HighlightOffIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Xóa tin">
              <IconButton size="small" onClick={() => handleOpenDelete(row)} sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626' } }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [t]
  );

  const filters: FilterDef[] = [
    {
      id: 'status',
      label: t('common.status.label'),
      value: statusFilter,
      options: [
        { label: t('common.all'), value: 'all' },
        { label: t('pages.jobs.status.pending'), value: '1' },
        { label: t('pages.jobs.status.approved'), value: '2' },
        { label: t('pages.jobs.status.rejected'), value: '3' },
        { label: t('pages.jobs.status.expired'), value: 'expired' },
      ],
    },
  ];

  const bulkActions: BulkAction<JobPost>[] = [
    {
      id: 'bulk-approve',
      label: 'Duyệt hàng loạt',
      color: 'success',
      variant: 'contained',
      icon: <CheckCircleOutlineIcon />,
      onClick: handleBulkApproveTrigger,
    },
    {
      id: 'bulk-reject',
      label: 'Từ chối hàng loạt',
      color: 'error',
      variant: 'outlined',
      icon: <HighlightOffIcon />,
      onClick: handleBulkRejectTrigger,
    },
  ];

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          {t('pages.jobs.filter.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Kiểm duyệt, theo dõi hạn nộp và quản lý chất lượng các tin đăng tuyển dụng từ doanh nghiệp.
        </Typography>
      </Box>

      {/* Main AdminDataGrid */}
      <AdminDataGrid<JobPost>
        columns={columns}
        data={jobList}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => setPageSize(s)}
        searchQuery={searchTerm}
        onSearchChange={(q) => {
          setSearchTerm(q);
          setPage(1);
        }}
        searchPlaceholder={`Tìm kiếm tin tuyển dụng... (${t('common.clearFilters')})`}
        filters={filters}
        onFilterChange={(_id, val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        onResetFilters={() => {
          setStatusFilter('all');
          setSearchTerm('');
          setPage(1);
        }}
        selectable
        selectedRows={selectedJobs}
        onSelectRows={setSelectedJobs}
        bulkActions={bulkActions}
        loading={isLoading}
      />

      {/* Action Confirmation Dialog */}
      <AdminConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.type === 'approve' || dialogState.type === 'bulk_approve' ? 'info' : 'danger'}
        requireReason={dialogState.requireReason}
        loading={isMutating}
        onConfirm={handleConfirmAction}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
      />

      {/* Inspecting Job Side Detail Drawer */}
      <AdminDetailDrawer
        open={Boolean(inspectingJob)}
        onClose={() => setInspectingJob(null)}
        title={inspectingJob?.jobName || 'Chi tiết tin tuyển dụng'}
        subtitle={`Doanh nghiệp: ${inspectingJob?.companyDict?.companyName || 'Chưa cập nhật'}`}
        footerAction={
          inspectingJob && (
            <Stack direction="row" spacing={1}>
              {inspectingJob.status !== 2 && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => {
                    handleOpenApprove(inspectingJob);
                    setInspectingJob(null);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Phê duyệt ngay
                </Button>
              )}
              {inspectingJob.status !== 3 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={() => {
                    handleOpenReject(inspectingJob);
                    setInspectingJob(null);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Từ chối tin
                </Button>
              )}
            </Stack>
          )
        }
      >
        {inspectingJob && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Thông tin chung
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Mức lương:</strong> {inspectingJob.salaryMin?.toLocaleString()} - {inspectingJob.salaryMax?.toLocaleString()} VNĐ</Typography>
                  <Typography variant="body2"><strong>Số lượng tuyển:</strong> {inspectingJob.quantity} người</Typography>
                  <Typography variant="body2"><strong>Hạn nộp hồ sơ:</strong> {inspectingJob.deadline ? dayjs(inspectingJob.deadline).format('DD/MM/YYYY') : 'Không giới hạn'}</Typography>
                  <Typography variant="body2"><strong>Người liên hệ:</strong> {inspectingJob.contactPersonName} ({inspectingJob.contactPersonEmail} - {inspectingJob.contactPersonPhone})</Typography>
                  {inspectingJob.slug && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        href={localizeRoutePath(formatRoute(ROUTES.JOB_SEEKER.JOB_DETAIL, inspectingJob.slug), i18n.language)}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#2563EB' }}
                      >
                        Xem trang tuyển dụng công khai
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Mô tả công việc
              </Typography>
              <Box
                sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
                dangerouslySetInnerHTML={{ __html: inspectingJob.jobDescription || '<p>Chưa có mô tả</p>' }}
              />
            </Box>

            {inspectingJob.jobRequirement && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  Yêu cầu ứng viên
                </Typography>
                <Box
                  sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
                  dangerouslySetInnerHTML={{ __html: inspectingJob.jobRequirement }}
                />
              </Box>
            )}

            {inspectingJob.benefitsEnjoyed && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  Quyền lợi được hưởng
                </Typography>
                <Box
                  sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
                  dangerouslySetInnerHTML={{ __html: inspectingJob.benefitsEnjoyed }}
                />
              </Box>
            )}
          </Stack>
        )}
      </AdminDetailDrawer>
    </Box>
  );
}
