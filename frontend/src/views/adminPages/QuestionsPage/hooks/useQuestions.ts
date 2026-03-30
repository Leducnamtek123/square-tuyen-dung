import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import questionService from '../../../../services/questionService';
import toastMessages from '../../../../utils/toastMessages';
import { Question } from '../../../../types/models';

export const useQuestions = (params: Record<string, unknown>) => {
    return useQuery({
        queryKey: ['admin-questions', params],
        queryFn: async () => {
            const res = await questionService.getAllQuestions(params);
            return res;
        },
        placeholderData: keepPreviousData,
        retry: false,
    });
};

export const useCreateQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Question> | Record<string, unknown>) => questionService.createQuestion(data),
        onSuccess: () => {
            toastMessages.success('Question added successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toastMessages.error('Error adding question'),
    });
};

export const useUpdateQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Question> | Record<string, unknown> }) => questionService.updateQuestion(id, data),
        onSuccess: () => {
            toastMessages.success('Question updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toastMessages.error('Error updating question'),
    });
};

export const useDeleteQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => questionService.deleteQuestion(id),
        onSuccess: () => {
            toastMessages.success('Question deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toastMessages.error('Error deleting question'),
    });
};
