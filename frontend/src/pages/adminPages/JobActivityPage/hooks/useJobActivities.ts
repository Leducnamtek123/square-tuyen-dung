// @ts-nocheck
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useJobActivities = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-job-activities', params],
        queryFn: async () => {
            const res = await adminManagementService.getJobActivities(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createJobActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toast.success('Activity added successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while adding the activity');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateJobActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toast.success('Activity updated successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while updating the activity');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteJobActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toast.success('Activity deleted successfully');
        },
        onError: (err) => {
            toast.error('An error occurred while deleting the activity');
            console.error(err);
        }
    });

    return {
        ...query,
        createJobActivity: createMutation.mutateAsync,
        updateJobActivity: updateMutation.mutateAsync,
        deleteJobActivity: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
