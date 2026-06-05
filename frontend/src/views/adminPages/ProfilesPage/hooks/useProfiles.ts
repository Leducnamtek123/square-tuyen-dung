'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { JobSeekerProfile } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import type { AdminListParams, JobSeekerProfilePayload } from '../../../../services/adminManagementService';
import i18next from 'i18next';

type UseProfilesResult = UseQueryResult<PaginatedResponse<JobSeekerProfile>> & {
    createProfile: (data: JobSeekerProfilePayload) => Promise<JobSeekerProfile>;
    updateProfile: (args: { id: string | number; data: JobSeekerProfilePayload }) => Promise<JobSeekerProfile>;
    deleteProfile: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useProfiles = (params?: AdminListParams): UseProfilesResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<JobSeekerProfile>>({
        queryKey: ['admin-profiles', params],
        queryFn: async () => {
            const res = await adminManagementService.getProfiles(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation<JobSeekerProfile, Error, JobSeekerProfilePayload>({
        mutationFn: (data) => adminManagementService.createProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toastMessages.success(i18next.t('admin:pages.profiles.toast.addSuccess'));
        },
        onError: (err: Error | unknown) => {
            toastMessages.error(i18next.t('admin:pages.profiles.toast.addError'));
            console.error(err);
        }
    });

    const updateMutation = useMutation<JobSeekerProfile, Error, { id: string | number; data: JobSeekerProfilePayload }>({
        mutationFn: ({ id, data }) => adminManagementService.updateProfile(id, data),
        onSuccess: () => {
            toastMessages.success(i18next.t('admin:pages.profiles.toast.updateSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
        },
        onError: () => toastMessages.error(i18next.t('admin:pages.profiles.toast.updateError')),
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: (id: string | number) => adminManagementService.deleteProfile(id),
        onSuccess: () => {
            toastMessages.success(i18next.t('admin:pages.profiles.toast.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
        },
        onError: () => toastMessages.error(i18next.t('admin:pages.profiles.toast.deleteError')),
    });

    return {
        ...query,
        createProfile: createMutation.mutateAsync,
        updateProfile: updateMutation.mutateAsync,
        deleteProfile: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
};
