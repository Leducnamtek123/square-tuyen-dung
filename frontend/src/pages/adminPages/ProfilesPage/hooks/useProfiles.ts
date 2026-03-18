// @ts-nocheck
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useProfiles = (params) => {
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
        mutationFn: (data) => adminManagementService.createProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toast.success('Candidate profile added successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while adding the candidate profile');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateProfile(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toast.success('Candidate profile updated successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while updating the candidate profile');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteProfile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toast.success('Candidate profile deleted successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while deleting the candidate profile');
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
