import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import interviewService from '../../../../services/interviewService';
import { useAppSelector } from '../../../../hooks/useAppStore';

import type { GetSessionsParams } from '../../../../services/interviewService';

export interface InterviewParams extends GetSessionsParams {
    candidate?: number;
}

export const useMyInterviews = (params: InterviewParams) => {
    const { currentUser } = useAppSelector((state) => state.user);
    const userId = currentUser?.id;
    const queryParams = { ...params };

    const query = useQuery({
        queryKey: ['my-interviews', queryParams],
        queryFn: () => interviewService.getSessions(queryParams),
        enabled: !!userId,
        retry: (failureCount, error: unknown) => {
            const status = (error as AxiosError | undefined)?.response?.status;
            if (status === 401 || status === 403) return false;
            return failureCount < 1;
        },
    });

    return query;
};
