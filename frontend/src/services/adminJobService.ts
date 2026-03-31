import { JobPost } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';

type IdType = string | number;

const adminJobService = {
  getAllJobs: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<JobPost>> => {
    return httpRequest.get<PaginatedResponse<JobPost>>('job/web/admin-job-posts/', { params }) as unknown as Promise<PaginatedResponse<JobPost>>;
  },
  updateJob: (id: IdType, data: Partial<JobPost>): Promise<JobPost> => {
    return httpRequest.patch<JobPost>(`job/web/admin-job-posts/${id}/`, data) as unknown as Promise<JobPost>;
  },
  approveJob: (id: IdType): Promise<JobPost> => {
    return httpRequest.patch<JobPost>(`job/web/admin-job-posts/${id}/approve/`) as unknown as Promise<JobPost>;
  },
  rejectJob: (id: IdType): Promise<JobPost> => {
    return httpRequest.patch<JobPost>(`job/web/admin-job-posts/${id}/reject/`) as unknown as Promise<JobPost>;
  },
  deleteJob: (id: IdType): Promise<void> => {
    return httpRequest.delete(`job/web/admin-job-posts/${id}/`);
  },
};

export default adminJobService;
