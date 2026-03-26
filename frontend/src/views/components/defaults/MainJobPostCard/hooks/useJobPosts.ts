import { useQuery, keepPreviousData } from '@tanstack/react-query';
import jobService from '../../../../../services/jobService';

type AnyRecord = Record<string, unknown>;

export const useJobPosts = (params: AnyRecord, page: number) => {
    return useQuery({
        queryKey: ['jobPosts', params, page],
        queryFn: async () => {
            const response = await jobService.getJobPosts({
                ...params,
                page,
            });
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

export const useSuggestedJobPosts = (params: AnyRecord, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['suggestedJobPosts', params],
        queryFn: async () => {
            const response = await jobService.getSuggestedJobPosts(params);
            return response;
        },
        placeholderData: keepPreviousData,
        enabled,
    });
};
