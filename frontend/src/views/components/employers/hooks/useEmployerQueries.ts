import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import statisticService from '../../../../services/statisticService';
import resumeSavedService from '../../../../services/resumeSavedService';
import resumeService from '../../../../services/resumeService';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import jobService from '../../../../services/jobService';
import errorHandling from '../../../../utils/errorHandling';
import toastMessages from '../../../../utils/toastMessages';

type AnyRecord = Record<string, unknown>;

// ─── Employer Statistics ─────────────────────────────────────
export const useEmployerGeneralStatistics = () => {
  return useQuery({
    queryKey: ['employerGeneralStatistics'],
    queryFn: async () => {
      const response = await statisticService.employerGeneralStatistics();
      return response;
    },
  });
};

export const useEmployerApplicationStatistics = (params: AnyRecord) => {
  return useQuery({
    queryKey: ['employerApplicationStatistics', params],
    queryFn: async () => {
      const response: any = await statisticService.employerApplicationStatistics(params);
      return response;
    },
  });
};

export const useEmployerCandidateStatistics = (params: AnyRecord) => {
  return useQuery({
    queryKey: ['employerCandidateStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerCandidateStatistics(params);
      return response;
    },
  });
};

export const useEmployerRecruitmentStatistics = (params: AnyRecord) => {
  return useQuery({
    queryKey: ['employerRecruitmentStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerRecruitmentStatistics(params);
      return response;
    },
  });
};

export const useEmployerRecruitmentByRank = (params: AnyRecord) => {
  return useQuery({
    queryKey: ['employerRecruitmentByRank', params],
    queryFn: async () => {
      const response = await statisticService.employerRecruitmentStatisticsByRank(params);
      return response;
    },
  });
};

// ─── Saved Resumes ──────────────────────────────────────────
export const useSavedResumes = (params: AnyRecord) => {
  return useQuery({
    queryKey: ['savedResumes', params],
    queryFn: async () => {
      const response = await resumeSavedService.getResumesSaved(params) as any;
      const data = response;
      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data) ? data : [];
      return {
        results,
        count: typeof data?.count === 'number' ? data.count : results.length,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export const useToggleSaveResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => resumeService.saveResume(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedResumes'] });
    },
    onError: (error: any) => errorHandling(error),
  });
};

// ─── Applied Resumes ────────────────────────────────────────
export const useAppliedResumes = (params: AnyRecord) => {
  return useQuery({
    queryKey: ['appliedResumes', params],
    queryFn: async () => {
      const response = await jobPostActivityService.getAppliedResume(params) as any;
      const data = response;
      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data) ? data : [];
      return {
        results,
        count: typeof data?.count === 'number' ? data.count : results.length,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export const useJobPostOptions = () => {
  return useQuery({
    queryKey: ['jobPostOptions'],
    queryFn: async () => {
      const response = await (jobService as any).getJobPostOptions() as any;
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60_000, // options rarely change
  });
};

export const useDeleteJobPostActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobPostActivityService.deleteJobPostActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
    },
    onError: (error: any) => errorHandling(error),
  });
};

// ─── Employer Profile Search ────────────────────────────────
export const useEmployerResumes = (params: AnyRecord) => {
  return useQuery({
    queryKey: ['employerResumes', params],
    queryFn: async () => {
      const response: any = await resumeService.getResumes(params);
      return response;
    },
    placeholderData: keepPreviousData,
  });
};

export const useToggleSaveResumeOptimistic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => resumeService.saveResume(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerResumes'] });
    },
    onError: (error: any) => errorHandling(error),
  });
};
