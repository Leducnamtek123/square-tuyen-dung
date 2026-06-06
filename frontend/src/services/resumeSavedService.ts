import httpRequest from '../utils/httpRequest';
import type { ExportTableRow, PaginatedResponse } from '../types/api';
import type { ResumeSaved } from '../types/models';
import { cleanParams } from '../utils/params';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';

export type ResumeSavedListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  kw?: string;
  salaryMax?: string | number;
  experienceId?: string | number;
  cityId?: string | number;
};

const resumeSavedService = {
  getResumesSaved: (params: ResumeSavedListParams = {}): Promise<PaginatedResponse<ResumeSaved>> => {
    const url = 'info/web/resumes-saved/';
    return httpRequest
      .get(url, { params: cleanParams(params) })
      .then((data) => normalizePaginatedResponse<ResumeSaved>(data));
  },

  exportResumesSaved: (params: ResumeSavedListParams = {}): Promise<ExportTableRow[]> => {
    const url = 'info/web/resumes-saved/export/';
    return (httpRequest.get(url, { params: cleanParams(params) }) as Promise<unknown>)
      .then(unwrapDataResponse<ExportTableRow[]>);
  },
};

export default resumeSavedService;



