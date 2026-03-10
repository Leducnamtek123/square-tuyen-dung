import { useQuery } from '@tanstack/react-query';
import statisticService from '../../../../services/statisticService';

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await statisticService.adminGeneralStatistics();
            return response;
        },
    });
};

