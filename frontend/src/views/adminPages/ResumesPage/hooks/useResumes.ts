import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import { toast } from 'react-toastify';

export const useResumes = (params: any) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-resumes', params],
        queryFn: async () => {
            const res = await adminManagementService.getResumes(params);
            return res;
        },
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => adminManagementService.createResume(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
            toast.success('Resume added successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while adding the resume');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: any; data: any }) => adminManagementService.updateResume(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
            toast.success('Resume updated successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while updating the resume');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: any) => adminManagementService.deleteResume(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
            toast.success('Resume deleted successfully');
        },
        onError: (err: any) => {
            toast.error('An error occurred while deleting the resume');
            console.error(err);
        }
    });

    return {
        ...query,
        createResume: createMutation.mutateAsync,
        updateResume: updateMutation.mutateAsync,
        deleteResume: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    } as any;
};
