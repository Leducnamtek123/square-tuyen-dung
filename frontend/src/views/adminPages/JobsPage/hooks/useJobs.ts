import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminJobService from '../../../../services/adminJobService';
import toastMessages from '../../../../utils/toastMessages';

export const useJobs = (params: any) => {
    return useQuery({
        queryKey: ['admin-jobs', params],
        queryFn: async () => {
            const res = await adminJobService.getAllJobs(params);
            return res;
        },
        placeholderData: keepPreviousData,
    }) as any;
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: any) => adminJobService.deleteJob(id),
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
        mutationFn: (id: any) => adminJobService.approveJob(id),
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
        mutationFn: (id: any) => adminJobService.rejectJob(id),
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
        mutationFn: ({ id, data }: { id: any, data: any }) => adminJobService.updateJob(id, data),
        onSuccess: () => {
            toastMessages.success('Job post updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toastMessages.error('Error updating job post'),
    });
};
