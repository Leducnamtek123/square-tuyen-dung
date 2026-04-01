import { useQuery } from '@tanstack/react-query';
import commonService from '../services/commonService';
import type { SystemConfig } from '../types/models';
import type { Career } from '../types/models';

const CONFIG_QUERY_KEY = ['systemConfig'];
const STALE_TIME = 10 * 60 * 1000; // 10 minutes

export const useConfig = () => {
  const query = useQuery<SystemConfig>({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: async () => {
      // Fire both requests in parallel
      const [resData, careersRes] = await Promise.all([
        commonService.getConfigs(),
        commonService.getAllCareersSimple().catch(() => [] as Career[]),
      ]);

      let merged = { ...(resData as SystemConfig) };

      if (Array.isArray(careersRes) && careersRes.length > 0) {
        merged = {
          ...merged,
          careers: careersRes,
          careerOptions: careersRes.map((career: Career) => ({
            id: career.id,
            name: career.name,
          })),
        };
      }

      return merged;
    },
    staleTime: STALE_TIME,
    gcTime: STALE_TIME + 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    allConfig: query.data || null,
    isLoadingConfig: query.isLoading,
    isErrorConfig: query.isError,
  };
};
