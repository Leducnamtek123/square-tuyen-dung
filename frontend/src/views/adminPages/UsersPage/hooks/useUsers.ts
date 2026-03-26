import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import userService from '../../../../services/userService';
import toastMessages from '../../../../utils/toastMessages';
import i18n from '../../../../i18n';

const t = (key: string, options?: any) => i18n.t(key, { ns: 'admin', ...options }) as string;

export const useUsers = (params: any) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await userService.getAllUsers(params);
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

export const useToggleUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: any) => userService.toggleUserStatus(user.id),
        onSuccess: (_data, user: any) => {
            toastMessages.success(
                user.isActive
                    ? t('pages.users.toast.blockSuccess')
                    : t('pages.users.toast.unblockSuccess')
            );
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toastMessages.error(
                error.response?.data?.errors?.detail || t('pages.users.toast.actionFailed')
            );
        }
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, roleName }: { userId: any; roleName: string }) => userService.updateUser(userId, { roleName }),
        onSuccess: () => {
            toastMessages.success(t('pages.users.toast.roleUpdated'));
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toastMessages.error(
                error.response?.data?.errors?.detail || t('pages.users.toast.roleUpdateFailed')
            );
        }
    });
};
