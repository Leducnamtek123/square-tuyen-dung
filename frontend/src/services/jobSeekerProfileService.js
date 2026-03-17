import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

const jobSeekerProfileService = {

  getProfile: async () => {

    const url = 'info/profile/';

    const data = await httpRequest.get(url);
    return presignInObject(data);

  },

  updateProfile: async (data) => {

    const url = 'info/profile/';

    const resData = await httpRequest.put(url, data);
    return presignInObject(resData);

  },

  getResumes: async (jobSeekerProfileId, params = {}) => {

    const url = `info/web/job-seeker-profiles/${jobSeekerProfileId}/resumes/`;

    const data = await httpRequest.get(url, { params: params });
    return presignInObject(data);

  },

};

export default jobSeekerProfileService;
