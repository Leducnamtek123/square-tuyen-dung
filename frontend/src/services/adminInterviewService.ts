import { InterviewSession } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';
import type { AdminListParams } from './adminManagementService';

type IdType = string | number;

const adminInterviewService = {
  getAllInterviews: (params: AdminListParams = {}): Promise<PaginatedResponse<InterviewSession>> => {
    return httpRequest.get<PaginatedResponse<InterviewSession>>('interview/admin/sessions/', { params: cleanParams(params) });
  },
  getInterviewDetail: (id: IdType): Promise<InterviewSession> => {
    return httpRequest.get<InterviewSession>(`interview/admin/sessions/${id}/`);
  },
};

export default adminInterviewService;
