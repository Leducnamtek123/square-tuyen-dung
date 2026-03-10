import httpRequest from '../utils/httpRequest';

const adminJobService = {
    getAllJobs: (params) => {
        return httpRequest.get('job/web/admin-job-posts/', { params });
    },
    updateJob: (id, data) => {
        return httpRequest.patch(`job/web/admin-job-posts/${id}/`, data);
    },
    approveJob: (id) => {
        return httpRequest.patch(`job/web/admin-job-posts/${id}/approve/`);
    },
    rejectJob: (id) => {
        return httpRequest.patch(`job/web/admin-job-posts/${id}/reject/`);
    },
    deleteJob: (id) => {
        return httpRequest.delete(`job/web/admin-job-posts/${id}/`);
    },
};

export default adminJobService;
