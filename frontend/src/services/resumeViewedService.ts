import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse } from '../utils/apiResponse';
import type { PaginatedResponse } from '../types/api';
import type { Resume, Company } from '../types/models';
import { cleanParams } from '../utils/params';

export interface ResumeViewed {
  id: number;
  views: number;
  createAt: string;
  isSavedResume?: boolean;
  resume: Resume;
  company: Company;
}


const resumeViewedService = {
  getResumeViewed: (params: { page?: number; pageSize?: number; ordering?: string } = {}): Promise<PaginatedResponse<ResumeViewed>> => {
    const url = 'info/web/resume-views/';
    return (httpRequest.get(url, { params: cleanParams(params) }) as Promise<unknown>).then((data) =>
      normalizePaginatedResponse<ResumeViewed>(data)
    );
  },
};

export default resumeViewedService;

