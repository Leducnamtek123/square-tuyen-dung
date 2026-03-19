import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useJobNotifications = (params: any) => {
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
        mutationFn: (data: any) => adminManagementService.createJobNotification(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toast.success('Notification created successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while creating the notification');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: any; data: any }) => adminManagementService.updateJobNotification(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toast.success('Notification updated successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while updating the notification');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: any) => adminManagementService.deleteJobNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toast.success('Notification deleted successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while deleting the notification');
            console.error(err);
        }
    });

    return {
        ...query,
        createJobNotification: createMutation.mutateAsync,
        updateJobNotification: updateMutation.mutateAsync,
        deleteJobNotification: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as any;
};
