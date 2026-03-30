import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import toastMessages from '../../../../utils/toastMessages';
import { Question } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import adminManagementService from '../../../../services/adminManagementService';

export type UseQuestionsResult = UseQueryResult<PaginatedResponse<Question>> & {
    createQuestion: (data: Partial<Question> | Record<string, unknown>) => Promise<Question>;
    updateQuestion: (args: { id: string | number; data: Partial<Question> | Record<string, unknown> }) => Promise<Question>;
    deleteQuestion: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useQuestions = (params: Record<string, unknown>): UseQuestionsResult => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-questions', params],
        queryFn: () => adminManagementService.getQuestions(params),
        placeholderData: keepPreviousData,
        retry: false,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Question> | Record<string, unknown>) => adminManagementService.createQuestion(data),
        onSuccess: () => {
            toastMessages.success('Question added successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toastMessages.error('Error adding question'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Question> | Record<string, unknown> }) => adminManagementService.updateQuestion(id, data),
        onSuccess: () => {
            toastMessages.success('Question updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toastMessages.error('Error updating question'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteQuestion(id),
        onSuccess: () => {
            toastMessages.success('Question deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toastMessages.error('Error deleting question'),
    });

    return {
        ...query,
        createQuestion: createMutation.mutateAsync,
        updateQuestion: updateMutation.mutateAsync,
        deleteQuestion: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    } as UseQuestionsResult;
};
