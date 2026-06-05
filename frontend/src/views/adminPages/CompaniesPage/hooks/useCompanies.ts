'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import type { AdminListParams } from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Company } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import i18next from 'i18next';

export interface AdminCompanyPayload {
    companyName: string;
    taxCode: string;
    companyEmail: string;
    companyPhone: string;
    employeeSize: number;
    fieldOperation: string;
    websiteUrl?: string | null;
    description?: string | null;
    since?: string | null;
    location: {
        city?: number | null;
        district?: number | null;
        ward?: number | null;
        address: string;
        lat?: number | null;
        lng?: number | null;
    };
}

type UseCompaniesResult = UseQueryResult<PaginatedResponse<Company>> & {
    createCompany: (data: AdminCompanyPayload) => Promise<Company>;
    updateCompany: (args: { id: string | number; data: Partial<AdminCompanyPayload> }) => Promise<Company>;
    deleteCompany: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useCompanies = (params?: AdminListParams): UseCompaniesResult => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-companies', params],
        queryFn: async () => {
            const res = await adminManagementService.getCompanies(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: AdminCompanyPayload) => adminManagementService.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toastMessages.success(i18next.t('admin:pages.companies.toast.addSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.companies.toast.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<AdminCompanyPayload> }) => adminManagementService.updateCompany(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toastMessages.success(i18next.t('admin:pages.companies.toast.updateSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.companies.toast.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toastMessages.success(i18next.t('admin:pages.companies.toast.deleteSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.companies.toast.deleteError'));
            console.error(err);
        }
    });

    return {
        ...query,
        createCompany: createMutation.mutateAsync,
        updateCompany: updateMutation.mutateAsync,
        deleteCompany: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as UseCompaniesResult;
};
