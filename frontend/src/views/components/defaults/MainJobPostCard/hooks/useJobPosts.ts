import React from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import jobService from '../../../../../services/jobService';
import type { JobPostFilter } from '../../../../../redux/filterSlice';
import type { GetJobPostsParams } from '../../../../../services/jobService';

export const useJobPosts = (params: JobPostFilter, page: number) => {
    const queryClient = useQueryClient();
    const query = useQuery({
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

    // Prefetch next page for seamless UX
    React.useEffect(() => {
        if (query.data?.count && page * (params.pageSize || 10) < query.data.count) {
            const nextParams = { ...params, page: page + 1 };
            queryClient.prefetchQuery({
                queryKey: ['jobPosts', nextParams, page + 1],
                queryFn: () => jobService.getJobPosts(nextParams),
                staleTime: 5 * 60_000,
            });
        }
    }, [query.data, page, params, queryClient]);

    return query;
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
