import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import userService from '../../../../services/userService';
import toastMessages from '../../../../utils/toastMessages';

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
            toastMessages.success(`User ${user.isActive ? 'blocked' : 'unblocked'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            toastMessages.error(error.response?.data?.errors?.detail || 'Operation failed');
        }
    });
};
