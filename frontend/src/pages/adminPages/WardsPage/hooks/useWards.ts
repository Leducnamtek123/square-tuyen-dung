import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';
import i18next from 'i18next';

export const useWards = (params: any) => {
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
        mutationFn: (data: any) => adminManagementService.createWard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toast.success(i18next.t('admin:pages.wards.toast.addSuccess'));
        },
        onError: (err: any) => {
            toast.error(i18next.t('admin:pages.wards.toast.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: any; data: any }) => adminManagementService.updateWard(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toast.success(i18next.t('admin:pages.wards.toast.updateSuccess'));
        },
        onError: (err: any) => {
            toast.error(i18next.t('admin:pages.wards.toast.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: any) => adminManagementService.deleteWard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toast.success(i18next.t('admin:pages.wards.toast.deleteSuccess'));
        },
        onError: (err: any) => {
            toast.error(i18next.t('admin:pages.wards.toast.deleteError'));
            console.error(err);
        }
    });

    return {
        ...query,
        createWard: createMutation.mutateAsync,
        updateWard: updateMutation.mutateAsync,
        deleteWard: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as any;
};
