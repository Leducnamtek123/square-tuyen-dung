import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Career } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseCareersResult = UseQueryResult<PaginatedResponse<Career>> & {
    createCareer: (data: Partial<Career>) => Promise<Career>;
    updateCareer: (args: { id: string | number; data: Partial<Career> }) => Promise<Career>;
    deleteCareer: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useCareers = (params?: Record<string, unknown>): UseCareersResult => {
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
        mutationFn: (data: Partial<Career>) => adminManagementService.createCareer(data as Record<string, unknown>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toastMessages.success('Career added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the career');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Career> }) => adminManagementService.updateCareer(id, data as Record<string, unknown>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toastMessages.success('Career updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the career');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteCareer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toastMessages.success('Career deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the career');
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
