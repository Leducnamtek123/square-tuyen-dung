import { useQuery, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminInterviewService from '../../../../services/adminInterviewService';
import { InterviewSession } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseInterviewsResult = UseQueryResult<PaginatedResponse<InterviewSession>>;

export const useInterviews = (params: Record<string, unknown>): UseInterviewsResult => {
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

    return query;
};
