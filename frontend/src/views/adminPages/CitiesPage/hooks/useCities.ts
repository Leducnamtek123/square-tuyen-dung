import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { City } from '../../../../types/models';

export const useCities = (params: Record<string, unknown> = {}) => {
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
        mutationFn: (data: Partial<City> | Record<string, unknown>) => adminManagementService.createCity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success('City added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the city');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<City> | Record<string, unknown> }) => adminManagementService.updateCity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success('City updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the city');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteCity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success('City deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the city');
            console.error(err);
        }
    });

    return {
        ...query,
        createCity: createMutation.mutateAsync,
        updateCity: updateMutation.mutateAsync,
        deleteCity: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
