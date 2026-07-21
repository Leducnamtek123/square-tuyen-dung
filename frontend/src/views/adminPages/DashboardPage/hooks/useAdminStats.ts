'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import statisticService, { AdminGeneralStats } from '../../../../services/statisticService';

type UseAdminStatsResult = UseQueryResult<AdminGeneralStats>;

export const useAdminStats = (): UseAdminStatsResult => {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await statisticService.adminGeneralStatistics();
            return response;
        },
    });
};
