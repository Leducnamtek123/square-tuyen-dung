import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { JobSeekerProfile } from '../../../../types/models';

export const useProfiles = (params?: Record<string, unknown>) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-profiles', params],
        queryFn: async () => {
            const res = await adminManagementService.getProfiles(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<JobSeekerProfile> | Record<string, unknown>) => adminManagementService.createProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toastMessages.success('Candidate profile added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the candidate profile');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<JobSeekerProfile> | Record<string, unknown> }) => adminManagementService.updateProfile(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toastMessages.success('Candidate profile updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the candidate profile');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteProfile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toastMessages.success('Candidate profile deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the candidate profile');
            console.error(err);
        }
    });

    return {
        ...query,
        createProfile: createMutation.mutateAsync,
        updateProfile: updateMutation.mutateAsync,
        deleteProfile: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
