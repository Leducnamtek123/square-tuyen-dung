import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { District } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export const useDistricts = (params?: Record<string, unknown>) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-districts', params],
        queryFn: async (): Promise<PaginatedResponse<District>> => {
            const res = await adminManagementService.getDistricts(params);
            return res as PaginatedResponse<District>;
        },
        placeholderData: keepPreviousData,
        enabled: !!(params?.city || !params),
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<District> | Record<string, unknown>) => adminManagementService.createDistrict(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toastMessages.success('District added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the district');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<District> | Record<string, unknown> }) => adminManagementService.updateDistrict(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toastMessages.success('District updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the district');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteDistrict(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toastMessages.success('District deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the district');
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
