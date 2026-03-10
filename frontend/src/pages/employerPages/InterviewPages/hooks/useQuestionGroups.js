import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import questionGroupService from '../../../../services/questionGroupService';
import { toast } from 'react-toastify';

export const useQuestionGroups = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['employer-question-groups', params],
        queryFn: () => questionGroupService.getQuestionGroups(params),
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => questionGroupService.createQuestionGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toast.success('Thêm bộ câu hỏi thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm bộ câu hỏi');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => questionGroupService.updateQuestionGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toast.success('Cập nhật bộ câu hỏi thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật bộ câu hỏi');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => questionGroupService.deleteQuestionGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toast.success('Xóa bộ câu hỏi thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa bộ câu hỏi');
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
