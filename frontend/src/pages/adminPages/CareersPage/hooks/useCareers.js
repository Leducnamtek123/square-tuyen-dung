import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useCareers = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-careers', params],
        queryFn: async () => {
            const res = await adminManagementService.getCareers(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createCareer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toast.success('Thêm ngành nghề thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm ngành nghề');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateCareer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toast.success('Cập nhật ngành nghề thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật ngành nghề');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteCareer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
            toast.success('Xóa ngành nghề thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa ngành nghề');
            console.error(err);
        }
    });

    return {
        ...query,
        createCareer: createMutation.mutateAsync,
        updateCareer: updateMutation.mutateAsync,
        deleteCareer: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};

