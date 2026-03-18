// @ts-nocheck
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useCompanies = (params) => {
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
        mutationFn: (data) => adminManagementService.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toast.success('Company added successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while adding the company');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateCompany(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toast.success('Company updated successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while updating the company');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toast.success('Company deleted successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while deleting the company');
            console.error(err);
        }
    });

    return {
        ...query,
        createCompany: createMutation.mutateAsync,
        updateCompany: updateMutation.mutateAsync,
        deleteCompany: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
