import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';

export const useQuestionGroups = (params: any) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-question-groups', params],
        queryFn: async () => {
            const res = await adminManagementService.getQuestionGroups(params);
            return res;
        },
        placeholderData: keepPreviousData,
        retry: false,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => adminManagementService.createQuestionGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toastMessages.success('Question group added successfully');
        },
        onError: (err: any) => {
            toastMessages.error('An error occurred while adding the question group');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: any; data: any }) => adminManagementService.updateQuestionGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toastMessages.success('Question group updated successfully');
        },
        onError: (err: any) => {
            toastMessages.error('An error occurred while updating the question group');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: any) => adminManagementService.deleteQuestionGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toastMessages.success('Question group deleted successfully');
        },
        onError: (err: any) => {
            toastMessages.error('An error occurred while deleting the question group');
            console.error(err);
        }
    });

    return {
        ...query,
        createQuestionGroup: createMutation.mutateAsync,
        updateQuestionGroup: updateMutation.mutateAsync,
        deleteQuestionGroup: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as any;
};
