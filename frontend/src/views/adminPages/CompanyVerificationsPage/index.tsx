'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import LaunchIcon from '@mui/icons-material/Launch';

import AdminDataGrid, { ColumnDef, FilterDef } from '@/components/Common/AdminDataGrid';
import AdminStatusBadge from '@/components/Common/AdminStatusBadge';
import AdminConfirmDialog from '@/components/Common/AdminConfirmDialog';
import AdminDetailDrawer from '@/components/Common/AdminDetailDrawer';

import adminManagementService from '../../../services/adminManagementService';
import toastMessages from '../../../utils/toastMessages';
import type { CompanyVerification } from '../../../types/models';
import dayjs from '../../../configs/dayjs-config';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

type VerificationStatus = NonNullable<CompanyVerification['status']>;

export default function CompanyVerificationsPage() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [inspectingVerification, setInspectingVerification] = useState<CompanyVerification | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    verification?: CompanyVerification;
    targetStatus?: VerificationStatus;
    title: string;
    requireReason?: boolean;
  }>({
    open: false,
    title: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-company-verifications', page, pageSize],
    queryFn: () => adminManagementService.getCompanyVerifications({ page, pageSize }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: number; status: VerificationStatus; adminNote?: string }) =>
      adminManagementService.updateCompanyVerification(id, { status, adminNote }),
    onSuccess: () => {
      toastMessages.success(t('pages.companyVerifications.toast.updateSuccess', { defaultValue: 'Cập nhật trạng thái xác thực thành công' }));
      queryClient.invalidateQueries({ queryKey: ['admin-company-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toastMessages.error(t('pages.companyVerifications.toast.updateError', { defaultValue: 'Lỗi cập nhật trạng thái xác thực' })),
  });

  const rawRows = useMemo(() => data?.results || [], [data?.results]);
  const totalRows = data?.count || 0;

  // Filter client-side if needed
  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      if (statusFilter !== 'all' && (row.status || 'pending') !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const companyName = row.companyName?.toLowerCase() || '';
        const taxCode = row.taxCode?.toLowerCase() || '';
        return companyName.includes(q) || taxCode.includes(q);
      }
      return true;
    });
  }, [rawRows, statusFilter, searchTerm]);

  const handleOpenApprove = (v: CompanyVerification) => {
    setActionDialog({
      open: true,
      verification: v,
      targetStatus: 'approved',
      title: 'Phê duyệt xác thực doanh nghiệp',
    });
  };

  const handleOpenReject = (v: CompanyVerification) => {
    setActionDialog({
      open: true,
      verification: v,
      targetStatus: 'rejected',
      title: 'Từ chối yêu cầu xác thực',
      requireReason: true,
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    const { verification, targetStatus } = actionDialog;
    if (!verification?.id || !targetStatus) return;
    try {
      await updateMutation.mutateAsync({
        id: verification.id,
        status: targetStatus,
        adminNote: reason,
      });
      setActionDialog((prev) => ({ ...prev, open: false }));
      if (inspectingVerification && inspectingVerification.id === verification.id) {
        setInspectingVerification((prev) => prev ? { ...prev, status: targetStatus, adminNote: reason } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: ColumnDef<CompanyVerification>[] = useMemo(
    () => [
      {
        id: 'company',
        header: 'Tên Doanh nghiệp & Mã số thuế',
        minWidth: 240,
        cell: (row) => (
          <Box>
            <Typography
              variant="body2"
              onClick={() => setInspectingVerification(row)}
              sx={{
                fontWeight: 700,
                color: '#1E293B',
                cursor: 'pointer',
                '&:hover': { color: '#2563EB', textDecoration: 'underline' },
              }}
            >
              {row.companyName || (row.companyId ? `Công ty #${row.companyId}` : 'Doanh nghiệp')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Mã số thuế: {row.taxCode || 'Chưa cung cấp'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'documents',
        header: 'Tài liệu xác thực (KYC)',
        cell: (row) => {
          if (!row.businessLicense) {
            return <Typography variant="caption" sx={{ color: '#94A3B8' }}>Chưa đính kèm</Typography>;
          }
          const safeDocUrl = getSafeExternalOpenUrl(row.businessLicense);
          return (
            <Button
              size="small"
              variant="outlined"
              href={safeDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<FileOpenOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                py: 0.25,
                borderRadius: 1.5,
                borderColor: '#E2E8F0',
                color: '#2563EB',
              }}
            >
              Xem giấy phép
            </Button>
          );
        },
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: (row) => {
          const status = row.status || 'pending';
          if (status === 'approved') {
            return <AdminStatusBadge status="verified" label="Đã xác thực" />;
          }
          if (status === 'rejected') {
            return <AdminStatusBadge status="rejected" label="Bị từ chối" />;
          }
          if (status === 'reviewing') {
            return <AdminStatusBadge status="in_review" label="Đang kiểm tra" />;
          }
          return <AdminStatusBadge status="pending" label="Chờ xét duyệt" />;
        },
      },
      {
        id: 'createAt',
        header: 'Ngày nộp',
        cell: (row) => (
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {row.createAt ? dayjs(row.createAt).format('DD/MM/YYYY') : '—'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        align: 'right',
        cell: (row) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Xem chi tiết">
              <IconButton size="small" onClick={() => setInspectingVerification(row)} sx={{ color: '#64748B' }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            {row.status !== 'approved' && (
              <Tooltip title="Phê duyệt xác thực">
                <IconButton size="small" onClick={() => handleOpenApprove(row)} sx={{ color: '#16A34A' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {row.status !== 'rejected' && (
              <Tooltip title="Từ chối">
                <IconButton size="small" onClick={() => handleOpenReject(row)} sx={{ color: '#DC2626' }}>
                  <HighlightOffIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    []
  );

  const filters: FilterDef[] = [
    {
      id: 'status',
      label: 'Trạng thái',
      value: statusFilter,
      options: [
        { label: 'Tất cả trạng thái', value: 'all' },
        { label: 'Chờ xét duyệt', value: 'pending' },
        { label: 'Đang kiểm tra', value: 'reviewing' },
        { label: 'Đã xác thực', value: 'approved' },
        { label: 'Bị từ chối', value: 'rejected' },
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          {t('pages.companyVerifications.title', { defaultValue: 'Xác thực doanh nghiệp (KYC)' })}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          {t('pages.companyVerifications.subtitle', { defaultValue: 'Kiểm tra giấy phép đăng ký kinh doanh và cấp dấu tích xác thực cho doanh nghiệp uy tín.' })}
        </Typography>
      </Box>

      {/* Main Table */}
      <AdminDataGrid<CompanyVerification>
        columns={columns}
        data={filteredRows}
        totalCount={totalRows || filteredRows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => setPageSize(s)}
        searchQuery={searchTerm}
        onSearchChange={(q) => {
          setSearchTerm(q);
          setPage(1);
        }}
        searchPlaceholder="Tìm theo tên doanh nghiệp, mã số thuế..."
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
        loading={isLoading}
      />

      {/* Action Dialog */}
      <AdminConfirmDialog
        open={actionDialog.open}
        title={actionDialog.title}
        message={`Bạn có chắc chắn muốn chuyển trạng thái xác thực của công ty "${
          actionDialog.verification?.companyName || 'này'
        }" sang "${actionDialog.targetStatus === 'approved' ? 'Đã xác thực' : 'Bị từ chối'}"?`}
        variant={actionDialog.targetStatus === 'approved' ? 'info' : 'danger'}
        requireReason={actionDialog.requireReason}
        reasonLabel="Lý do từ chối (Gửi đến doanh nghiệp)"
        loading={updateMutation.isPending}
        onConfirm={handleConfirmAction}
        onClose={() => setActionDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Detail Drawer */}
      <AdminDetailDrawer
        open={Boolean(inspectingVerification)}
        onClose={() => setInspectingVerification(null)}
        title={inspectingVerification?.companyName || 'Hồ sơ xác thực doanh nghiệp'}
        subtitle={`Mã xác thực: #${inspectingVerification?.id}`}
        footerAction={
          inspectingVerification && (
            <Stack direction="row" spacing={1}>
              {inspectingVerification.status !== 'approved' && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => {
                    handleOpenApprove(inspectingVerification);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('pages.companyVerifications.actions.update')}
                </Button>
              )}
              {inspectingVerification.status !== 'rejected' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={() => {
                    handleOpenReject(inspectingVerification);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Từ chối yêu cầu
                </Button>
              )}
            </Stack>
          )
        }
      >
        {inspectingVerification && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Thông tin pháp lý doanh nghiệp
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Tên doanh nghiệp:</strong> {inspectingVerification.companyName}</Typography>
                  <Typography variant="body2"><strong>Mã số thuế:</strong> {inspectingVerification.taxCode || 'Chưa cung cấp'}</Typography>
                  <Typography variant="body2"><strong>Ngày gửi hồ sơ:</strong> {dayjs(inspectingVerification.createAt).format('DD/MM/YYYY HH:mm')}</Typography>
                </Stack>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Giấy phép kinh doanh đính kèm
              </Typography>
              {inspectingVerification.businessLicense ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <FileOpenOutlinedIcon sx={{ color: '#2563EB', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                        Giay_phep_kinh_doanh.pdf
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Tài liệu tải lên bởi doanh nghiệp
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    size="small"
                    variant="contained"
                    href={getSafeExternalOpenUrl(inspectingVerification.businessLicense)}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Mở tài liệu
                  </Button>
                </Paper>
              ) : (
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    Doanh nghiệp chưa tải lên bản sao giấy phép
                  </Typography>
                </Box>
              )}
            </Box>

            {inspectingVerification.adminNote && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  Ghi chú của Quản trị viên
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FDE68A', color: '#92400E' }}>
                  <Typography variant="body2">
                    {inspectingVerification.adminNote}
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
