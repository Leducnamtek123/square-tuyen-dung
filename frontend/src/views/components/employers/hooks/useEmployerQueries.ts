import { useQuery, useMutation, useQueryClient, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
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
import { PaginatedResponse } from '@/types/api';
import { JobPost, JobPostActivity, Resume, ResumeSaved, InterviewSession, Question, QuestionGroup, CompanyImage } from '@/types/models';
import type { ScheduleSessionInput } from '../../../../services/interviewService';
import type { EmployerCandidateStats } from '../../../../services/statisticService';
import type { JobPostInput } from '../../../../services/jobService';
import type { GetJobPostsParams } from '../../../../services/jobService';
import type { GetSessionsParams } from '../../../../services/interviewService';
import type { EmployerRecruitmentStatItem } from '../../../../services/statisticService';
import type { EmployerApplicationStats } from '../../../../services/statisticService';
import type { EmployerGeneralStats } from '../../../../services/statisticService';
import type { SubmitEvaluationInput } from '../../../../services/interviewService';
import type { EmployerRecruitmentByRankStats } from '../../../../services/statisticService';
import type { EmployerInterviewStats } from '../../../../services/statisticService';
import type { EmployerStatsParams } from '../../../../services/statisticService';
import type { QuestionPayload, QuestionListParams } from '../../../../services/questionService';
import type { QuestionGroupPayload, QuestionGroupListParams } from '../../../../services/questionGroupService';
import type { ResumeSavedListParams } from '../../../../services/resumeSavedService';
import type { JobPostActivityListParams } from '../../../../services/jobPostActivityService';
import type { GetResumesParams } from '../../../../services/resumeService';

// ─── Types ───────────────────────────────────────────────────
export type UseEmployerGeneralStatsResult = UseQueryResult<EmployerGeneralStats>;
export type UseEmployerApplicationStatsResult = UseQueryResult<EmployerApplicationStats>;
export type UseEmployerCandidateStatsResult = UseQueryResult<EmployerCandidateStats>;
export type UseEmployerRecruitmentStatsResult = UseQueryResult<EmployerRecruitmentStatItem[]>;
export type UseEmployerRecruitmentByRankStatsResult = UseQueryResult<EmployerRecruitmentByRankStats>;
export type UseEmployerInterviewStatsResult = UseQueryResult<EmployerInterviewStats>;
export type UseSavedResumesResult = UseQueryResult<PaginatedResponse<ResumeSaved>>;
export type UseAppliedResumesResult = UseQueryResult<PaginatedResponse<JobPostActivity>>;
export type UseEmployerResumesResult = UseQueryResult<PaginatedResponse<Resume>>;
export type UseEmployerJobPostsResult = UseQueryResult<PaginatedResponse<JobPost>>;
export type UseInterviewSessionsResult = UseQueryResult<PaginatedResponse<InterviewSession>>;
export type UseInterviewDetailResult = UseQueryResult<InterviewSession>;
export type UseEmployerQuestionsResult = UseQueryResult<PaginatedResponse<Question>>;
export type UseQuestionGroupsResult = UseQueryResult<PaginatedResponse<QuestionGroup>>;

export type JobPostOption = {
  id: string | number;
  jobName: string;
};

// ─── Employer Statistics ─────────────────────────────────────
export const useEmployerGeneralStatistics = (): UseEmployerGeneralStatsResult => {
  return useQuery({
    queryKey: ['employerGeneralStatistics'],
    queryFn: async () => {
      const response = await statisticService.employerGeneralStatistics();
      return response;
    },
  });
};

export const useEmployerApplicationStatistics = (params: EmployerStatsParams = {}): UseEmployerApplicationStatsResult => {
  return useQuery({
    queryKey: ['employerApplicationStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerApplicationStatistics(params);
      return response;
    },
  });
};

export const useEmployerCandidateStatistics = (params: EmployerStatsParams = {}): UseEmployerCandidateStatsResult => {
  return useQuery({
    queryKey: ['employerCandidateStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerCandidateStatistics(params);
      return response;
    },
  });
};

export const useEmployerRecruitmentStatistics = (params: EmployerStatsParams = {}): UseEmployerRecruitmentStatsResult => {
  return useQuery({
    queryKey: ['employerRecruitmentStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerRecruitmentStatistics(params);
      return response;
    },
  });
};

export const useEmployerRecruitmentByRank = (params: EmployerStatsParams = {}): UseEmployerRecruitmentByRankStatsResult => {
  return useQuery({
    queryKey: ['employerRecruitmentByRank', params],
    queryFn: async () => {
      const response = await statisticService.employerRecruitmentStatisticsByRank(params);
      return response;
    },
  });
};

export const useEmployerInterviewStatistics = (params: EmployerStatsParams = {}): UseEmployerInterviewStatsResult => {
  return useQuery({
    queryKey: ['employerInterviewStatistics', params],
    queryFn: async () => {
      const response = await statisticService.employerInterviewStatistics(params);
      return response;
    },
  });
};

// ─── Job Posts ──────────────────────────────────────────────
export const useEmployerJobPosts = (params: GetJobPostsParams = {}): UseEmployerJobPostsResult => {
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
    mutationFn: (data: JobPostInput) => jobService.addJobPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobPosts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<JobPostInput> }) => jobService.updateJobPostById(id, data),
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
export const useSavedResumes = (params: ResumeSavedListParams): UseSavedResumesResult => {
  return useQuery({
    queryKey: ['savedResumes', params],
    queryFn: async () => {
      const res = await resumeSavedService.getResumesSaved(params);
      return res;
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
  });

  return {
    ...mutation,
    toggleSaveResume: mutation.mutateAsync,
    isMutating: mutation.isPending
  };
};

// ─── Applied Resumes ────────────────────────────────────────
export const useAppliedResumes = (params: JobPostActivityListParams, enabled: boolean = true): UseAppliedResumesResult => {
  return useQuery({
    queryKey: ['appliedResumes', params],
    queryFn: async () => {
      const res = await jobPostActivityService.getAppliedResume(params);
      return res;
    },
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: (query) => {
      const data = query.state.data as PaginatedResponse<JobPostActivity> | undefined;
      const hasProcessing = Array.isArray(data?.results)
        && data.results.some((item) => item.aiAnalysisStatus === 'processing');
      return hasProcessing ? 5000 : false;
    },
  });
};

export const useJobPostOptions = () => {
  return useQuery({
    queryKey: ['jobPostOptions'],
    queryFn: async (): Promise<JobPostOption[]> => {
      const response = await jobService.getJobPostOptions();
      const statusOptions = response.statusOptions || [];
      return statusOptions as typeof statusOptions & JobPostOption[];
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
  });

  return {
    ...mutation,
    updateStatus: mutation.mutateAsync,
    isMutating: mutation.isPending
  };
};

// ─── Employer Profile Search ────────────────────────────────
export const useEmployerResumes = (params: GetResumesParams): UseEmployerResumesResult => {
  return useQuery({
    queryKey: ['employerResumes', params],
    queryFn: async () => {
      const res = await resumeService.getResumes(params);
      return res;
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
export const useInterviewSessions = (params: GetSessionsParams = {}, refetchInterval?: number | false): UseInterviewSessionsResult => {
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
    refetchInterval: (query) => {
      const data = query.state.data as InterviewSession | undefined;
      const hasRecording = Boolean(data?.recordingUrl || data?.recording_url);

      if (data?.status === 'completed' && !hasRecording) {
        return 5000;
      }

      return false;
    },
  });
};

export const useInterviewMutations = () => {
  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: (data: ScheduleSessionInput) => interviewService.scheduleSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ScheduleSessionInput> }) => interviewService.updateSession(id, data),
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
    mutationFn: ({ roomName, status }: { roomName: string | number; status: string }) => interviewService.updateSessionStatus(roomName, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
      queryClient.invalidateQueries({ queryKey: ['interviewDetail'] });
    },
  });

  const evaluationMutation = useMutation({
    mutationFn: (data: SubmitEvaluationInput) => interviewService.submitEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewDetail'] });
    },
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
export const useEmployerQuestions = (params: QuestionListParams = {}): UseEmployerQuestionsResult => {
  return useQuery({
    queryKey: ['employerQuestions', params],
    queryFn: () => questionService.getQuestions(params),
    placeholderData: keepPreviousData,
  });
};

export const useQuestionGroups = (params: QuestionGroupListParams = {}): UseQuestionGroupsResult => {
  return useQuery({
    queryKey: ['questionGroups', params],
    queryFn: () => questionGroupService.getQuestionGroups(params),
    placeholderData: keepPreviousData,
  });
};

export const useQuestionMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: QuestionPayload) => questionService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerQuestions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<QuestionPayload> }) => questionService.updateQuestion(id, data),
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
    mutationFn: (data: QuestionGroupPayload) => questionGroupService.createQuestionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionGroups'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<QuestionGroupPayload> }) => questionGroupService.updateQuestionGroup(id, data),
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
    mutationFn: ({ id, data }: { id: string | number; data: Parameters<typeof companyService.updateCompany>[1] }) => companyService.updateCompany(id, data),
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
  return useQuery<PaginatedResponse<CompanyImage>>({
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

