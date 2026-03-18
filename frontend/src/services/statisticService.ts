import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const statisticService = {
  employerGeneralStatistics: (): Promise<any> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.get(url, { params: { type: 'general' } });
  },

  employerRecruitmentStatisticsByRank: (data: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, data, { params: { type: 'recruitment-by-rank' } });
  },

  employerApplicationStatistics: (data: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, data, { params: { type: 'application' } });
  },

  employerCandidateStatistics: (data: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, data, { params: { type: 'candidate' } });
  },

  employerRecruitmentStatistics: (data: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/statistics/employer/';
    return httpRequest.post(url, data, { params: { type: 'recruitment' } });
  },

  jobSeekerGeneralStatistics: (): Promise<any> => {
    const url = 'job/web/statistics/job-seeker/';
    return httpRequest.get(url, { params: { type: 'general' } });
  },

  jobSeekerTotalView: (): Promise<any> => {
    const url = 'job/web/statistics/job-seeker/';
    return httpRequest.get(url, { params: { type: 'total-view' } });
  },

  jobSeekerActivityStatistics: (): Promise<any> => {
    const url = 'job/web/statistics/job-seeker/';
    return httpRequest.get(url, { params: { type: 'activity' } });
  },

  adminGeneralStatistics: (): Promise<any> => {
    const url = 'job/web/statistics/admin/';
    return httpRequest.get(url, { params: { type: 'general' } });
  },
};

export default statisticService;
