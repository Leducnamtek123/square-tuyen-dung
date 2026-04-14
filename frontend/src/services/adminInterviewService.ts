import { InterviewSession } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';

type IdType = string | number;

const adminInterviewService = {
  getAllInterviews: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<InterviewSession>> => {
    return httpRequest.get<PaginatedResponse<InterviewSession>>('interview/admin/sessions/', { params });
  },
  getInterviewDetail: (id: IdType): Promise<InterviewSession> => {
    return httpRequest.get<InterviewSession>(`interview/admin/sessions/${id}/`);
  },
};

export default adminInterviewService;
