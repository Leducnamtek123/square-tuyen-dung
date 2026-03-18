// @ts-nocheck
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminJobService from '../../../../services/adminJobService';
import { toast } from 'react-toastify';

export const useJobs = (params) => {
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
        mutationFn: (id) => adminJobService.deleteJob(id),
        onSuccess: () => {
            toast.success('Job post deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Error deleting job post'),
    });
};

export const useApproveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminJobService.approveJob(id),
        onSuccess: () => {
            toast.success('Job post approved');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Error approving job post'),
    });
};

export const useRejectJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminJobService.rejectJob(id),
        onSuccess: () => {
            toast.success('Job post rejected');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Error rejecting job post'),
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => adminJobService.updateJob(id, data),
        onSuccess: () => {
            toast.success('Job post updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Error updating job post'),
    });
};
