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
      // Fire all requests in parallel with resilient settlement
      const [configRes, careersSettled, citiesSettled] = await Promise.allSettled([
        commonService.getConfigs(),
        commonService.getAllCareersSimple(),
        commonService.getAllCitiesSimple(),
      ]);

      if (configRes.status === 'rejected') {
        throw configRes.reason;
      }

      let merged = { ...(configRes.value as SystemConfig) };

      if (careersSettled.status === 'fulfilled' && Array.isArray(careersSettled.value) && careersSettled.value.length > 0) {
        const careersRes = careersSettled.value;
        merged = {
          ...merged,
          careers: careersRes,
          careerOptions: careersRes.map((career: Career) => ({
            id: career.id,
            name: career.name,
          })),
        };
      }

      if (citiesSettled.status === 'fulfilled' && Array.isArray(citiesSettled.value) && citiesSettled.value.length > 0) {
        const citiesRes = citiesSettled.value;
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
    retry: (failureCount, error: any) => {
      if (isMaintenanceModeError(error)) return false;
      if (error?.response?.status === 429 || error?.status === 429) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
  });

  return {
    allConfig: query.data || null,
    isLoadingConfig: query.isLoading,
    isErrorConfig: query.isError,
    errorConfig: query.error,
  };
};
