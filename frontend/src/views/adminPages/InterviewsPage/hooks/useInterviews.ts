import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminInterviewService from '../../../../services/adminInterviewService';
import toastMessages from '../../../../utils/toastMessages';
import { InterviewSession } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export const useInterviews = (params: Record<string, unknown>) => {
    return useQuery({
        queryKey: ['admin-interviews', params],
        queryFn: async () => {
            const res = await adminInterviewService.getAllInterviews(params);
            return res;
        },
        placeholderData: (previousData) => previousData as PaginatedResponse<InterviewSession>,
        refetchInterval: (query: { state: { data?: PaginatedResponse<InterviewSession> | unknown } }) => {
            const interviews = (query.state.data as PaginatedResponse<InterviewSession>)?.results || [];
            const hasActiveInterview = interviews.some((item: InterviewSession) => ['in_progress', 'calibration', 'processing'].includes(item.status as string));
            return hasActiveInterview ? 5000 : false;
        },
    });
};

export const useScheduleInterview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<InterviewSession> | Record<string, unknown>) => adminInterviewService.scheduleInterview(data),
        onSuccess: () => {
            toastMessages.success('Interview scheduled successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error: { response?: { data?: { errors?: { detail?: string } } } } | Error | unknown) => {
            toastMessages.error((error as { response?: { data?: { errors?: { detail?: string } } } }).response?.data?.errors?.detail || 'Failed to schedule interview');
        },
    });
};

export const useUpdateInterviewStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: string }) => adminInterviewService.updateInterviewStatus(id, status),
        onSuccess: () => {
            toastMessages.success('Status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error: { response?: { data?: { errors?: { detail?: string } } } } | Error | unknown) => {
            toastMessages.error((error as { response?: { data?: { errors?: { detail?: string } } } }).response?.data?.errors?.detail || 'Update failed');
        },
    });
};

export const useDeleteInterview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string | number) => adminInterviewService.deleteInterview(id),
        onSuccess: () => {
            toastMessages.success('Interview deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error: { response?: { data?: { errors?: { detail?: string } } } } | Error | unknown) => {
            toastMessages.error((error as { response?: { data?: { errors?: { detail?: string } } } }).response?.data?.errors?.detail || 'Delete failed');
        },
    });
};
