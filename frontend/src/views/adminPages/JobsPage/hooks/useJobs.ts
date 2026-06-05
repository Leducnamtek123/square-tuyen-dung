'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminJobService from '../../../../services/adminJobService';
import toastMessages from '../../../../utils/toastMessages';
import { JobPost } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import type { AdminListParams } from '../../../../services/adminManagementService';
import i18next from 'i18next';

type UseJobsResult = UseQueryResult<PaginatedResponse<JobPost>> & {
    updateJob: (args: { id: string | number; data: Partial<JobPost> }) => Promise<JobPost>;
    approveJob: (id: string | number) => Promise<JobPost>;
    rejectJob: (id: string | number) => Promise<JobPost>;
    deleteJob: (id: string | number) => Promise<void>;
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
            toastMessages.success(i18next.t('admin:pages.jobs.toast.updateSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.updateError')),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string | number) => adminJobService.approveJob(id),
        onSuccess: () => {
            toastMessages.success(i18next.t('admin:pages.jobs.toast.approveSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.approveError')),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string | number) => adminJobService.rejectJob(id),
        onSuccess: () => {
            toastMessages.success(i18next.t('admin:pages.jobs.toast.rejectSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.rejectError')),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminJobService.deleteJob(id),
        onSuccess: () => {
            toastMessages.success(i18next.t('admin:pages.jobs.toast.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error(i18next.t('admin:pages.jobs.toast.deleteError')),
    });

    return {
        ...query,
        updateJob: updateMutation.mutateAsync,
        approveJob: approveMutation.mutateAsync,
        rejectJob: rejectMutation.mutateAsync,
        deleteJob: deleteMutation.mutateAsync,
        isMutating: updateMutation.isPending || approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending
    } as UseJobsResult;
};
