import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useJobNotifications = (params) => {
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
        mutationFn: (data) => adminManagementService.createJobNotification(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toast.success('Thêm thông báo thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm thông báo');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateJobNotification(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toast.success('Cập nhật thông báo thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật thông báo');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteJobNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-notifications'] });
            toast.success('Xóa thông báo thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa thông báo');
            console.error(err);
        }
    });

    return {
        ...query,
        createJobNotification: createMutation.mutateAsync,
        updateJobNotification: updateMutation.mutateAsync,
        deleteJobNotification: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};

