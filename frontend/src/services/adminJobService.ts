import { JobPost } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';
import type { AdminListParams } from './adminManagementService';

type IdType = string | number;

const adminJobService = {
  getAllJobs: (params: AdminListParams = {}): Promise<PaginatedResponse<JobPost>> => {
    return httpRequest.get<PaginatedResponse<JobPost>>('job/web/admin-job-posts/', { params: cleanParams(params) });
  },
  updateJob: (id: IdType, data: Partial<JobPost>): Promise<JobPost> => {
    return httpRequest.patch<JobPost>(`job/web/admin-job-posts/${id}/`, data);
  },
  approveJob: (id: IdType): Promise<JobPost> => {
    return httpRequest.patch<JobPost>(`job/web/admin-job-posts/${id}/approve/`);
  },
  rejectJob: (id: IdType): Promise<JobPost> => {
    return httpRequest.patch<JobPost>(`job/web/admin-job-posts/${id}/reject/`);
  },
  deleteJob: (id: IdType): Promise<void> => {
    return httpRequest.delete(`job/web/admin-job-posts/${id}/`);
  },
};

export default adminJobService;
