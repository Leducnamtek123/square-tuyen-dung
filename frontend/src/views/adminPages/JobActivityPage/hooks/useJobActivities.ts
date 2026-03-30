import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { JobPostActivity } from '../../../../types/models';

export const useJobActivities = (params?: Record<string, unknown>) => {
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
        mutationFn: (data: Partial<JobPostActivity> | Record<string, unknown>) => adminManagementService.createJobActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toastMessages.success('Activity added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the activity');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<JobPostActivity> | Record<string, unknown> }) => adminManagementService.updateJobActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toastMessages.success('Activity updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the activity');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteJobActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toastMessages.success('Activity deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the activity');
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
