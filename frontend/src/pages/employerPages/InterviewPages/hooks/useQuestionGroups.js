import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import questionGroupService from '../../../../services/questionGroupService';
import { toast } from 'react-toastify';

export const useQuestionGroups = (params) => {
    const { t } = useTranslation('employer');
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
            toast.success(t('questionGroupsCard.messages.addSuccess'));
        },
        onError: (err) => {
            toast.error(t('questionGroupsCard.messages.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => questionGroupService.updateQuestionGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toast.success(t('questionGroupsCard.messages.updateSuccess'));
        },
        onError: (err) => {
            toast.error(t('questionGroupsCard.messages.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => questionGroupService.deleteQuestionGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toast.success(t('questionGroupsCard.messages.deleteSuccess'));
        },
        onError: (err) => {
            toast.error(t('questionGroupsCard.messages.deleteError'));
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
