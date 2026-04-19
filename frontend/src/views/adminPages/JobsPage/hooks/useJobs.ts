import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminJobService from '../../../../services/adminJobService';
import toastMessages from '../../../../utils/toastMessages';
import { JobPost } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import type { AdminListParams } from '../../../../services/adminManagementService';

export type UseJobsResult = UseQueryResult<PaginatedResponse<JobPost>> & {
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
            toastMessages.success('Job post updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error updating job post'),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string | number) => adminJobService.approveJob(id),
        onSuccess: () => {
            toastMessages.success('Job post approved');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error approving job post'),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string | number) => adminJobService.rejectJob(id),
        onSuccess: () => {
            toastMessages.success('Job post rejected');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error rejecting job post'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminJobService.deleteJob(id),
        onSuccess: () => {
            toastMessages.success('Job post deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error deleting job post'),
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
