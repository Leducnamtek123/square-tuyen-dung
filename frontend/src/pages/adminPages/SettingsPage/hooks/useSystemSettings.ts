// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import adminSettingsService from '../../../../services/adminSettingsService';
import toastMessages from '../../../../utils/toastMessages';

export const useSystemSettings = () => {
    return useQuery({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const res = await adminSettingsService.getSystemSettings();
            return res;
        },
        initialData: {
            maintenanceMode: false,
            autoApproveJobs: false,
            emailNotifications: true,
        },
    });
};

export const useUpdateSystemSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => adminSettingsService.updateSystemSettings(data),
        onSuccess: () => {
            toastMessages.success('Cai dat da duoc luu');
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        },
        onError: () => toastMessages.error('Loi khi luu cai dat'),
    });
};
