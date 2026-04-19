import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import type { AdminBannerPayload, AdminListParams } from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Banner } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseBannersResult = UseQueryResult<PaginatedResponse<Banner>> & {
    createBanner: (data: FormData | AdminBannerPayload) => Promise<Banner>;
    updateBanner: (args: { id: string | number; data: FormData | Partial<AdminBannerPayload> }) => Promise<Banner>;
    deleteBanner: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useBanners = (params?: AdminListParams): UseBannersResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<Banner>>({
        queryKey: ['admin-banners', params],
        queryFn: async () => {
            const res = await adminManagementService.getBanners(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation<Banner, Error, FormData | AdminBannerPayload>({
        mutationFn: (data: FormData | AdminBannerPayload) => adminManagementService.createBanner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            toastMessages.success('Banner added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the banner');
            console.error(err);
        }
    });

    const updateMutation = useMutation<Banner, Error, { id: string | number; data: FormData | Partial<AdminBannerPayload> }>({
        mutationFn: ({ id, data }: { id: string | number; data: FormData | Partial<AdminBannerPayload> }) => 
            adminManagementService.updateBanner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            toastMessages.success('Banner updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the banner');
            console.error(err);
        }
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: (id: string | number) => adminManagementService.deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            toastMessages.success('Banner deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the banner');
            console.error(err);
        }
    });

    return {
        ...query,
        createBanner: createMutation.mutateAsync,
        updateBanner: updateMutation.mutateAsync,
        deleteBanner: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as UseBannersResult;
};
