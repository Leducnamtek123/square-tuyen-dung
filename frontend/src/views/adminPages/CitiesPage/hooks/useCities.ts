import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { City } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseCitiesResult = UseQueryResult<PaginatedResponse<City>> & {
    createCity: (data: Partial<City>) => Promise<City>;
    updateCity: (args: { id: string | number; data: Partial<City> }) => Promise<City>;
    deleteCity: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useCities = (params?: Record<string, unknown>): UseCitiesResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<City>>({
        queryKey: ['admin-cities', params],
        queryFn: async () => {
            const res = await adminManagementService.getCities(params || {});
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation<City, Error, Partial<City>>({
        mutationFn: (data: Partial<City>) => adminManagementService.createCity(data as Record<string, unknown>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success('City added successfully');
        },
        onError: (err: Error) => {
            toastMessages.error('An error occurred while adding the city');
            console.error(err);
        }
    });

    const updateMutation = useMutation<City, Error, { id: string | number; data: Partial<City> }>({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<City> }) => adminManagementService.updateCity(id, data as Record<string, unknown>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success('City updated successfully');
        },
        onError: (err: Error) => {
            toastMessages.error('An error occurred while updating the city');
            console.error(err);
        }
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: async (id: string | number) => {
            await adminManagementService.deleteCity(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toastMessages.success('City deleted successfully');
        },
        onError: (err: Error) => {
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
    } as UseCitiesResult;
};
