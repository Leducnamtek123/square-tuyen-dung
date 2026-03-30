import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import i18next from 'i18next';
import { Ward } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseWardsResult = UseQueryResult<PaginatedResponse<Ward>> & {
    createWard: (data: Partial<Ward>) => Promise<Ward>;
    updateWard: (args: { id: string | number; data: Partial<Ward> }) => Promise<Ward>;
    deleteWard: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useWards = (params?: Record<string, unknown>): UseWardsResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<Ward>>({
        queryKey: ['admin-wards', params],
        queryFn: async () => {
            const res = await adminManagementService.getWards(params);
            return res;
        },
        placeholderData: keepPreviousData,
        enabled: !!(params?.district || !params),
    });

    const createMutation = useMutation<Ward, Error, Partial<Ward>>({
        mutationFn: (data: Partial<Ward>) => adminManagementService.createWard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toastMessages.success(i18next.t('admin:pages.wards.toast.addSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.wards.toast.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation<Ward, Error, { id: string | number; data: Partial<Ward> }>({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Ward> }) => adminManagementService.updateWard(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-wards'] });
            toastMessages.success(i18next.t('admin:pages.wards.toast.updateSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.wards.toast.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation<void, Error, string | number>({
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
    } as UseWardsResult;
};
