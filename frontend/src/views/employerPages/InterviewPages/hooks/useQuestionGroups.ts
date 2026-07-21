'use client';

import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import questionGroupService from '../../../../services/questionGroupService';
import type { QuestionGroupListParams, QuestionGroupPayload } from '../../../../services/questionGroupService';
import toastMessages from '../../../../utils/toastMessages';
import type { QuestionGroup } from '../../../../types/models';
import type { PaginatedResponse } from '../../../../types/api';

export const useQuestionGroups = (params: QuestionGroupListParams) => {
    const { t } = useTranslation('employer');
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<QuestionGroup>>({
        queryKey: ['employer-question-groups', params],
        queryFn: () => questionGroupService.getQuestionGroups(params),
        placeholderData: keepPreviousData,
        retry: false,
    });

    const createMutation = useMutation<QuestionGroup, Error, QuestionGroupPayload>({
        mutationFn: (data: QuestionGroupPayload) => questionGroupService.createQuestionGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toastMessages.success(t('questionGroupsCard.messages.addSuccess'));
        },
        onError: (err) => {
            toastMessages.error(t('questionGroupsCard.messages.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation<QuestionGroup, Error, { id: string | number, data: Partial<QuestionGroupPayload> }>({
        mutationFn: ({ id, data }: { id: string | number, data: Partial<QuestionGroupPayload> }) => questionGroupService.updateQuestionGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-question-groups'] });
            toastMessages.success(t('questionGroupsCard.messages.updateSuccess'));
        },
        onError: (err) => {
            toastMessages.error(t('questionGroupsCard.messages.updateError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation<void, Error, string | number>({
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
