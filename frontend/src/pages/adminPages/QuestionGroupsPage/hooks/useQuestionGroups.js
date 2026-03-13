import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useQuestionGroups = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-question-groups', params],
        queryFn: async () => {
            const res = await adminManagementService.getQuestionGroups(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createQuestionGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toast.success('Question group added successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while adding the question group');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateQuestionGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toast.success('Question group updated successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while updating the question group');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteQuestionGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toast.success('Question group deleted successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while deleting the question group');
            console.error(err);
        }
    });

    return {
        ...query,
        createQuestionGroup: createMutation.mutateAsync,
        updateQuestionGroup: updateMutation.mutateAsync,
        deleteQuestionGroup: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
