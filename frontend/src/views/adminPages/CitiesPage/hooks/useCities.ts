import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useCities = (params: any = {}) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-cities', params],
        queryFn: async () => {
            const res = await adminManagementService.getCities(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => adminManagementService.createCity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toast.success('City added successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while adding the city');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: any; data: any }) => adminManagementService.updateCity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toast.success('City updated successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while updating the city');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: any) => adminManagementService.deleteCity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toast.success('City deleted successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while deleting the city');
            console.error(err);
        }
    });

    return {
        ...query,
        createCity: createMutation.mutateAsync,
        updateCity: updateMutation.mutateAsync,
        deleteCity: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as any;
};
