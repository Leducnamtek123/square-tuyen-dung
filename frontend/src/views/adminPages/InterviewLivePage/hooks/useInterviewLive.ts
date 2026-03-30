import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import interviewService from '../../../../services/interviewService';
import { transformInterviewSession } from '../../../../utils/transformers';
import { InterviewSession } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type InterviewSessionExt = InterviewSession & {
    companyDict?: { companyName?: string };
    jobPostDict?: { companyName?: string };
    room?: string;
};

export type UseInterviewLiveResult = UseQueryResult<PaginatedResponse<InterviewSessionExt>> & {
    stats: { active: number; scheduled: number; completed: number };
    isMutating: boolean;
    refetch: () => void;
};

const ACTIVE_STATUSES = ['in_progress', 'calibration', 'processing', 'connecting', 'active'];

export const useInterviewLive = (params: { page: number; pageSize: number }): UseInterviewLiveResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<InterviewSessionExt>>({
        queryKey: ['admin-interview-live', params],
        queryFn: async () => {
            const res = await interviewService.getSessions({
                page: params.page,
                pageSize: params.pageSize,
            }) as unknown as PaginatedResponse<Record<string, unknown>>;
            
            const rawSessions = res.results || [];
            const mapped = rawSessions.map(transformInterviewSession).filter(Boolean) as InterviewSessionExt[];
            
            return {
                ...res,
                results: mapped
            };
        },
        placeholderData: keepPreviousData,
    });

    const sessions = query.data?.results || [];

    // Polling logic
    useEffect(() => {
        const hasActiveSession = sessions.some((session) => ACTIVE_STATUSES.includes(String(session.status)));
        if (!hasActiveSession) return undefined;
        
        const interval = setInterval(() => {
            query.refetch();
        }, 5000);
        
        return () => clearInterval(interval);
    }, [sessions, query]);

    const stats = useMemo(() => {
        const active = sessions.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
        const scheduled = sessions.filter((s) => s.status === 'scheduled').length;
        const completed = sessions.filter((s) => s.status === 'completed').length;
        return { active, scheduled, completed };
    }, [sessions]);

    return {
        ...query,
        stats,
        isMutating: query.isFetching,
    } as UseInterviewLiveResult;
};
