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
import type { UserSettingsData } from '../../../../types/auth';

// ─── Query Helpers ──────────────────────────────────────────
import type { UseQueryResult } from '@tanstack/react-query';
import type { JobSeekerTotalViewStats } from '../../../../services/statisticService';
import type { GetJobPostsParams } from '../../../../services/jobService';
import type { AxiosError } from 'axios';
import type { JobSeekerActivityStats } from '../../../../services/statisticService';
import type { JobPostNotification } from '../../../../services/jobPostNotificationService';
import type { ResumeViewed } from '../../../../services/resumeViewedService';
import type { CompanyFollowedListParams } from '../../../../services/companyFollowed';
import type { JobSeekerProfileResumeParams } from '../../../../services/jobSeekerProfileService';
import type { JobPostNotificationListParams, JobPostNotificationPayload } from '../../../../services/jobPostNotificationService';
import { useAppSelector } from '@/redux/hooks';
import tokenService from '@/services/tokenService';

const shouldRetryQuery = (failureCount: number, error: Error): boolean => {
    const status = (error as AxiosError | undefined)?.response?.status;
    if (status === 401 || status === 403) return false;
    return failureCount < 1;
};

export type UseSavedJobsResult = UseQueryResult<PaginatedResponse<JobPost>>;
export type UseCompaniesFollowedResult = UseQueryResult<PaginatedResponse<{ id: number, company: Company }>>;
export type UseResumeViewedResult = UseQueryResult<PaginatedResponse<ResumeViewed>>;
export type UseJobSeekerTotalViewResult = UseQueryResult<JobSeekerTotalViewStats>;
export type UseJobSeekerActivityStatsResult = UseQueryResult<JobSeekerActivityStats>;
export type UseResumesResult = UseQueryResult<Resume[]>;
export type UseJobPostNotificationsResult = UseQueryResult<PaginatedResponse<JobPostNotification>>;


// ─── Saved Jobs ─────────────────────────────────────────────
export const useSavedJobs = (params: GetJobPostsParams = {}): UseSavedJobsResult => {
    const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);
    const hasToken = !!tokenService.getAccessTokenFromCookie();
    return useQuery<PaginatedResponse<JobPost>, Error>({
        queryKey: ['savedJobs', params],
        queryFn: async () => {
            const response = await jobService.getJobPostsSaved(params);
            return response;
        },
        enabled: !!isAuthenticated && !!currentUser?.id && hasToken,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
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

    });
};

// ─── Companies Followed ─────────────────────────────────────
export const useCompaniesFollowed = (params: CompanyFollowedListParams = {}): UseCompaniesFollowedResult => {
    return useQuery({
        queryKey: ['companiesFollowed', params],
        queryFn: async () => {
            const response = await companyFollowed.getCompaniesFollowed(params);
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

    });
};

// ─── Companies Viewed (Resume) ──────────────────────────────
export const useResumeViewed = (params: { page?: number; pageSize?: number; ordering?: string } = {}): UseResumeViewedResult => {
    return useQuery({
        queryKey: ['resumeViewed', params],
        queryFn: async () => {
            const response = await resumeViewedService.getResumeViewed(params);
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

// ─── Statistics ─────────────────────────────────────────────
export const useJobSeekerTotalView = (): UseJobSeekerTotalViewResult => {
    return useQuery({
        queryKey: ['jobSeekerTotalView'],
        queryFn: async () => {
            const response = await statisticService.jobSeekerTotalView();
            return response;
        },
    });
};

export const useJobSeekerActivityStatistics = (): UseJobSeekerActivityStatsResult => {
    return useQuery({
        queryKey: ['jobSeekerActivityStatistics'],
        queryFn: async () => {
            const response = await statisticService.jobSeekerActivityStatistics();
            return response;
        },
    });
};

// ─── Job Application (Resumes) ──────────────────────────────
export const useResumes = (jobSeekerProfileId: string | undefined, params: JobSeekerProfileResumeParams = {}): UseResumesResult => {
    const { isAuthenticated } = useAppSelector((state) => state.user);
    const hasToken = !!tokenService.getAccessTokenFromCookie();
    return useQuery<Resume[], Error>({
        queryKey: ['resumes', jobSeekerProfileId, params],
        queryFn: async () => {
            const response = await jobSeekerProfileService.getResumes(jobSeekerProfileId!, params);
            return response?.results || [];
        },
        enabled: !!isAuthenticated && !!jobSeekerProfileId && hasToken,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

// ─── Job Post Notifications ─────────────────────────────────
export const useJobPostNotifications = (params: JobPostNotificationListParams = {}): UseJobPostNotificationsResult => {
    return useQuery({
        queryKey: ['jobPostNotifications', params],
        queryFn: async () => {
            const response = await jobPostNotificationService.getJobPostNotifications(params);
            return response;
        },
        placeholderData: keepPreviousData,
    });
};

export const useJobPostNotificationMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['jobPostNotifications'] });

    const addMutation = useMutation({
        mutationFn: (data: JobPostNotificationPayload) => jobPostNotificationService.addJobPostNotification(data),
        onSuccess: () => invalidate(),

    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<JobPostNotificationPayload> }) => jobPostNotificationService.updateJobPostNotificationById(id, data),
        onSuccess: () => invalidate(),

    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => jobPostNotificationService.deleteJobPostNotificationDetailById(id),
        onSuccess: () => invalidate(),

    });

    return { addMutation, updateMutation, deleteMutation };
};

// ─── User Settings ──────────────────────────────────────────
export const useUserSettings = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['userSettings'],
        queryFn: async () => {
            const response = await authService.getUserSettings();
            return response;
        },
        enabled,
    });
};

export const useUpdateUserSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UserSettingsData) => authService.updateUserSettings(data),
        onSuccess: (response: unknown) => {
            queryClient.setQueryData(['userSettings'], response);
            toastMessages.success("Settings updated successfully.");
        },
        onError: () => {
            toastMessages.error("Failed to update settings.");
        },
    });
};

