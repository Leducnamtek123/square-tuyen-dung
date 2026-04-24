'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import adminManagementService from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import { Resume } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';
import type { AdminListParams, ResumePayload } from '../../../../services/adminManagementService';

type UseResumesResult = UseQueryResult<PaginatedResponse<Resume>> & {
    createResume: (data: ResumePayload) => Promise<Resume>;
    updateResume: (args: { id: string | number; data: ResumePayload }) => Promise<Resume>;
    deleteResume: (id: string | number) => Promise<void>;
    isMutating: boolean;
};

export const useResumes = (params?: AdminListParams): UseResumesResult => {
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
        mutationFn: (data: ResumePayload) => adminManagementService.createResume(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
            toastMessages.success('Resume added successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while adding the resume');
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: ResumePayload }) => adminManagementService.updateResume(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
            toastMessages.success('Resume updated successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while updating the resume');
            console.error(err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => adminManagementService.deleteResume(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
            toastMessages.success('Resume deleted successfully');
        },
        onError: (err: Error | unknown) => {
            toastMessages.error('An error occurred while deleting the resume');
            console.error(err);
        }
    });

    return {
        ...query,
        createResume: createMutation.mutateAsync,
        updateResume: updateMutation.mutateAsync,
        deleteResume: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
};
