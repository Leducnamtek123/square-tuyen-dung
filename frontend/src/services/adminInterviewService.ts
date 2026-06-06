import { InterviewSession } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
import { cleanParams } from '../utils/params';
import type { AdminListParams } from './adminManagementService';

type IdType = string | number;

const adminInterviewService = {
  getAllInterviews: async (params: AdminListParams = {}): Promise<PaginatedResponse<InterviewSession>> => {
    const data = await httpRequest.get('interview/admin/sessions/', { params: cleanParams(params) });
    return normalizePaginatedResponse<InterviewSession>(data);
  },
  getInterviewDetail: (id: IdType): Promise<InterviewSession> => {
    return (httpRequest.get(`interview/admin/sessions/${id}/`) as Promise<unknown>)
      .then(unwrapDataResponse<InterviewSession>);
  },
  updateInterviewStatus: (id: IdType, status: string): Promise<InterviewSession> => {
    return (httpRequest.patch(`interview/admin/sessions/${id}/`, { status }) as Promise<unknown>)
      .then(unwrapDataResponse<InterviewSession>);
  },
  deleteInterview: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/admin/sessions/${id}/`);
  },
};

export default adminInterviewService;
