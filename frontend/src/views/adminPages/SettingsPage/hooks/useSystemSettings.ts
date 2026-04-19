import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import adminSettingsService from '../../../../services/adminSettingsService';
import toastMessages from '../../../../utils/toastMessages';
import type { SystemSettingsPayload } from '../../../../services/adminSettingsService';

export interface SystemSettings extends SystemSettingsPayload {
    maintenanceMode: boolean;
    autoApproveJobs: boolean;
    emailNotifications: boolean;
}

export type UseSystemSettingsResult = UseQueryResult<SystemSettings> & {
    updateSystemSettings: (data: Partial<SystemSettings>) => Promise<SystemSettings>;
    isMutating: boolean;
};

export const useSystemSettings = (): UseSystemSettingsResult => {
    const { t } = useTranslation('admin');
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const res = await adminSettingsService.getSystemSettings();
            return {
                maintenanceMode: !!res.maintenanceMode,
                autoApproveJobs: !!res.autoApproveJobs,
                emailNotifications: res.emailNotifications ?? true,
                ...res,
            } as SystemSettings;
        },
        initialData: {
            maintenanceMode: false,
            autoApproveJobs: false,
            emailNotifications: true,
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
            const res = await adminSettingsService.updateSystemSettings(data);
            return {
                maintenanceMode: !!res.maintenanceMode,
                autoApproveJobs: !!res.autoApproveJobs,
                emailNotifications: res.emailNotifications ?? true,
                ...res,
            } as SystemSettings;
        },
        onSuccess: () => {
            toastMessages.success(t('pages.settings.toast.saveSuccess'));
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        },
        onError: () => toastMessages.error(t('pages.settings.toast.saveError')),
    });

    return {
        ...query,
        updateSystemSettings: updateMutation.mutateAsync,
        isMutating: updateMutation.isPending
    };
};
