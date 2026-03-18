// @ts-nocheck
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useCareers = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-careers', params],
        queryFn: async () => {
            const res = await adminManagementService.getCareers(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createCareer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toast.success('Career added successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while adding the career');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateCareer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toast.success('Career updated successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while updating the career');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteCareer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toast.success('Career deleted successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while deleting the career');
            console.error(err);
        }
    });

    return {
        ...query,
        createCareer: createMutation.mutateAsync,
        updateCareer: updateMutation.mutateAsync,
        deleteCareer: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
