import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useDistricts = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-districts', params],
        queryFn: async () => {
            const res = await adminManagementService.getDistricts(params);
            return res;
        },
        placeholderData: keepPreviousData,
        enabled: !!(params?.city || !params),
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createDistrict(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toast.success('Thêm quận huyện thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm quận huyện');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateDistrict(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toast.success('Cập nhật quận huyện thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật quận huyện');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteDistrict(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
            toast.success('Xóa quận huyện thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa quận huyện');
            console.error(err);
        }
    });

    return {
        ...query,
        createDistrict: createMutation.mutateAsync,
        updateDistrict: updateMutation.mutateAsync,
        deleteDistrict: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};

