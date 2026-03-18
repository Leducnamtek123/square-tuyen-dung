import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const adminInterviewService = {
  getAllInterviews: (params: AnyRecord = {}): Promise<unknown> => {
    return httpRequest.get('interview/web/sessions/', { params });
  },
  getInterviewDetail: (id: IdType): Promise<unknown> => {
    return httpRequest.get(`interview/web/sessions/${id}/`);
  },
  scheduleInterview: (data: AnyRecord): Promise<unknown> => {
    return httpRequest.post('interview/web/sessions/', data);
  },
  updateInterviewStatus: (id: IdType, status: string): Promise<unknown> => {
    // Update status via standard partial update to avoid depending on room_name-based routes
    return httpRequest.patch(`interview/web/sessions/${id}/`, { status });
  },
  deleteInterview: (id: IdType): Promise<unknown> => {
    return httpRequest.delete(`interview/web/sessions/${id}/`);
  },
};

export default adminInterviewService;
