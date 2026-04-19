import { useQuery, keepPreviousData } from '@tanstack/react-query';
import jobService from '../../../../../services/jobService';
import type { JobPostFilter } from '../../../../../redux/filterSlice';
import type { GetJobPostsParams } from '../../../../../services/jobService';

export const useJobPosts = (params: JobPostFilter, page: number) => {
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

export const useSuggestedJobPosts = (params: GetJobPostsParams, enabled: boolean = true) => {
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
