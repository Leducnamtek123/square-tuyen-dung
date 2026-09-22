'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import statisticService, {
  AdminGeneralStats,
  AdminTrendStats,
  SystemHealthStatus,
} from '@/services/statisticService';

export const useAdminStats = (days: number = 30): UseQueryResult<AdminGeneralStats> => {
  return useQuery({
    queryKey: ['admin-stats', days],
    queryFn: async () => {
      const response = await statisticService.adminGeneralStatistics(days);
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

export const useSystemHealth = (): UseQueryResult<SystemHealthStatus> => {
  return useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const response = await statisticService.systemHealthStatistics();
      return response;
    },
    refetchInterval: 30 * 1000, // auto poll every 30s for live health
    staleTime: 15 * 1000,
  });
};
