import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

const withPresign = async (promise) => {
    const data = await promise;
    return presignInObject(data);
};

const adminManagementService = {

    getCareers: (params = {}) => {

        const url = 'common/admin/careers/';

        return withPresign(httpRequest.get(url, { params }));

    },

    createCareer: (data) => {

        const url = 'common/admin/careers/';

        return withPresign(httpRequest.post(url, data));

    },

    updateCareer: (id, data) => {

        const url = `common/admin/careers/${id}/`;

        return withPresign(httpRequest.patch(url, data));

    },

    deleteCareer: (id) => {

        const url = `common/admin/careers/${id}/`;

        return httpRequest.delete(url);

    },

    getCities: (params = {}) => {

        const url = 'common/admin/cities/';

        return withPresign(httpRequest.get(url, { params }));

    },

    createCity: (data) => {

        const url = 'common/admin/cities/';

        return withPresign(httpRequest.post(url, data));

    },

    updateCity: (id, data) => {

        const url = `common/admin/cities/${id}/`;

        return withPresign(httpRequest.patch(url, data));

    },

    deleteCity: (id) => {

        const url = `common/admin/cities/${id}/`;

        return httpRequest.delete(url);

    },

    getDistricts: (params = {}) => {

        const url = 'common/admin/districts/';

        return withPresign(httpRequest.get(url, { params }));

    },

    createDistrict: (data) => {

        const url = 'common/admin/districts/';

        return withPresign(httpRequest.post(url, data));

    },

    updateDistrict: (id, data) => {

        const url = `common/admin/districts/${id}/`;

        return withPresign(httpRequest.patch(url, data));

    },

    deleteDistrict: (id) => {

        const url = `common/admin/districts/${id}/`;

        return httpRequest.delete(url);

    },

    getCompanies: (params = {}) => {

        const url = 'info/web/admin/companies/';

        return withPresign(httpRequest.get(url, { params }));

    },

    getCompanyDetail: (id) => {

        const url = `info/web/admin/companies/${id}/`;

        return withPresign(httpRequest.get(url));

    },

    createCompany: (data) => {

        const url = 'info/web/admin/companies/';

        return withPresign(httpRequest.post(url, data));

    },

    updateCompany: (id, data) => {

        const url = `info/web/admin/companies/${id}/`;

        return withPresign(httpRequest.patch(url, data));

    },

    deleteCompany: (id) => {

        const url = `info/web/admin/companies/${id}/`;

        return httpRequest.delete(url);

    },

    // Job Seeker Profiles

    getProfiles: (params = {}) => {

        const url = 'info/web/admin/job-seeker-profiles/';

        return withPresign(httpRequest.get(url, { params }));

    },

    getProfileDetail: (id) => {

        const url = `info/web/admin/job-seeker-profiles/${id}/`;

        return withPresign(httpRequest.get(url));

    },

    createProfile: (data) => {

        const url = 'info/web/admin/job-seeker-profiles/';

        return withPresign(httpRequest.post(url, data));

    },

    updateProfile: (id, data) => {

        const url = `info/web/admin/job-seeker-profiles/${id}/`;

        return withPresign(httpRequest.patch(url, data));

    },

    deleteProfile: (id) => {

        const url = `info/web/admin/job-seeker-profiles/${id}/`;

        return httpRequest.delete(url);

    },

    getResumes: (params = {}) => {

        const url = 'info/web/admin/resumes/';

        return withPresign(httpRequest.get(url, { params }));

    },

    getResumeDetail: (id) => {

        const url = `info/web/admin/resumes/${id}/`;

        return withPresign(httpRequest.get(url));

    },

    createResume: (data) => {

        const url = 'info/web/admin/resumes/';

        return withPresign(httpRequest.post(url, data));

    },

    updateResume: (id, data) => {

        const url = `info/web/admin/resumes/${id}/`;

        return withPresign(httpRequest.patch(url, data));

    },

    deleteResume: (id) => {

        const url = `info/web/admin/resumes/${id}/`;

        return httpRequest.delete(url);

    },

    // Job Activity

    getJobActivities: (params = {}) => {

        const url = 'job/web/admin/job-posts-activity/';

        return httpRequest.get(url, { params });

    },

    createJobActivity: (data) => {

        const url = 'job/web/admin/job-posts-activity/';

        return httpRequest.post(url, data);

    },

    updateJobActivity: (id, data) => {

        const url = `job/web/admin/job-posts-activity/${id}/`;

        return httpRequest.patch(url, data);

    },

    deleteJobActivity: (id) => {

        const url = `job/web/admin/job-posts-activity/${id}/`;

        return httpRequest.delete(url);

    },

    getJobNotifications: (params = {}) => {

        const url = 'job/web/admin/job-post-notifications/';

        return httpRequest.get(url, { params });

    },

    createJobNotification: (data) => {

        const url = 'job/web/admin/job-post-notifications/';

        return httpRequest.post(url, data);

    },

    updateJobNotification: (id, data) => {

        const url = `job/web/admin/job-post-notifications/${id}/`;

        return httpRequest.patch(url, data);

    },

    deleteJobNotification: (id) => {

        const url = `job/web/admin/job-post-notifications/${id}/`;

        return httpRequest.delete(url);

    },

    getQuestionGroups: (params = {}) => {

        const url = 'interview/web/question-groups/';

        return httpRequest.get(url, { params });

    },

    createQuestionGroup: (data) => {

        const url = 'interview/web/question-groups/';

        return httpRequest.post(url, data);

    },

    updateQuestionGroup: (id, data) => {

        const url = `interview/web/question-groups/${id}/`;

        return httpRequest.patch(url, data);

    },

    deleteQuestionGroup: (id) => {

        const url = `interview/web/question-groups/${id}/`;

        return httpRequest.delete(url);

    },

};

export default adminManagementService;
