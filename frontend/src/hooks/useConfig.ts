import { useQuery } from '@tanstack/react-query';
import commonService from '../services/commonService';
import type { SystemConfig } from '../types/models';
import type { Career } from '../types/models';
import { isMaintenanceModeError } from '../utils/maintenanceMode';

const CONFIG_QUERY_KEY = ['systemConfig'];
const STALE_TIME = 10 * 60 * 1000; // 10 minutes

export const useConfig = () => {
  const query = useQuery<SystemConfig>({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: async () => {
      // Fire all requests in parallel
      const [resData, careersRes, citiesRes] = await Promise.all([
        commonService.getConfigs(),
        commonService.getAllCareersSimple().catch(() => [] as Career[]),
        commonService.getAllCitiesSimple().catch(() => [] as { id: number; name: string }[]),
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

      if (Array.isArray(citiesRes) && citiesRes.length > 0) {
        merged = {
          ...merged,
          cities: citiesRes.map((c) => ({ id: Number(c.id), name: c.name })),
          cityOptions: citiesRes.map((c) => ({
            id: c.id,
            name: c.name,
          })),
        };
      }

      return merged;
    },
    staleTime: STALE_TIME,
    gcTime: STALE_TIME + 5 * 60 * 1000,
    retry: (failureCount, error) =>
      !isMaintenanceModeError(error) && failureCount < 2,
    refetchOnWindowFocus: false,
  });

  return {
    allConfig: query.data || null,
    isLoadingConfig: query.isLoading,
    isErrorConfig: query.isError,
    errorConfig: query.error,
  };
};
