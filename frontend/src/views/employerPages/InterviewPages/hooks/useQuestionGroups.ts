import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import questionGroupService from '../../../../services/questionGroupService';
import toastMessages from '../../../../utils/toastMessages';

export const useQuestionGroups = (params: Record<string, unknown>) => {
    const { t } = useTranslation('employer');
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['employer-question-groups', params],
        queryFn: () => questionGroupService.getQuestionGroups(params),
        placeholderData: keepPreviousData,
        retry: false,
    });

    const createMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => questionGroupService.createQuestionGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toastMessages.success(t('questionGroupsCard.messages.addSuccess'));
        },
        onError: (err) => {
            toastMessages.error(t('questionGroupsCard.messages.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number, data: Record<string, unknown> }) => questionGroupService.updateQuestionGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toastMessages.success(t('questionGroupsCard.messages.updateSuccess'));
        },
        onError: (err) => {
            toastMessages.error(t('questionGroupsCard.messages.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => questionGroupService.deleteQuestionGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toastMessages.success(t('questionGroupsCard.messages.deleteSuccess'));
        },
        onError: (err) => {
            toastMessages.error(t('questionGroupsCard.messages.deleteError'));
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
