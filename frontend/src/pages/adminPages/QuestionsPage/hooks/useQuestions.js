import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import questionService from '../../../../services/questionService';

import { toast } from 'react-toastify';



export const useQuestions = (params) => {
    return useQuery({
        queryKey: ['admin-questions', params],
        queryFn: async () => {
            const res = await questionService.getAllQuestions(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });
};


export const useCreateQuestion = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (data) => questionService.createQuestion(data),

        onSuccess: () => {

            toast.success('Thêm câu hỏi thành công');

            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });

        },

        onError: () => toast.error('Lỗi khi th?m c?u h?i'),

    });

};



export const useUpdateQuestion = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => questionService.updateQuestion(id, data),

        onSuccess: () => {

            toast.success('Cập nhật c?u h?i thành công');

            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });

        },

        onError: () => toast.error('Lỗi khi c?p nh?t c?u h?i'),

    });

};



export const useDeleteQuestion = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (id) => questionService.deleteQuestion(id),

        onSuccess: () => {

            toast.success('Xóa c?u h?i thành công');

            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });

        },

        onError: () => toast.error('Lỗi khi x?a c?u h?i'),

    });

};

