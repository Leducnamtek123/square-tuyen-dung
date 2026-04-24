'use client';

import { useMutation, useQuery, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService, { AdminBannerTypePayload, AdminListParams } from '../../../../services/adminManagementService';
import { BannerType } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import toastMessages from '../../../../utils/toastMessages';

type UseBannerTypesResult = UseQueryResult<PaginatedResponse<BannerType>> & {
  createBannerType: (data: AdminBannerTypePayload) => Promise<BannerType>;
  updateBannerType: (args: { id: string | number; data: Partial<AdminBannerTypePayload> }) => Promise<BannerType>;
  deleteBannerType: (id: string | number) => Promise<void>;
  isMutating: boolean;
};

export const useBannerTypes = (params?: AdminListParams): UseBannerTypesResult => {
  const queryClient = useQueryClient();

  const query = useQuery<PaginatedResponse<BannerType>>({
    queryKey: ['admin-banner-types', params],
    queryFn: () => adminManagementService.getBannerTypes(params),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation<BannerType, Error, AdminBannerTypePayload>({
    mutationFn: (data) => adminManagementService.createBannerType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banner-types'] });
      toastMessages.success('Banner type added successfully');
    },
    onError: (err) => {
      toastMessages.error('An error occurred while adding the banner type');
      console.error(err);
    },
  });

  const updateMutation = useMutation<BannerType, Error, { id: string | number; data: Partial<AdminBannerTypePayload> }>({
    mutationFn: ({ id, data }) => adminManagementService.updateBannerType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banner-types'] });
      toastMessages.success('Banner type updated successfully');
    },
    onError: (err) => {
      toastMessages.error('An error occurred while updating the banner type');
      console.error(err);
    },
  });

  const deleteMutation = useMutation<void, Error, string | number>({
    mutationFn: (id) => adminManagementService.deleteBannerType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banner-types'] });
      toastMessages.success('Banner type deleted successfully');
    },
    onError: (err) => {
      toastMessages.error('An error occurred while deleting the banner type');
      console.error(err);
    },
  });

  return {
    ...query,
    createBannerType: createMutation.mutateAsync,
    updateBannerType: updateMutation.mutateAsync,
    deleteBannerType: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  } as UseBannerTypesResult;
};
