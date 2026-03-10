import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useCompanies = (params) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-companies', params],
        queryFn: async () => {
            const res = await adminManagementService.getCompanies(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminManagementService.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toast.success('Thêm công ty thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi thêm công ty');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminManagementService.updateCompany(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toast.success('Cập nhật công ty thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi cập nhật công ty');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminManagementService.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            toast.success('Xóa công ty thành công');
        },
        onError: (err) => {
            toast.error('Có lỗi xảy ra khi xóa công ty');
            console.error(err);
        }
    });

    return {
        ...query,
        createCompany: createMutation.mutateAsync,
        updateCompany: updateMutation.mutateAsync,
        deleteCompany: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};

