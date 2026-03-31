import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import statisticService from '../../../../services/statisticService';
import resumeSavedService from '../../../../services/resumeSavedService';
import resumeService from '../../../../services/resumeService';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import jobService from '../../../../services/jobService';
import interviewService from '../../../../services/interviewService';
import questionService from '../../../../services/questionService';
import questionGroupService from '../../../../services/questionGroupService';
import companyService from '../../../../services/companyService';
import companyImageService from '../../../../services/companyImageService';
import errorHandling from '../../../../utils/errorHandling';
import { PaginatedResponse } from '@/types/api';
import { JobPost, JobPostActivity, Resume, ResumeSaved, InterviewSession, Question, QuestionGroup } from '@/types/models';

// ─── Types ───────────────────────────────────────────────────
export type UseEmployerGeneralStatsResult = UseQueryResult<any>; // Define more specific type if available in statisticService
export type UseSavedResumesResult = UseQueryResult<PaginatedResponse<ResumeSaved>>;
export type UseAppliedResumesResult = UseQueryResult<PaginatedResponse<JobPostActivity>>;
export type UseEmployerResumesResult = UseQueryResult<PaginatedResponse<Resume>>;
export type UseEmployerJobPostsResult = UseQueryResult<PaginatedResponse<JobPost>>;
export type UseInterviewSessionsResult = UseQueryResult<PaginatedResponse<InterviewSession>>;
export type UseInterviewDetailResult = UseQueryResult<InterviewSession>;
export type UseEmployerQuestionsResult = UseQueryResult<PaginatedResponse<Question>>;
export type UseQuestionGroupsResult = UseQueryResult<PaginatedResponse<QuestionGroup>>;

export interface JobPostOption {
  id: string | number;
  jobName: string;
  [key: string]: unknown;
}

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

export const useEmployerApplicationStatistics = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['employerApplicationStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerApplicationStatistics(params);
      return response;
    },
  });
};

export const useEmployerCandidateStatistics = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['employerCandidateStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerCandidateStatistics(params);
      return response;
    },
  });
};

export const useEmployerRecruitmentStatistics = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['employerRecruitmentStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerRecruitmentStatistics(params);
      return response;
    },
  });
};

export const useEmployerRecruitmentByRank = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['employerRecruitmentByRank', params],
    queryFn: async () => {
      const response = await statisticService.employerRecruitmentStatisticsByRank(params);
      return response;
    },
  });
};

// ─── Job Posts ──────────────────────────────────────────────
export const useEmployerJobPosts = (params: Record<string, unknown>): UseEmployerJobPostsResult => {
  return useQuery({
    queryKey: ['employerJobPosts', params],
    queryFn: async () => {
      const res = await jobService.getEmployerJobPost(params);
      return res;
    },
    placeholderData: keepPreviousData,
  });
};

export const useJobPostMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data: any) => jobService.addJobPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobPosts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => jobService.updateJobPostById(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobPosts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => jobService.deleteJobPostById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobPosts'] });
    },
  });

  return {
    addJobPost: addMutation.mutateAsync,
    updateJobPost: updateMutation.mutateAsync,
    deleteJobPost: deleteMutation.mutateAsync,
    isMutating: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};

// ─── Saved Resumes ──────────────────────────────────────────
export const useSavedResumes = (params: Record<string, unknown>): UseSavedResumesResult => {
  return useQuery({
    queryKey: ['savedResumes', params],
    queryFn: async () => {
      const res = await resumeSavedService.getResumesSaved(params);
      return res as PaginatedResponse<ResumeSaved>;
    },
    placeholderData: keepPreviousData,
  });
};

export const useToggleSaveResume = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (slug: string) => resumeService.saveResume(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedResumes'] });
    },
    onError: (error: any) => errorHandling(error),
  });

  return {
    ...mutation,
    toggleSaveResume: mutation.mutateAsync,
    isMutating: mutation.isPending
  };
};

// ─── Applied Resumes ────────────────────────────────────────
export const useAppliedResumes = (params: Record<string, unknown>, enabled: boolean = true): UseAppliedResumesResult => {
  return useQuery({
    queryKey: ['appliedResumes', params],
    queryFn: async () => {
      const res = await jobPostActivityService.getAppliedResume(params);
      return res as PaginatedResponse<JobPostActivity>;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useJobPostOptions = () => {
  return useQuery({
    queryKey: ['jobPostOptions'],
    queryFn: async (): Promise<JobPostOption[]> => {
       // Casting to any because jobService might not have explicit type for getJobPostOptions in current context
      const response = await (jobService as any).getJobPostOptions();
      return (response as JobPostOption[]) || [];
    },
    staleTime: 5 * 60_000,
  });
};

export const useDeleteJobPostActivity = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string | number) => jobPostActivityService.deleteJobPostActivity(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
    },
    onError: (error: Error | unknown) => errorHandling(error as AxiosError<Record<string, unknown>>),
  });

  return {
    ...mutation,
    deleteJobPostActivity: mutation.mutateAsync,
    isMutating: mutation.isPending
  };
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string | number }) =>
      jobPostActivityService.changeApplicationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
    },
    onError: (error: any) => errorHandling(error),
  });

  return {
    ...mutation,
    updateStatus: mutation.mutateAsync,
    isMutating: mutation.isPending
  };
};

// ─── Employer Profile Search ────────────────────────────────
export const useEmployerResumes = (params: Record<string, unknown>): UseEmployerResumesResult => {
  return useQuery({
    queryKey: ['employerResumes', params],
    queryFn: async () => {
      const res = await resumeService.getResumes(params);
      return res as PaginatedResponse<Resume>;
    },
    placeholderData: keepPreviousData,
  });
};

export const useToggleSaveResumeOptimistic = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (slug: string) => resumeService.saveResume(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerResumes'] });
    },
    onError: (error: any) => errorHandling(error),
  });

  return {
    ...mutation,
    toggleSaveResume: mutation.mutateAsync,
    isMutating: mutation.isPending
  };
};

export const useResumeDetail = (slug: string) => {
  return useQuery({
    queryKey: ['resumeDetail', slug],
    queryFn: () => resumeService.getResumeDetail(slug),
    enabled: !!slug,
  });
};

// ─── Interview Management ────────────────────────────────────
export const useInterviewSessions = (params: any, refetchInterval?: number | false): UseInterviewSessionsResult => {
  return useQuery({
    queryKey: ['interviewSessions', params],
    queryFn: () => interviewService.getSessions(params),
    placeholderData: keepPreviousData,
    refetchInterval,
  });
};

export const useInterviewDetail = (id: string | number): UseInterviewDetailResult => {
  return useQuery({
    queryKey: ['interviewDetail', id],
    queryFn: () => interviewService.getSessionDetail(id),
    enabled: !!id,
  });
};

export const useInterviewMutations = () => {
  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: (data: any) => interviewService.scheduleSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => interviewService.updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
      queryClient.invalidateQueries({ queryKey: ['interviewDetail'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => interviewService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ roomName, status }: { roomName: any; status: string }) => interviewService.updateSessionStatus(roomName, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
      queryClient.invalidateQueries({ queryKey: ['interviewDetail'] });
    },
  });

  const evaluationMutation = useMutation({
    mutationFn: (data: any) => interviewService.submitEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewDetail'] });
    },
    onError: (error: any) => errorHandling(error),
  });

  return {
    scheduleSession: scheduleMutation.mutateAsync,
    updateSession: updateMutation.mutateAsync,
    deleteSession: deleteMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    submitEvaluation: evaluationMutation.mutateAsync,
    isMutating: scheduleMutation.isPending || updateMutation.isPending || deleteMutation.isPending || statusMutation.isPending || evaluationMutation.isPending,
  };
};

// ─── Questions & Groups ──────────────────────────────────────
export const useEmployerQuestions = (params: any): UseEmployerQuestionsResult => {
  return useQuery({
    queryKey: ['employerQuestions', params],
    queryFn: () => questionService.getQuestions(params),
    placeholderData: keepPreviousData,
  });
};

export const useQuestionGroups = (params: any): UseQuestionGroupsResult => {
  return useQuery({
    queryKey: ['questionGroups', params],
    queryFn: () => questionGroupService.getQuestionGroups(params),
    placeholderData: keepPreviousData,
  });
};

export const useQuestionMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => questionService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerQuestions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => questionService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerQuestions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => questionService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerQuestions'] });
    },
  });

  return {
    createQuestion: createMutation.mutateAsync,
    updateQuestion: updateMutation.mutateAsync,
    deleteQuestion: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};

export const useQuestionGroupMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => questionGroupService.createQuestionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionGroups'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => questionGroupService.updateQuestionGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionGroups'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => questionGroupService.deleteQuestionGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionGroups'] });
    },
  });

  return {
    createQuestionGroup: createMutation.mutateAsync,
    updateQuestionGroup: updateMutation.mutateAsync,
    deleteQuestionGroup: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};

// ─── Company Profile ─────────────────────────────────────────
export const useCompanyProfile = () => {
  return useQuery({
    queryKey: ['companyProfile'],
    queryFn: () => companyService.getCompany(),
  });
};

export const useCompanyMutations = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => companyService.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
    },
  });

  const logoMutation = useMutation({
    mutationFn: (data: FormData) => companyService.updateCompanyImageUrl(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
    },
  });

  const coverMutation = useMutation({
    mutationFn: (data: FormData) => companyService.updateCompanyCoverImageUrl(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
    },
  });

  return {
    updateCompany: updateMutation.mutateAsync,
    updateLogo: logoMutation.mutateAsync,
    updateCover: coverMutation.mutateAsync,
    isMutating: updateMutation.isPending || logoMutation.isPending || coverMutation.isPending,
  };
};

export const useCompanyImages = () => {
  return useQuery({
    queryKey: ['companyImages'],
    queryFn: () => companyImageService.getCompanyImages(),
  });
};

export const useCompanyImageMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data: FormData) => companyImageService.addCompanyImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyImages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => companyImageService.deleteCompanyImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyImages'] });
    },
  });

  return {
    addCompanyImages: addMutation.mutateAsync,
    deleteCompanyImage: deleteMutation.mutateAsync,
    isMutating: addMutation.isPending || deleteMutation.isPending,
  };
};
