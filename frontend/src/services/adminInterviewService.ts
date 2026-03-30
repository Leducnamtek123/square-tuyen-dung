import { InterviewSession } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;
type IdType = string | number;

const adminInterviewService = {
  getAllInterviews: (params: AnyRecord = {}): Promise<PaginatedResponse<InterviewSession>> => {
    return httpRequest.get<PaginatedResponse<InterviewSession>>('interview/web/sessions/', { params }) as any as Promise<PaginatedResponse<InterviewSession>>;
  },
  getInterviewDetail: (id: IdType): Promise<InterviewSession> => {
    return httpRequest.get<InterviewSession>(`interview/web/sessions/${id}/`) as any as Promise<InterviewSession>;
  },
  scheduleInterview: (data: Partial<InterviewSession> | AnyRecord): Promise<InterviewSession> => {
    return httpRequest.post<InterviewSession>('interview/web/sessions/', data) as any as Promise<InterviewSession>;
  },
  updateInterviewStatus: (id: IdType, status: string): Promise<InterviewSession> => {
    // Update status via standard partial update to avoid depending on room_name-based routes
    return httpRequest.patch<InterviewSession>(`interview/web/sessions/${id}/`, { status }) as any as Promise<InterviewSession>;
  },
  deleteInterview: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/web/sessions/${id}/`);
  },
};

export default adminInterviewService;
