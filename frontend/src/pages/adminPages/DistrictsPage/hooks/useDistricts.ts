// @ts-nocheck
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useDistricts = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-districts', params],
        queryFn: async () => {
            const res = await adminManagementService.getDistricts(params);
            return res;
        },
        placeholderData: keepPreviousData,
        enabled: !!(params?.city || !params),
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createDistrict(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toast.success('District added successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while adding the district');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateDistrict(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toast.success('District updated successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while updating the district');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteDistrict(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toast.success('District deleted successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while deleting the district');
            console.error(err);
        }
    });

    return {
        ...query,
        createDistrict: createMutation.mutateAsync,
        updateDistrict: updateMutation.mutateAsync,
        deleteDistrict: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
