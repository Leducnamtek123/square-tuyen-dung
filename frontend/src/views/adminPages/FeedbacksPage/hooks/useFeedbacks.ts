'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import type { AdminFeedbackPayload, AdminListParams } from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Feedback } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

type UseFeedbacksResult = UseQueryResult<PaginatedResponse<Feedback>> & {
    updateFeedback: (args: { id: string | number; data: Partial<AdminFeedbackPayload> }) => Promise<Feedback>;
    deleteFeedback: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useFeedbacks = (params?: AdminListParams): UseFeedbacksResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<Feedback>>({
        queryKey: ['admin-feedbacks', params],
        queryFn: async () => {
            const res = await adminManagementService.getFeedbacks(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const updateMutation = useMutation<Feedback, Error, { id: string | number; data: Partial<AdminFeedbackPayload> }>({
        mutationFn: ({ id, data }) => adminManagementService.updateFeedback(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
            toastMessages.success('Feedback updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the feedback');
            console.error(err);
        }
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: (id: string | number) => adminManagementService.deleteFeedback(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
            toastMessages.success('Feedback deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the feedback');
            console.error(err);
        }
    });

    return {
        ...query,
        updateFeedback: updateMutation.mutateAsync,
        deleteFeedback: deleteMutation.mutateAsync,
        isMutating: updateMutation.isPending || deleteMutation.isPending
    } as UseFeedbacksResult;
};
