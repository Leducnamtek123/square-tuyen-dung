import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Company } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseCompaniesResult = UseQueryResult<PaginatedResponse<Company>> & {
    createCompany: (data: FormData) => Promise<Company>;
    updateCompany: (args: { id: string | number; data: FormData }) => Promise<Company>;
    deleteCompany: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useCompanies = (params?: Record<string, unknown>): UseCompaniesResult => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-companies', params],
        queryFn: async () => {
            const res = await adminManagementService.getCompanies(params as Record<string, unknown>);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: FormData) => adminManagementService.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toastMessages.success('Company added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the company');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: FormData }) => adminManagementService.updateCompany(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toastMessages.success('Company updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the company');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toastMessages.success('Company deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the company');
            console.error(err);
        }
    });

    return {
        ...query,
        createCompany: createMutation.mutateAsync,
        updateCompany: updateMutation.mutateAsync,
        deleteCompany: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as unknown as UseCompaniesResult;
};
