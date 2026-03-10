import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminInterviewService from '../../../../services/adminInterviewService';
import { message } from 'antd';

export const useInterviews = (params) => {
    return useQuery({
        queryKey: ['admin-interviews', params],
        queryFn: async () => {
            const res = await adminInterviewService.getAllInterviews(params);
            return res;
        },
        placeholderData: (previousData) => previousData,
        refetchInterval: (query) => {
            const interviews = query.state.data?.results || [];
            const hasActiveInterview = interviews.some((item) => ['in_progress', 'calibration', 'processing'].includes(item.status));
            return hasActiveInterview ? 5000 : false;
        },
    });
};

export const useScheduleInterview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => adminInterviewService.scheduleInterview(data),
        onSuccess: () => {
            message.success('Lên lịch phỏng vấn thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error) => {
            message.error(error.response?.data?.errors?.detail || 'Lên lịch phỏng vấn thất bại');
        },
    });
};

export const useUpdateInterviewStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => adminInterviewService.updateInterviewStatus(id, status),
        onSuccess: () => {
            message.success('Cập nhật trạng thái thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error) => {
            message.error(error.response?.data?.errors?.detail || 'Cập nhật thất bại');
        },
    });
};

export const useDeleteInterview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => adminInterviewService.deleteInterview(id),
        onSuccess: () => {
            message.success('Xóa phỏng vấn thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
        },
        onError: (error) => {
            message.error(error.response?.data?.errors?.detail || 'Xóa thất bại');
        },
    });
};

