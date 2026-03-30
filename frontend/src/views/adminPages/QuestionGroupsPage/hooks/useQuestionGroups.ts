import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { QuestionGroup } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseQuestionGroupsResult = UseQueryResult<PaginatedResponse<QuestionGroup>> & {
    createQuestionGroup: (data: Partial<QuestionGroup> | Record<string, unknown>) => Promise<QuestionGroup>;
    updateQuestionGroup: (args: { id: string | number; data: Partial<QuestionGroup> | Record<string, unknown> }) => Promise<QuestionGroup>;
    deleteQuestionGroup: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useQuestionGroups = (params?: Record<string, unknown>): UseQuestionGroupsResult => {
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
        mutationFn: (data: Partial<QuestionGroup> | Record<string, unknown>) => adminManagementService.createQuestionGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toastMessages.success('Question group added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the question group');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<QuestionGroup> | Record<string, unknown> }) => adminManagementService.updateQuestionGroup(id, data),        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toastMessages.success('Question group updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the question group');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteQuestionGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-groups'] });
            toastMessages.success('Question group deleted successfully');
        },
        onError: (err: Error | unknown) => {
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
    } as UseQuestionGroupsResult;
};
