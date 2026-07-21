import { JobPost } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
import { cleanParams } from '../utils/params';
import type { AdminListParams } from './adminManagementService';

type IdType = string | number;

const adminJobService = {
  getAllJobs: async (params: AdminListParams = {}): Promise<PaginatedResponse<JobPost>> => {
    const data = await httpRequest.get('job/web/admin-job-posts/', { params: cleanParams(params) });
    return normalizePaginatedResponse<JobPost>(data);
  },
  updateJob: (id: IdType, data: Partial<JobPost>): Promise<JobPost> => {
    return (httpRequest.patch(`job/web/admin-job-posts/${id}/`, data) as Promise<unknown>)
      .then(unwrapDataResponse<JobPost>);
  },
  approveJob: (id: IdType): Promise<JobPost> => {
    return (httpRequest.patch(`job/web/admin-job-posts/${id}/approve/`) as Promise<unknown>)
      .then(unwrapDataResponse<JobPost>);
  },
  rejectJob: (id: IdType): Promise<JobPost> => {
    return (httpRequest.patch(`job/web/admin-job-posts/${id}/reject/`) as Promise<unknown>)
      .then(unwrapDataResponse<JobPost>);
  },
  deleteJob: (id: IdType): Promise<void> => {
    return httpRequest.delete(`job/web/admin-job-posts/${id}/`);
  },
};

export default adminJobService;
