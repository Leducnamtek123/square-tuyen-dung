import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import userService from '../../../../services/userService';
import { message } from 'antd';

export const useUsers = (params) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await userService.getAllUsers(params);
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

export const useToggleUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user) => userService.toggleUserStatus(user.id),
        onSuccess: (data, user) => {
            message.success(`${user.isActive ? 'Khóa' : 'Mở khóa'} người dùng thành công`);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            message.error(error.response?.data?.errors?.detail || "Thao tác thất bại");
        }
    });
};

