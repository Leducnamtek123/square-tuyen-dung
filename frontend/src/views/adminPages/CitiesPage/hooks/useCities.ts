'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import type { AdminListParams, CityPayload } from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { City } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import i18next from 'i18next';

type UseCitiesResult = UseQueryResult<PaginatedResponse<City>> & {
    createCity: (data: CityPayload) => Promise<City>;
    updateCity: (args: { id: string | number; data: Partial<CityPayload> }) => Promise<City>;
    deleteCity: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useCities = (params?: AdminListParams): UseCitiesResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<City>>({
        queryKey: ['admin-cities', params],
        queryFn: async () => {
            const res = await adminManagementService.getCities(params || {});
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation<City, Error, CityPayload>({
        mutationFn: (data: CityPayload) => adminManagementService.createCity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success(i18next.t('admin:pages.cities.toast.addSuccess'));
        },
        onError: (err: Error) => {
            toastMessages.error(i18next.t('admin:pages.cities.toast.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation<City, Error, { id: string | number; data: Partial<CityPayload> }>({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<CityPayload> }) => adminManagementService.updateCity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success(i18next.t('admin:pages.cities.toast.updateSuccess'));
        },
        onError: (err: Error) => {
            toastMessages.error(i18next.t('admin:pages.cities.toast.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: async (id: string | number) => {
            await adminManagementService.deleteCity(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success(i18next.t('admin:pages.cities.toast.deleteSuccess'));
        },
        onError: (err: Error) => {
            toastMessages.error(i18next.t('admin:pages.cities.toast.deleteError'));
            console.error(err);
        }
    });

    return {
        ...query,
        createCity: createMutation.mutateAsync,
        updateCity: updateMutation.mutateAsync,
        deleteCity: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as UseCitiesResult;
};
