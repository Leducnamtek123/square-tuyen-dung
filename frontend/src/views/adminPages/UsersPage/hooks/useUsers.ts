import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import userService from '../../../../services/userService';
import toastMessages from '../../../../utils/toastMessages';
import i18n from '../../../../i18n';
import { User as UserModel } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import { RoleName } from '../../../../types/auth';
import type { AxiosError } from 'axios';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, { ns: 'admin', ...options });

export type UseUsersResult = UseQueryResult<PaginatedResponse<UserModel>> & {
    toggleUserStatus: (user: UserModel) => Promise<UserModel>;
    updateUserRole: (args: { userId: string | number; roleName: RoleName }) => Promise<UserModel>;
    deleteUser: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useUsers = (params: Record<string, unknown>): UseUsersResult => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await userService.getAllUsers(params);
            return response;
        },
        placeholderData: keepPreviousData,
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (user: UserModel) => userService.toggleUserStatus(user.id),
        onSuccess: (_data, user: UserModel) => {
            toastMessages.success(
                user.isActive
                    ? t('pages.users.toast.blockSuccess')
                    : t('pages.users.toast.unblockSuccess')
            );
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ errors?: { detail?: string } }>;
            toastMessages.error(
                err.response?.data?.errors?.detail || t('pages.users.toast.actionFailed')
            );
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, roleName }: { userId: string | number; roleName: RoleName }) => userService.updateUser(userId, { roleName }),
        onSuccess: () => {
            toastMessages.success(t('pages.users.toast.roleUpdated'));
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ errors?: { detail?: string } }>;
            toastMessages.error(
                err.response?.data?.errors?.detail || t('pages.users.toast.roleUpdateFailed')
            );
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => userService.deleteUser(id),
        onSuccess: () => {
            toastMessages.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ errors?: { detail?: string } }>;
            toastMessages.error(
                err.response?.data?.errors?.detail || 'Delete failed'
            );
        }
    });

    return {
        ...query,
        toggleUserStatus: toggleStatusMutation.mutateAsync,
        updateUserRole: updateRoleMutation.mutateAsync,
        deleteUser: deleteMutation.mutateAsync,
        isMutating: toggleStatusMutation.isPending || updateRoleMutation.isPending || deleteMutation.isPending
    } as unknown as UseUsersResult;
};
