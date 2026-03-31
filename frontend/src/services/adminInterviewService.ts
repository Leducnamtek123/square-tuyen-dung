import { InterviewSession } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';

type IdType = string | number;

const adminInterviewService = {
  getAllInterviews: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<InterviewSession>> => {
    return httpRequest.get<PaginatedResponse<InterviewSession>>('interview/web/sessions/', { params }) as unknown as Promise<PaginatedResponse<InterviewSession>>;
  },
  getInterviewDetail: (id: IdType): Promise<InterviewSession> => {
    return httpRequest.get<InterviewSession>(`interview/web/sessions/${id}/`) as unknown as Promise<InterviewSession>;
  },
  scheduleInterview: (data: Partial<InterviewSession> | Record<string, unknown>): Promise<InterviewSession> => {
    return httpRequest.post<InterviewSession>('interview/web/sessions/', data) as unknown as Promise<InterviewSession>;
  },
  updateInterviewStatus: (id: IdType, status: string): Promise<InterviewSession> => {
    // Update status via standard partial update to avoid depending on room_name-based routes
    return httpRequest.patch<InterviewSession>(`interview/web/sessions/${id}/`, { status }) as unknown as Promise<InterviewSession>;
  },
  deleteInterview: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/web/sessions/${id}/`) as unknown as Promise<void>;
  },
};

export default adminInterviewService;

