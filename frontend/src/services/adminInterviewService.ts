import { InterviewSession } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';

type IdType = string | number;

const adminInterviewService = {
  getAllInterviews: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<InterviewSession>> => {
    return httpRequest.get<PaginatedResponse<InterviewSession>>('interview/web/sessions/', { params });
  },
  getInterviewDetail: (id: IdType): Promise<InterviewSession> => {
    return httpRequest.get<InterviewSession>(`interview/web/sessions/${id}/`);
  },
  scheduleInterview: (data: Partial<InterviewSession> | Record<string, unknown>): Promise<InterviewSession> => {
    return httpRequest.post<InterviewSession>('interview/web/sessions/', data);
  },
  updateInterviewStatus: (id: IdType, status: string): Promise<InterviewSession> => {
    // Update status via standard partial update to avoid depending on room_name-based routes
    return httpRequest.patch<InterviewSession>(`interview/web/sessions/${id}/`, { status });
  },
  deleteInterview: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/web/sessions/${id}/`);
  },
};

export default adminInterviewService;

