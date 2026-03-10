import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminSettingsService from '../../../../services/adminSettingsService';
import { message } from 'antd';

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
            message.success('Cài đặt đã được lưu');
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        },
        onError: () => message.error('Lỗi khi lưu cài đặt'),
    });
};

