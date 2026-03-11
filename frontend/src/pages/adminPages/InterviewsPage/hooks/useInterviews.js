import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminInterviewService from '../../../../services/adminInterviewService';
import toastMessages from '../../../../utils/toastMessages';

export const useInterviews = (params) => {
    return useQuery({
        queryKey: ['admin-interviews', params],
        queryFn: async () => {
            const res = await adminInterviewService.getAllInterviews(params);
            return res;
        },
        placeholderData: (previousData) => previousData,
        refetchInterval: (query) => {
            const interviews = query.state.data?.results || [];
            const hasActiveInterview = interviews.some((item) => ['in_progress', 'calibration', 'processing'].includes(item.status));
            return hasActiveInterview ? 5000 : false;
        },
    });
};

export const useScheduleInterview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => adminInterviewService.scheduleInterview(data),
        onSuccess: () => {
            toastMessages.success('Interview scheduled successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error) => {
            toastMessages.error(error.response?.data?.errors?.detail || 'Failed to schedule interview');
        },
    });
};

export const useUpdateInterviewStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => adminInterviewService.updateInterviewStatus(id, status),
        onSuccess: () => {
            toastMessages.success('Status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error) => {
            toastMessages.error(error.response?.data?.errors?.detail || 'Update failed');
        },
    });
};

export const useDeleteInterview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => adminInterviewService.deleteInterview(id),
        onSuccess: () => {
            toastMessages.success('Interview deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error) => {
            toastMessages.error(error.response?.data?.errors?.detail || 'Delete failed');
        },
    });
};
