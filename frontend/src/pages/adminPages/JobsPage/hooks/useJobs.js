import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminJobService from '../../../../services/adminJobService';
import { toast } from 'react-toastify';

export const useJobs = (params) => {
    return useQuery({
        queryKey: ['admin-jobs', params],
        queryFn: async () => {
            const res = await adminJobService.getAllJobs(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminJobService.deleteJob(id),
        onSuccess: () => {
            toast.success('Đã xóa tin đăng');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Lỗi khi xóa tin đăng'),
    });
};

export const useApproveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminJobService.approveJob(id),
        onSuccess: () => {
            toast.success('Đã duyệt tin đăng');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Lỗi khi duyệt tin đăng'),
    });
};

export const useRejectJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminJobService.rejectJob(id),
        onSuccess: () => {
            toast.success('Đã từ chối tin đăng');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Lỗi khi từ chối tin đăng'),
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => adminJobService.updateJob(id, data),
        onSuccess: () => {
            toast.success('Cập nhật tin đăng thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        },
        onError: () => toast.error('Lỗi khi cập nhật tin đăng'),
    });
};
