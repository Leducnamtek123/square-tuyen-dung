import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import jobService from '../../../../services/jobService';
import companyFollowed from '../../../../services/companyFollowed';
import companyService from '../../../../services/companyService';
import resumeViewedService from '../../../../services/resumeViewedService';
import statisticService from '../../../../services/statisticService';
import jobSeekerProfileService from '../../../../services/jobSeekerProfileService';
import jobPostNotificationService from '../../../../services/jobPostNotificationService';
import authService from '../../../../services/authService';
import { PaginatedResponse } from '@/types/api';
import { JobPost, Company, Resume } from '../../../../types/models';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';

type AnyRecord = Record<string, unknown>;

// ─── Saved Jobs ─────────────────────────────────────────────
export const useSavedJobs = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['savedJobs', params],
        queryFn: async () => {
            const response = await jobService.getJobPostsSaved(params) as unknown as PaginatedResponse<JobPost>;
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

export const useToggleSaveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (slug: string) => jobService.saveJobPost(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
        },
        onError: (error: unknown) => errorHandling(error as import('axios').AxiosError<{ errors?: import('@/types/api').ApiError }>),
    });
};

// ─── Companies Followed ─────────────────────────────────────
export const useCompaniesFollowed = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['companiesFollowed', params],
        queryFn: async () => {
            const response = await companyFollowed.getCompaniesFollowed(params) as unknown as PaginatedResponse<{ id: number, company: Company; [key: string]: unknown }>;
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

export const useToggleFollowCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (slug: string) => companyService.followCompany(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companiesFollowed'] });
        },
        onError: (error: unknown) => errorHandling(error as import('axios').AxiosError<{ errors?: import('@/types/api').ApiError }>),
    });
};

// ─── Companies Viewed (Resume) ──────────────────────────────
export const useResumeViewed = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['resumeViewed', params],
        queryFn: async () => {
            const response = await resumeViewedService.getResumeViewed(params) as unknown as PaginatedResponse<{ id: number, resume: Resume; [key: string]: unknown }>;
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

// ─── Statistics ─────────────────────────────────────────────
export const useJobSeekerTotalView = () => {
    return useQuery({
        queryKey: ['jobSeekerTotalView'],
        queryFn: async () => {
            const response = await statisticService.jobSeekerTotalView();
            return response;
        },
    });
};

export const useJobSeekerActivityStatistics = () => {
    return useQuery({
        queryKey: ['jobSeekerActivityStatistics'],
        queryFn: async () => {
            const response = await statisticService.jobSeekerActivityStatistics();
            return response;
        },
    });
};

// ─── Job Application (Resumes) ──────────────────────────────
export const useResumes = (jobSeekerProfileId: string | undefined) => {
    return useQuery({
        queryKey: ['resumes', jobSeekerProfileId],
        queryFn: async () => {
            const response = await jobSeekerProfileService.getResumes(jobSeekerProfileId!, {}) as unknown as PaginatedResponse<Record<string, unknown>>;
            return response.results || [];
        },
        enabled: !!jobSeekerProfileId,
    });
};

// ─── Job Post Notifications ─────────────────────────────────
export const useJobPostNotifications = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['jobPostNotifications', params],
        queryFn: async () => {
            const response = await jobPostNotificationService.getJobPostNotifications(params) as unknown as PaginatedResponse<Record<string, unknown>>;
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

export const useJobPostNotificationMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['jobPostNotifications'] });

    const addMutation = useMutation({
        mutationFn: (data: AnyRecord) => jobPostNotificationService.addJobPostNotification(data),
        onSuccess: () => invalidate(),
        onError: (error: unknown) => errorHandling(error as import('axios').AxiosError<{ errors?: import('@/types/api').ApiError }>),
    });

    const updateMutation = useMutation({
        mutationFn: (data: AnyRecord & { id: string | number }) => jobPostNotificationService.updateJobPostNotificationById(data.id, data),
        onSuccess: () => invalidate(),
        onError: (error: unknown) => errorHandling(error as import('axios').AxiosError<{ errors?: import('@/types/api').ApiError }>),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => jobPostNotificationService.deleteJobPostNotificationDetailById(id),
        onSuccess: () => invalidate(),
        onError: (error: unknown) => errorHandling(error as import('axios').AxiosError<{ errors?: import('@/types/api').ApiError }>),
    });

    return { addMutation, updateMutation, deleteMutation };
};

// ─── User Settings ──────────────────────────────────────────
export const useUserSettings = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['userSettings'],
        queryFn: async () => {
            const response = await authService.getUserSettings() as unknown as Record<string, unknown>;
            return response;
        },
        enabled,
    });
};

export const useUpdateUserSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AnyRecord) => authService.updateUserSettings(data),
        onSuccess: (response: unknown) => {
            queryClient.setQueryData(['userSettings'], response);
            toastMessages.success("Settings updated successfully.");
        },
        onError: () => {
            toastMessages.error("Failed to update settings.");
        },
    });
};
