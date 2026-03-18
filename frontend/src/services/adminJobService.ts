import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const adminJobService = {
  getAllJobs: (params: AnyRecord = {}): Promise<unknown> => {
    return httpRequest.get('job/web/admin-job-posts/', { params });
  },
  updateJob: (id: IdType, data: AnyRecord): Promise<unknown> => {
    return httpRequest.patch(`job/web/admin-job-posts/${id}/`, data);
  },
  approveJob: (id: IdType): Promise<unknown> => {
    return httpRequest.patch(`job/web/admin-job-posts/${id}/approve/`);
  },
  rejectJob: (id: IdType): Promise<unknown> => {
    return httpRequest.patch(`job/web/admin-job-posts/${id}/reject/`);
  },
  deleteJob: (id: IdType): Promise<unknown> => {
    return httpRequest.delete(`job/web/admin-job-posts/${id}/`);
  },
};

export default adminJobService;
