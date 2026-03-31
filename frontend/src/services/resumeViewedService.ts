import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { Resume, Company } from '../types/models';

export interface ResumeViewed {
  id: number;
  views: number;
  createAt: string;
  isSavedResume?: boolean;
  resume: Resume;
  company: Company;
}


const resumeViewedService = {
  getResumeViewed: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<ResumeViewed>> => {
    const url = 'info/web/resume-views/';
    return httpRequest.get(url, { params: params }) as Promise<PaginatedResponse<ResumeViewed>>;
  },
};

export default resumeViewedService;

