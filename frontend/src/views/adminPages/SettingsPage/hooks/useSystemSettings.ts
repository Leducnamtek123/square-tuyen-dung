import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('admin');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => adminSettingsService.updateSystemSettings(data),
        onSuccess: () => {
            toastMessages.success(t('pages.settings.toast.saveSuccess'));
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        },
        onError: () => toastMessages.error(t('pages.settings.toast.saveError')),
    });
};
