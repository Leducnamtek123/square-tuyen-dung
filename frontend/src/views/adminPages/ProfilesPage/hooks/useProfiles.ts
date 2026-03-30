import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { JobSeekerProfile } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseProfilesResult = UseQueryResult<PaginatedResponse<JobSeekerProfile>> & {
    createProfile: (data: Partial<JobSeekerProfile> | Record<string, unknown>) => Promise<JobSeekerProfile>;
    updateProfile: (args: { id: string | number; data: Partial<JobSeekerProfile> | Record<string, unknown> }) => Promise<JobSeekerProfile>;
    deleteProfile: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useProfiles = (params?: Record<string, unknown>): UseProfilesResult => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<JobSeekerProfile>>({
        queryKey: ['admin-profiles', params],
        queryFn: async () => {
            const res = await adminManagementService.getProfiles(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation<JobSeekerProfile, Error, Partial<JobSeekerProfile> | Record<string, unknown>>({
        mutationFn: (data) => adminManagementService.createProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toastMessages.success('Candidate profile added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the candidate profile');
            console.error(err);
        }
    });

    const updateMutation = useMutation<JobSeekerProfile, Error, { id: string | number; data: Partial<JobSeekerProfile> | Record<string, unknown> }>({
        mutationFn: ({ id, data }) => adminManagementService.updateProfile(id, data),
        onSuccess: () => {
            toastMessages.success('Profile updated');
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
        },
        onError: () => toastMessages.error('Error updating profile'),
    });

    const deleteMutation = useMutation<void, Error, string | number>({
        mutationFn: (id: string | number) => adminManagementService.deleteProfile(id),
        onSuccess: () => {
            toastMessages.success('Profile deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
        },
        onError: () => toastMessages.error('Error deleting profile'),
    });

    return {
        ...query,
        createProfile: createMutation.mutateAsync,
        updateProfile: updateMutation.mutateAsync,
        deleteProfile: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    } as UseProfilesResult;
};
