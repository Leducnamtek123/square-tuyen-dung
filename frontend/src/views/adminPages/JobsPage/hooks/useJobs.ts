import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminJobService from '../../../../services/adminJobService';
import toastMessages from '../../../../utils/toastMessages';
import { JobPost } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export const useJobs = (params: Record<string, unknown>) => {
    return useQuery({
        queryKey: ['admin-jobs', params],
        queryFn: async () => {
            const res = await adminJobService.getAllJobs(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => adminJobService.deleteJob(id),
        onSuccess: () => {
            toastMessages.success('Job post deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error deleting job post'),
    });
};

export const useApproveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => adminJobService.approveJob(id),
        onSuccess: () => {
            toastMessages.success('Job post approved');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error approving job post'),
    });
};

export const useRejectJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => adminJobService.rejectJob(id),
        onSuccess: () => {
            toastMessages.success('Job post rejected');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error rejecting job post'),
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<JobPost> | Record<string, unknown> }) => adminJobService.updateJob(id, data),
        onSuccess: () => {
            toastMessages.success('Job post updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error updating job post'),
    });
};
