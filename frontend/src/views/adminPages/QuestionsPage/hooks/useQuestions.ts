import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import questionService from '../../../../services/questionService';
import { toast } from 'react-toastify';

export const useQuestions = (params: any) => {
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
        mutationFn: (data: any) => questionService.createQuestion(data),
        onSuccess: () => {
            toast.success('Question added successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toast.error('Error adding question'),
    });
};

export const useUpdateQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: any; data: any }) => questionService.updateQuestion(id, data),
        onSuccess: () => {
            toast.success('Question updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toast.error('Error updating question'),
    });
};

export const useDeleteQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: any) => questionService.deleteQuestion(id),
        onSuccess: () => {
            toast.success('Question deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
        onError: () => toast.error('Error deleting question'),
    });
};
