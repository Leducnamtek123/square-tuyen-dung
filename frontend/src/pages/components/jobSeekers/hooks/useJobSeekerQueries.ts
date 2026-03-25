import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import jobService from '../../../../services/jobService';
import companyFollowed from '../../../../services/companyFollowed';
import companyService from '../../../../services/companyService';
import resumeViewedService from '../../../../services/resumeViewedService';
import statisticService from '../../../../services/statisticService';
import jobSeekerProfileService from '../../../../services/jobSeekerProfileService';
import jobPostNotificationService from '../../../../services/jobPostNotificationService';
import authService from '../../../../services/authService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';

type AnyRecord = Record<string, unknown>;

// ─── Saved Jobs ─────────────────────────────────────────────
export const useSavedJobs = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['savedJobs', params],
        queryFn: async () => {
            const response = await jobService.getJobPostsSaved(params) as any;
            return response.data;
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
        onError: (error: any) => errorHandling(error),
    });
};

// ─── Companies Followed ─────────────────────────────────────
export const useCompaniesFollowed = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['companiesFollowed', params],
        queryFn: async () => {
            const response = await companyFollowed.getCompaniesFollowed(params) as any;
            return response.data;
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
        onError: (error: any) => errorHandling(error),
    });
};

// ─── Companies Viewed (Resume) ──────────────────────────────
export const useResumeViewed = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['resumeViewed', params],
        queryFn: async () => {
            const response = await resumeViewedService.getResumeViewed(params) as any;
            return response.data;
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
            return response.data;
        },
    });
};

export const useJobSeekerActivityStatistics = () => {
    return useQuery({
        queryKey: ['jobSeekerActivityStatistics'],
        queryFn: async () => {
            const response = await statisticService.jobSeekerActivityStatistics();
            return response.data;
        },
    });
};

// ─── Job Application (Resumes) ──────────────────────────────
export const useResumes = (jobSeekerProfileId: string | undefined) => {
    return useQuery({
        queryKey: ['resumes', jobSeekerProfileId],
        queryFn: async () => {
            const response = await jobSeekerProfileService.getResumes(jobSeekerProfileId!, {}) as any;
            return Array.isArray(response) ? response : (response?.data || response?.results || []);
        },
        enabled: !!jobSeekerProfileId,
    });
};

// ─── Job Post Notifications ─────────────────────────────────
export const useJobPostNotifications = (params: AnyRecord) => {
    return useQuery({
        queryKey: ['jobPostNotifications', params],
        queryFn: async () => {
            const response = await jobPostNotificationService.getJobPostNotifications(params) as any;
            return response.data;
        },
        placeholderData: keepPreviousData,
    });
};

export const useJobPostNotificationMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['jobPostNotifications'] });

    const addMutation = useMutation({
        mutationFn: (data: any) => jobPostNotificationService.addJobPostNotification(data),
        onSuccess: () => invalidate(),
        onError: (error: any) => errorHandling(error),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => jobPostNotificationService.updateJobPostNotificationById(data.id, data),
        onSuccess: () => invalidate(),
        onError: (error: any) => errorHandling(error),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => jobPostNotificationService.deleteJobPostNotificationDetailById(id),
        onSuccess: () => invalidate(),
        onError: (error: any) => errorHandling(error),
    });

    return { addMutation, updateMutation, deleteMutation };
};

// ─── User Settings ──────────────────────────────────────────
export const useUserSettings = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['userSettings'],
        queryFn: async () => {
            const response = await authService.getUserSettings() as any;
            return response.data;
        },
        enabled,
    });
};

export const useUpdateUserSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => authService.updateUserSettings(data),
        onSuccess: (response: any) => {
            queryClient.setQueryData(['userSettings'], response.data);
            toastMessages.success("Settings updated successfully.");
        },
        onError: () => {
            toastMessages.error("Failed to update settings.");
        },
    });
};
