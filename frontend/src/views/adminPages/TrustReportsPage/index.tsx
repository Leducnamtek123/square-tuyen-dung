'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import DataTable from '@/components/Common/DataTable';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';
import AdminStatusBadge from '@/components/Common/AdminStatusBadge';
import AdminConfirmDialog from '@/components/Common/AdminConfirmDialog';
import AdminDetailDrawer from '@/components/Common/AdminDetailDrawer';

import { useDataTable } from '../../../hooks';
import type { TrustReport } from '../../../types/models';
import { useTrustReports } from './hooks/useTrustReports';
import dayjs from '../../../configs/dayjs-config';

type StatusFilter = 'all' | TrustReport['status'];
type TargetTypeFilter = 'all' | TrustReport['targetType'];

const STATUS_OPTIONS: TrustReport['status'][] = ['open', 'reviewing', 'resolved', 'rejected'];
const TARGET_TYPE_OPTIONS: TrustReport['targetType'][] = ['job', 'company'];

export default function TrustReportsPage() {
  const { t } = useTranslation('admin');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>('all');
  const [reporterFilter, setReporterFilter] = useState('');

  const {
    page,
    pageSize,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ordering,
    searchTerm,
    debouncedSearchTerm,
    onSearchChange,
    setPage,
  } = useDataTable({ initialPageSize: 10, initialSorting: [{ id: 'create_at', desc: true }] });

  useEffect(() => {
    setPage(0);
  }, [statusFilter, targetTypeFilter, reporterFilter, setPage]);

  const [inspectingReport, setInspectingReport] = useState<TrustReport | null>(null);
  const [resolutionDialog, setResolutionDialog] = useState<{
    open: boolean;
    report?: TrustReport;
    nextStatus?: 'resolved' | 'rejected' | 'reviewing';
    title: string;
  }>({
    open: false,
    title: '',
  });

  const {
    data,
    isLoading,
    updateTrustReport,
    isMutating,
  } = useTrustReports({
    page: page + 1,
    pageSize,
    ordering,
    search: debouncedSearchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    targetType: targetTypeFilter === 'all' ? undefined : targetTypeFilter,
    reporter: reporterFilter.trim() || undefined,
  });

  const rows = data?.results || [];
  const totalRows = data?.count || 0;

  const handleOpenResolve = (report: TrustReport) => {
    setResolutionDialog({
      open: true,
      report,
      nextStatus: 'resolved',
      title: 'Đánh dấu đã xử lý báo cáo',
    });
  };

  const handleOpenReject = (report: TrustReport) => {
    setResolutionDialog({
      open: true,
      report,
      nextStatus: 'rejected',
      title: 'Từ chối / Hủy bỏ báo cáo',
    });
  };

  const handleConfirmResolution = async () => {
    const { report, nextStatus } = resolutionDialog;
    if (!report || !nextStatus) return;
    try {
      await updateTrustReport({
        id: report.id,
        status: nextStatus,
      });
      setResolutionDialog((prev) => ({ ...prev, open: false }));
      if (inspectingReport && inspectingReport.id === report.id) {
        setInspectingReport((prev) => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setTargetTypeFilter('all');
    setReporterFilter('');
    onSearchChange('');
    setPage(0);
  };

  const hasFilters = Boolean(
    searchTerm.trim() ||
    statusFilter !== 'all' ||
    targetTypeFilter !== 'all' ||
    reporterFilter.trim()
  );

  const columns = useMemo<ColumnDef<TrustReport>[]>(
    () => [
      {
        id: 'target',
        header: 'Đối tượng bị báo cáo',
        minWidth: 220,
        cell: (info) => {
          const row = info.row.original;
          return (
            <Box>
              <Typography
                variant="body2"
                onClick={() => setInspectingReport(row)}
                sx={{
                  fontWeight: 700,
                  color: '#1E293B',
                  cursor: 'pointer',
                  '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                }}
              >
                {row.targetTitle || `Báo cáo #${row.id}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Loại: {row.targetType === 'job' ? 'Tin tuyển dụng' : 'Doanh nghiệp'}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'reason',
        header: 'Lý do báo cáo',
        minWidth: 200,
        cell: (info) => (
          <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
            {info.row.original.reason || 'Nghi vấn gian lận/sai sự thật'}
          </Typography>
        ),
      },
      {
        id: 'reporter',
        header: 'Người báo cáo',
        cell: (info) => (
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8125rem' }}>
            {info.row.original.reporterDict?.email || 'Ẩn danh'}
          </Typography>
        ),
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: (info) => {
          const status = info.row.original.status;
          if (status === 'resolved') {
            return <AdminStatusBadge status="approved" label="Đã xử lý" />;
          }
          if (status === 'rejected') {
            return <AdminStatusBadge status="inactive" label="Đã bác bỏ" />;
          }
          if (status === 'reviewing') {
            return <AdminStatusBadge status="pending" label="Đang kiểm tra" />;
          }
          return <AdminStatusBadge status="flagged" label="Mới ghi nhận" />;
        },
      },
      {
        id: 'create_at',
        header: 'Thời gian',
        cell: (info) => (
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {info.row.original.createAt ? dayjs(info.row.original.createAt).format('DD/MM/YYYY HH:mm') : '—'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: (info) => {
          const row = info.row.original;
          return (
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Tooltip title="Xem chi tiết">
                <IconButton size="small" onClick={() => setInspectingReport(row)} sx={{ color: '#64748B' }}>
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              {row.status !== 'resolved' && (
                <Tooltip title="Duyệt xử lý">
                  <IconButton size="small" onClick={() => handleOpenResolve(row)} sx={{ color: '#16A34A' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {row.status !== 'rejected' && (
                <Tooltip title="Bác bỏ báo cáo">
                  <IconButton size="small" onClick={() => handleOpenReject(row)} sx={{ color: '#DC2626' }}>
                    <HighlightOffIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Báo cáo gian lận & Độ tin cậy (Trust Reports)
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Xử lý các khiếu nại, tố cáo tin tuyển dụng hoặc doanh nghiệp có hành vi vi phạm tiêu chuẩn.
        </Typography>
      </Box>

      {/* Main Filter & Table */}
      <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }} elevation={0}>
        <FilterBar
          title={t('pages.trustReports.filter.title', { defaultValue: 'Bộ lọc báo cáo' })}
          searchValue={searchTerm}
          searchPlaceholder="Tìm kiếm theo đối tượng, người báo cáo..."
          onSearchChange={onSearchChange}
          onReset={resetFilters}
          resetDisabled={!hasFilters}
          resetLabel={t('common.clearFilters', { defaultValue: 'Xóa bộ lọc' })}
          advancedFilters={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
              <FormControl size="small" sx={[{ minWidth: 160 }, filterControlSx]}>
                <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'open' ? 'Mới ghi nhận' : status === 'reviewing' ? 'Đang kiểm tra' : status === 'resolved' ? 'Đã xử lý' : 'Đã bác bỏ'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={[{ minWidth: 160 }, filterControlSx]}>
                <InputLabel id="target-type-filter-label">Phân loại</InputLabel>
                <Select
                  labelId="target-type-filter-label"
                  value={targetTypeFilter}
                  label="Phân loại"
                  onChange={(e) => {
                    setTargetTypeFilter(e.target.value as TargetTypeFilter);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">Tất cả đối tượng</MenuItem>
                  {TARGET_TYPE_OPTIONS.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === 'job' ? 'Tin tuyển dụng' : 'Doanh nghiệp'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Người báo cáo"
                size="small"
                value={reporterFilter}
                onChange={(e) => {
                  setReporterFilter(e.target.value);
                  setPage(0);
                }}
                sx={[{ minWidth: 200 }, filterControlSx]}
              />
            </Stack>
          }
        />

        <DataTable
          columns={columns}
          data={rows}
          rowCount={totalRows}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          paginationMode="visible"
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      </Paper>

      {/* Resolution Dialog */}
      <AdminConfirmDialog
        open={resolutionDialog.open}
        title={resolutionDialog.title}
        message={`Bạn có chắc chắn muốn chuyển trạng thái báo cáo này thành "${
          resolutionDialog.nextStatus === 'resolved' ? 'Đã xử lý' : 'Đã bác bỏ'
        }"?`}
        variant={resolutionDialog.nextStatus === 'resolved' ? 'info' : 'danger'}
        loading={isMutating}
        onConfirm={handleConfirmResolution}
        onClose={() => setResolutionDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Inspecting Drawer */}
      <AdminDetailDrawer
        open={Boolean(inspectingReport)}
        onClose={() => setInspectingReport(null)}
        title="Chi tiết Báo cáo vi phạm"
        subtitle={`Mã báo cáo: #${inspectingReport?.id}`}
        footerAction={
          inspectingReport && (
            <Stack direction="row" spacing={1}>
              {inspectingReport.status !== 'resolved' && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => {
                    handleOpenResolve(inspectingReport);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Đánh dấu đã xử lý
                </Button>
              )}
              {inspectingReport.status !== 'rejected' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={() => {
                    handleOpenReject(inspectingReport);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Bác bỏ báo cáo
                </Button>
              )}
            </Stack>
          )
        }
      >
        {inspectingReport && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Thông tin đối tượng
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="body2"><strong>Tiêu đề:</strong> {inspectingReport.targetTitle || `Báo cáo #${inspectingReport.id}`}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Loại đối tượng:</strong> {inspectingReport.targetType === 'job' ? 'Tin tuyển dụng' : 'Doanh nghiệp'}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Người gửi báo cáo:</strong> {inspectingReport.reporterDict?.email || 'Ẩn danh'}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Thời gian gửi:</strong> {dayjs(inspectingReport.createAt).format('DD/MM/YYYY HH:mm')}</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Lý do báo cáo
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FDE68A', color: '#92400E' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {inspectingReport.reason || 'Nghi vấn lừa đảo / gian lận thông tin'}
                </Typography>
              </Box>
            </Box>

            {inspectingReport.message && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  Mô tả chi tiết từ người báo cáo
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {inspectingReport.message}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        )}
      </AdminDetailDrawer>
    </Box>
  );
}
