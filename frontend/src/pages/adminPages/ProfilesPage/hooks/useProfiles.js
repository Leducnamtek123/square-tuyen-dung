import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useProfiles = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-profiles', params],
        queryFn: async () => {
            const res = await adminManagementService.getProfiles(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toast.success('Thêm hồ sơ ứng viên thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm hồ sơ ứng viên');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateProfile(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toast.success('Cập nhật hồ sơ ứng viên thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật hồ sơ ứng viên');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteProfile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            toast.success('Xóa hồ sơ ứng viên thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa hồ sơ ứng viên');
            console.error(err);
        }
    });

    return {
        ...query,
        createProfile: createMutation.mutateAsync,
        updateProfile: updateMutation.mutateAsync,
        deleteProfile: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};

