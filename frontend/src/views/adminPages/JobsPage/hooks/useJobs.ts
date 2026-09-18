'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminJobService from '@/services/adminJobService';
import toastMessages from '@/utils/toastMessages';
import { JobPost } from '@/types/models';
import { PaginatedResponse } from '@/types/api';
import type { AdminListParams } from '@/services/adminManagementService';
import i18next from 'i18next';

type UseJobsResult = UseQueryResult<PaginatedResponse<JobPost>> & {
  updateJob: (args: { id: string | number; data: Partial<JobPost> }) => Promise<JobPost>;
  approveJob: (id: string | number) => Promise<JobPost>;
  rejectJob: (id: string | number) => Promise<JobPost>;
  deleteJob: (id: string | number) => Promise<void>;
  bulkApprove: (ids: (string | number)[]) => Promise<{ updatedCount: number }>;
  bulkReject: (args: { ids: (string | number)[]; reason?: string }) => Promise<{ updatedCount: number }>;
  isMutating: boolean;
};

export const useJobs = (params: AdminListParams): UseJobsResult => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-jobs', params],
    queryFn: async () => {
      const res = await adminJobService.getAllJobs(params);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<JobPost> }) =>
      adminJobService.updateJob(id, data),
    onSuccess: () => {
      toastMessages.success(i18next.t('admin:pages.jobs.toast.updateSuccess', { defaultValue: 'Cập nhật tin thành công' }));
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.updateError', { defaultValue: 'Lỗi cập nhật tin' })),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string | number) => adminJobService.approveJob(id),
    onSuccess: () => {
      toastMessages.success(i18next.t('admin:pages.jobs.toast.approveSuccess', { defaultValue: 'Phê duyệt tin thành công' }));
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.approveError', { defaultValue: 'Lỗi phê duyệt tin' })),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string | number) => adminJobService.rejectJob(id),
    onSuccess: () => {
      toastMessages.success(i18next.t('admin:pages.jobs.toast.rejectSuccess', { defaultValue: 'Từ chối tin thành công' }));
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.rejectError', { defaultValue: 'Lỗi từ chối tin' })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => adminJobService.deleteJob(id),
    onSuccess: () => {
      toastMessages.success(i18next.t('admin:pages.jobs.toast.deleteSuccess', { defaultValue: 'Xóa tin thành công' }));
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.deleteError', { defaultValue: 'Lỗi xóa tin' })),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => adminJobService.bulkApproveJobs(ids),
    onSuccess: (res) => {
      toastMessages.success(`Đã duyệt thành công ${res.updatedCount} tin tuyển dụng`);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => toastMessages.error('Lỗi duyệt hàng loạt tin'),
  });

  const bulkRejectMutation = useMutation({
    mutationFn: ({ ids, reason }: { ids: (string | number)[]; reason?: string }) =>
      adminJobService.bulkRejectJobs(ids, reason),
    onSuccess: (res) => {
      toastMessages.success(`Đã từ chối ${res.updatedCount} tin tuyển dụng`);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => toastMessages.error('Lỗi từ chối hàng loạt tin'),
  });

  return {
    ...query,
    updateJob: updateMutation.mutateAsync,
    approveJob: approveMutation.mutateAsync,
    rejectJob: rejectMutation.mutateAsync,
    deleteJob: deleteMutation.mutateAsync,
    bulkApprove: bulkApproveMutation.mutateAsync,
    bulkReject: bulkRejectMutation.mutateAsync,
    isMutating:
      updateMutation.isPending ||
      approveMutation.isPending ||
      rejectMutation.isPending ||
      deleteMutation.isPending ||
      bulkApproveMutation.isPending ||
      bulkRejectMutation.isPending,
  } as UseJobsResult;
};
