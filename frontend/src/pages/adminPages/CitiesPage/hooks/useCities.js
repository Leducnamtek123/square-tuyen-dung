import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useCities = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-cities', params],
        queryFn: async () => {
            const res = await adminManagementService.getCities(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createCity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toast.success('Thêm tỉnh thành thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm tỉnh thành');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateCity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toast.success('Cập nhật tỉnh thành thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật tỉnh thành');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteCity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
            toast.success('Xóa tỉnh thành thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa tỉnh thành');
            console.error(err);
        }
    });

    return {
        ...query,
        createCity: createMutation.mutateAsync,
        updateCity: updateMutation.mutateAsync,
        deleteCity: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};

