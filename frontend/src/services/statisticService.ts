import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';

// --- INTERFACES: Job Seeker Statistics ---
export interface JobSeekerGeneralStats {
  totalApply: number;
  totalSave: number;
  totalView: number;
  totalFollow: number;
}

export interface JobSeekerTotalViewStats {
  totalView: number;
}

export interface JobSeekerActivityStats {
  title1: string;
  title2: string;
  title3: string;
  labels: string[];
  data1: number[];
  data2: number[];
  data3: number[];
}

// --- INTERFACES: Employer Statistics ---
export interface EmployerGeneralStats {
  totalJobPost: number;
  totalJobPostingPendingApproval: number;
  totalJobPostExpired: number;
  totalApply: number;
  totalFollowers: number;
  totalSavedProfiles: number;
  totalInterviews: number;
  totalInterviewsCompleted: number;
  totalInterviewsInProgress: number;
  avgAiOverallScore: number;
  avgAiTechnicalScore: number;
  avgAiCommunicationScore: number;
  conversionRate: number;
}

export interface EmployerRecruitmentStatItem {
  label: string;
  data: number[];
}

export interface EmployerCandidateStats {
  title1: string | number;
  title2: string | number;
  labels: string[];
  data1: number[];
  data2: number[];
  borderColor1: string;
  backgroundColor1: string;
  borderColor2: string;
  backgroundColor2: string;
}

export interface EmployerApplicationStats {
  title1: string;
  title2: string;
  labels: string[];
  data1: number[];
  data2: number[];
  backgroundColor1: string;
  backgroundColor2: string;
}

export interface EmployerRecruitmentByRankStats {
  data: number[];
  labels: string[];
  backgroundColor: string[];
}

export interface EmployerInterviewStats {
  labels: string[];
  completedData: number[];
  scheduledData: number[];
  cancelledData: number[];
  inProgressData: number[];
  avgScoreData: number[];
  passedCount: number;
  failedCount: number;
  pendingCount: number;
  avgDurationSeconds: number;
}

// --- INTERFACES: Admin Statistics ---
export interface AdminGeneralStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;
  totalAdmins: number;
  totalJobPosts: number;
  totalJobPostsPending: number;
  totalApplications: number;
}

export type EmployerStatsParams = {
  startDate?: string;
  endDate?: string;
  jobPost?: string | number;
  position?: string | number;
  career?: string | number;
};

const statisticService = {
  employerGeneralStatistics: (): Promise<EmployerGeneralStats> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.get(url, { params: { type: 'general' } });
  },

  employerRecruitmentStatisticsByRank: (data: EmployerStatsParams = {}): Promise<EmployerRecruitmentByRankStats> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, cleanParams(data), { params: { type: 'recruitment-by-rank' } });
  },

  employerApplicationStatistics: (data: EmployerStatsParams = {}): Promise<EmployerApplicationStats> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, cleanParams(data), { params: { type: 'application' } });
  },

  employerCandidateStatistics: (data: EmployerStatsParams = {}): Promise<EmployerCandidateStats> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, cleanParams(data), { params: { type: 'candidate' } });
  },

  employerRecruitmentStatistics: (data: EmployerStatsParams = {}): Promise<EmployerRecruitmentStatItem[]> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, cleanParams(data), { params: { type: 'recruitment' } });
  },

  employerInterviewStatistics: (data: EmployerStatsParams = {}): Promise<EmployerInterviewStats> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, cleanParams(data), { params: { type: 'interview' } });
  },

  jobSeekerGeneralStatistics: (): Promise<JobSeekerGeneralStats> => {
    const url = 'job/web/statistics/job-seeker/';
    return httpRequest.get(url, { params: { type: 'general' } });
  },

  jobSeekerTotalView: (): Promise<JobSeekerTotalViewStats> => {
    const url = 'job/web/statistics/job-seeker/';
    return httpRequest.get(url, { params: { type: 'total-view' } });
  },

  jobSeekerActivityStatistics: (): Promise<JobSeekerActivityStats> => {
    const url = 'job/web/statistics/job-seeker/';
    return httpRequest.get(url, { params: { type: 'activity' } });
  },

  adminGeneralStatistics: (): Promise<AdminGeneralStats> => {
    const url = 'job/web/statistics/admin/';
    return httpRequest.get(url, { params: { type: 'general' } });
  },
};

export default statisticService;


