import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { JobPostActivity } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import type { AdminListParams, JobPostActivityPayload } from '../../../../services/adminManagementService';

type UseJobActivitiesResult = UseQueryResult<PaginatedResponse<JobPostActivity>> & {
    updateJobActivity: (args: { id: string | number; data: JobPostActivityPayload }) => Promise<JobPostActivity>;
    deleteJobActivity: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useJobActivities = (params: AdminListParams): UseJobActivitiesResult => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-job-activities', params],
        queryFn: async () => {
            const res = await adminManagementService.getJobActivities(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: JobPostActivityPayload }) => adminManagementService.updateJobActivity(id, data),
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
        updateJobActivity: updateMutation.mutateAsync,
        deleteJobActivity: deleteMutation.mutateAsync,
        isMutating: updateMutation.isPending || deleteMutation.isPending
    };
};
