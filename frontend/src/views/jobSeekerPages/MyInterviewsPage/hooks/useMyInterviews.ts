import { useQuery } from '@tanstack/react-query';
import interviewService from '../../../../services/interviewService';
import { useAppSelector } from '../../../../hooks/useAppStore';

export interface InterviewParams {
    pageSize?: number;
    page?: number;
    [key: string]: any;
}

export const useMyInterviews = (params: InterviewParams) => {
    const { currentUser } = useAppSelector((state) => state.user);

    // Use the user's own ID — backend filters by candidate field
    // This works for both JOB_SEEKER (ứng viên) and EMPLOYER (nhà tuyển dụng) users
    const candidateId = currentUser?.id;
    const queryParams = { ...params, candidate: candidateId };

    const query = useQuery({
        queryKey: ['my-interviews', queryParams],
        queryFn: () => interviewService.getSessions(queryParams) as Promise<any>,
        enabled: !!candidateId,
    });

    return query;
};
