import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import i18next from 'i18next';

export const useWards = (params?: Record<string, unknown>) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-wards', params],
        queryFn: async () => {
            const res = await adminManagementService.getWards(params);
            return res;
        },
        placeholderData: keepPreviousData,
        enabled: !!(params?.district || !params),
    });

    const createMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => adminManagementService.createWard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toastMessages.success(i18next.t('admin:pages.wards.toast.addSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.wards.toast.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) => adminManagementService.updateWard(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toastMessages.success(i18next.t('admin:pages.wards.toast.updateSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.wards.toast.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteWard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toastMessages.success(i18next.t('admin:pages.wards.toast.deleteSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.wards.toast.deleteError'));
            console.error(err);
        }
    });

    return {
        ...query,
        createWard: createMutation.mutateAsync,
        updateWard: updateMutation.mutateAsync,
        deleteWard: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
