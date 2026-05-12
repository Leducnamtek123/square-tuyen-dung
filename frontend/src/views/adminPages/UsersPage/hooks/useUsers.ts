'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';

import userService from '../../../../services/userService';
import toastMessages from '../../../../utils/toastMessages';
import i18n from '../../../../i18n';
import { User as UserModel } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import { RoleName } from '../../../../types/auth';
import type { AxiosError } from 'axios';
import type { AdminListParams } from '../../../../services/adminManagementService';
import type { TOptions } from 'i18next';

const translateAdmin = (key: string, options?: TOptions) => i18n.t(key, { ns: 'admin', ...options });

type UseUsersResult = UseQueryResult<PaginatedResponse<UserModel>> & {
    toggleUserStatus: (user: UserModel) => Promise<UserModel>;
    bulkDisableUsers: (ids: Array<string | number>) => Promise<{ updated: number; isActive: boolean }>;
    updateUserRole: (args: { userId: string | number; roleName: RoleName }) => Promise<UserModel>;
    deleteUser: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useUsers = (params: AdminListParams): UseUsersResult => {
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
                    ? translateAdmin('pages.users.toast.blockSuccess')
                    : translateAdmin('pages.users.toast.unblockSuccess')
            );
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ errors?: { detail?: string } }>;
            toastMessages.error(
                err.response?.data?.errors?.detail || translateAdmin('pages.users.toast.actionFailed')
            );
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, roleName }: { userId: string | number; roleName: RoleName }) => userService.updateUser(userId, { roleName }),
        onSuccess: () => {
            toastMessages.success(translateAdmin('pages.users.toast.roleUpdated'));
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ errors?: { detail?: string } }>;
            toastMessages.error(
                err.response?.data?.errors?.detail || translateAdmin('pages.users.toast.roleUpdateFailed')
            );
        }
    });

    const bulkDisableMutation = useMutation({
        mutationFn: (ids: Array<string | number>) => userService.bulkStatus(ids, false),
        onSuccess: (result) => {
            toastMessages.success(translateAdmin('pages.users.toast.bulkDisableSuccess', { count: result.updated }));
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ errors?: { detail?: string } }>;
            toastMessages.error(
                err.response?.data?.errors?.detail || translateAdmin('pages.users.toast.actionFailed')
            );
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => userService.deleteUser(id),
        onSuccess: () => {
            toastMessages.success(translateAdmin('pages.users.toast.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ errors?: { detail?: string } }>;
            toastMessages.error(
                err.response?.data?.errors?.detail || translateAdmin('pages.users.toast.actionFailed')
            );
        }
    });

    return {
        ...query,
        toggleUserStatus: toggleStatusMutation.mutateAsync,
        bulkDisableUsers: bulkDisableMutation.mutateAsync,
        updateUserRole: updateRoleMutation.mutateAsync,
        deleteUser: deleteMutation.mutateAsync,
        isMutating: toggleStatusMutation.isPending || updateRoleMutation.isPending || bulkDisableMutation.isPending || deleteMutation.isPending
    } as UseUsersResult;
};


