'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import contactMessageService from '../../../../services/contactMessageService';
import type { AdminListParams } from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { ContactMessage } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import i18next from 'i18next';

type UseContactMessagesResult = {
    data: PaginatedResponse<ContactMessage> | undefined;
    isLoading: boolean;
    markAsRead: (id: string | number) => Promise<ContactMessage>;
    deleteMessage: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useContactMessages = (params?: AdminListParams): UseContactMessagesResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<ContactMessage>>({
        queryKey: ['admin-contact-messages', params],
        queryFn: async () => {
            const res = await contactMessageService.getList(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const markAsReadMutation = useMutation<ContactMessage, Error, string | number>({
        mutationFn: (id: string | number) => contactMessageService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
            toastMessages.success(i18next.t('admin:pages.contactMessages.toast.markAsReadSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.contactMessages.toast.markAsReadError'));
            console.error(err);
        }
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: (id: string | number) => contactMessageService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
            toastMessages.success(i18next.t('admin:pages.contactMessages.toast.deleteSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.contactMessages.toast.deleteError'));
            console.error(err);
        }
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        markAsRead: markAsReadMutation.mutateAsync,
        deleteMessage: deleteMutation.mutateAsync,
        isMutating: markAsReadMutation.isPending || deleteMutation.isPending,
    };
};