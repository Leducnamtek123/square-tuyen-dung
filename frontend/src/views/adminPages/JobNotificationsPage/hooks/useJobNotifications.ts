import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Notification } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseJobNotificationsResult = UseQueryResult<PaginatedResponse<Notification>> & {
    createJobNotification: (data: Partial<Notification> | Record<string, unknown>) => Promise<Notification>;
    updateJobNotification: (args: { id: string | number; data: Partial<Notification> | Record<string, unknown> }) => Promise<Notification>;
    deleteJobNotification: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useJobNotifications = (params?: Record<string, unknown>): UseJobNotificationsResult => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-job-notifications', params],
        queryFn: async () => {
            const res = await adminManagementService.getJobNotifications(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Notification> | Record<string, unknown>) => adminManagementService.createJobNotification(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toastMessages.success('Notification created successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while creating the notification');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Notification> | Record<string, unknown> }) => adminManagementService.updateJobNotification(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toastMessages.success('Notification updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the notification');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteJobNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toastMessages.success('Notification deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the notification');
            console.error(err);
        }
    });

    return {
        ...query,
        createJobNotification: createMutation.mutateAsync,
        updateJobNotification: updateMutation.mutateAsync,
        deleteJobNotification: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as UseJobNotificationsResult;
};
