import { JobPost } from '../types/models';
import { PaginatedResponse } from '../types/api';
import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const adminJobService = {
  getAllJobs: (params: AnyRecord = {}): Promise<PaginatedResponse<JobPost>> => {
    return httpRequest.get('job/web/admin-job-posts/', { params }) as any as Promise<PaginatedResponse<JobPost>>;
  },
  updateJob: (id: IdType, data: AnyRecord): Promise<JobPost> => {
    return httpRequest.patch(`job/web/admin-job-posts/${id}/`, data) as any as Promise<JobPost>;
  },
  approveJob: (id: IdType): Promise<JobPost> => {
    return httpRequest.patch(`job/web/admin-job-posts/${id}/approve/`) as any as Promise<JobPost>;
  },
  rejectJob: (id: IdType): Promise<JobPost> => {
    return httpRequest.patch(`job/web/admin-job-posts/${id}/reject/`) as any as Promise<JobPost>;
  },
  deleteJob: (id: IdType): Promise<void> => {
    return httpRequest.delete(`job/web/admin-job-posts/${id}/`);
  },
};

export default adminJobService;
