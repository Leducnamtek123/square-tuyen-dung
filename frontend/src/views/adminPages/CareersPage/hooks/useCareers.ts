'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import type { AdminListParams, CareerPayload } from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Career } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import i18next from 'i18next';

type UseCareersResult = UseQueryResult<PaginatedResponse<Career>> & {
    createCareer: (data: CareerPayload | FormData) => Promise<Career>;
    updateCareer: (args: { id: string | number; data: Partial<CareerPayload> | FormData }) => Promise<Career>;
    deleteCareer: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useCareers = (params?: AdminListParams): UseCareersResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<Career>>({
        queryKey: ['admin-careers', params],
        queryFn: async (): Promise<PaginatedResponse<Career>> => {
            const res = await adminManagementService.getCareers(params);
            return res as PaginatedResponse<Career>;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: CareerPayload | FormData) => adminManagementService.createCareer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toastMessages.success(i18next.t('admin:pages.careers.toast.addSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.careers.toast.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<CareerPayload> | FormData }) => adminManagementService.updateCareer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toastMessages.success(i18next.t('admin:pages.careers.toast.updateSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.careers.toast.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteCareer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toastMessages.success(i18next.t('admin:pages.careers.toast.deleteSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.careers.toast.deleteError'));
            console.error(err);
        }
    });

    return {
        ...query,
        createCareer: createMutation.mutateAsync,
        updateCareer: updateMutation.mutateAsync,
        deleteCareer: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as UseCareersResult;
};
