'use client';

import { useMutation, useQuery, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminInterviewService from '../../../../services/adminInterviewService';
import { InterviewSession } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import type { AdminListParams } from '../../../../services/adminManagementService';

type UseInterviewsResult = UseQueryResult<PaginatedResponse<InterviewSession>> & {
    updateInterviewStatus: (args: { id: string | number; status: string }) => Promise<InterviewSession>;
    deleteInterview: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useInterviews = (params: AdminListParams): UseInterviewsResult => {
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

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: string }) =>
            adminInterviewService.updateInterviewStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminInterviewService.deleteInterview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
    });

    return {
        ...query,
        updateInterviewStatus: updateStatusMutation.mutateAsync,
        deleteInterview: deleteMutation.mutateAsync,
        isMutating: updateStatusMutation.isPending || deleteMutation.isPending,
    };
};
