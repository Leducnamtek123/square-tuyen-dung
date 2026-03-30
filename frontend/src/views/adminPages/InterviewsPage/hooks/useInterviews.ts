import { useQuery, useMutation, useQueryClient, UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import adminInterviewService from '../../../../services/adminInterviewService';
import toastMessages from '../../../../utils/toastMessages';
import { InterviewSession } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseInterviewsResult = UseQueryResult<PaginatedResponse<InterviewSession>> & {
    scheduleInterview: (data: Partial<InterviewSession> | Record<string, unknown>) => Promise<InterviewSession>;
    updateInterviewStatus: (args: { id: string | number; status: string }) => Promise<InterviewSession>;
    deleteInterview: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useInterviews = (params: Record<string, unknown>): UseInterviewsResult => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-interviews', params],
        queryFn: async () => {
            const res = await adminInterviewService.getAllInterviews(params);
            return res;
        },
        placeholderData: keepPreviousData,
        refetchInterval: (query: { state: { data?: PaginatedResponse<InterviewSession> | unknown } }) => {
            const interviews = (query.state.data as PaginatedResponse<InterviewSession>)?.results || [];
            const hasActiveInterview = interviews.some((item: InterviewSession) => ['in_progress', 'calibration', 'processing'].includes(item.status as string));
            return hasActiveInterview ? 5000 : false;
        },
    });

    const scheduleMutation = useMutation<InterviewSession, Error, Partial<InterviewSession> | Record<string, unknown>>({
        mutationFn: (data: Partial<InterviewSession> | Record<string, unknown>) => adminInterviewService.scheduleInterview(data),
        onSuccess: () => {
            toastMessages.success('Interview scheduled successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error: any) => {
            toastMessages.error(error.response?.data?.errors?.detail || 'Failed to schedule interview');
        },
    });

    const updateStatusMutation = useMutation<InterviewSession, Error, { id: string | number; status: string }>({
        mutationFn: ({ id, status }: { id: string | number; status: string }) => adminInterviewService.updateInterviewStatus(id, status),
        onSuccess: () => {
            toastMessages.success('Status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error: any) => {
            toastMessages.error(error.response?.data?.errors?.detail || 'Update failed');
        },
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: (id: string | number) => adminInterviewService.deleteInterview(id),
        onSuccess: () => {
            toastMessages.success('Interview deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error: any) => {
            toastMessages.error(error.response?.data?.errors?.detail || 'Delete failed');
        },
    });

    return {
        ...query,
        scheduleInterview: scheduleMutation.mutateAsync,
        updateInterviewStatus: updateStatusMutation.mutateAsync,
        deleteInterview: deleteMutation.mutateAsync,
        isMutating: scheduleMutation.isPending || updateStatusMutation.isPending || deleteMutation.isPending
    } as UseInterviewsResult;
};
