'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import statisticService, { AdminGeneralStats, AdminTrendStats } from '../../../../services/statisticService';

export const useAdminStats = (): UseQueryResult<AdminGeneralStats> => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await statisticService.adminGeneralStatistics();
      return response;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAdminTrendStats = (days: number = 30): UseQueryResult<AdminTrendStats> => {
  return useQuery({
    queryKey: ['admin-trend-stats', days],
    queryFn: async () => {
      const response = await statisticService.adminTrendStatistics(days);
      return response;
    },
    staleTime: 60 * 1000,
  });
};
