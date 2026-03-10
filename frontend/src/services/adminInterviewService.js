import httpRequest from '../utils/httpRequest';

const adminInterviewService = {
    getAllInterviews: (params) => {
        return httpRequest.get('interview/web/sessions/', { params });
    },
    getInterviewDetail: (id) => {
        return httpRequest.get(`interview/web/sessions/${id}/`);
    },
    scheduleInterview: (data) => {
        return httpRequest.post('interview/web/sessions/', data);
    },
    updateInterviewStatus: (id, status) => {
        // Update status via standard partial update to avoid depending on room_name-based routes
        return httpRequest.patch(`interview/web/sessions/${id}/`, { status });
    },
    deleteInterview: (id) => {
        return httpRequest.delete(`interview/web/sessions/${id}/`);
    },
};

export default adminInterviewService;
