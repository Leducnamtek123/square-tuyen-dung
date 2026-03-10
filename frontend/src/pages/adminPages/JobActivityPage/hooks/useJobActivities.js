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
            toast.success('Thêm hoạt động thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm hoạt động');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateJobActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toast.success('Cập nhật hoạt động thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật hoạt động');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteJobActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-job-activities'] });
            toast.success('Xóa hoạt động thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa hoạt động');
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

