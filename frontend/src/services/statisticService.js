import httpRequest from '../utils/httpRequest';

const statisticService = {

  employerGeneralStatistics: () => {

    const url = 'job/web/statistics/employer/';

    return httpRequest.get(url, { params: { type: 'general' } });

  },

  employerRecruitmentStatisticsByRank: (data = {}) => {

    const url = 'job/web/statistics/employer/';

    return httpRequest.post(url, data, { params: { type: 'recruitment-by-rank' } });

  },

  employerApplicationStatistics: (data = {}) => {

    const url = 'job/web/statistics/employer/';

    return httpRequest.post(url, data, { params: { type: 'application' } });

  },

  employerCandidateStatistics: (data = {}) => {

    const url = 'job/web/statistics/employer/';

    return httpRequest.post(url, data, { params: { type: 'candidate' } });

  },

  employerRecruitmentStatistics: (data = {}) => {

    const url = 'job/web/statistics/employer/';

    return httpRequest.post(url, data, { params: { type: 'recruitment' } });

  },

  jobSeekerGeneralStatistics: () => {

    const url = 'job/web/statistics/job-seeker/';

    return httpRequest.get(url, { params: { type: 'general' } });

  },

  jobSeekerTotalView: () => {

    const url = 'job/web/statistics/job-seeker/';

    return httpRequest.get(url, { params: { type: 'total-view' } });

  },

  jobSeekerActivityStatistics: () => {

    const url = 'job/web/statistics/job-seeker/';

    return httpRequest.get(url, { params: { type: 'activity' } });

  },

  adminGeneralStatistics: () => {

    const url = 'job/web/statistics/admin/';

    return httpRequest.get(url, { params: { type: 'general' } });

  },

};

export default statisticService;
