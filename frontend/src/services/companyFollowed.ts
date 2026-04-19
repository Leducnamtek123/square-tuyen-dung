import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { Company } from '../types/models';
import { cleanParams } from '../utils/params';

export type CompanyFollowedListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
};

const companyFollowed = {
  getCompaniesFollowed: (params: CompanyFollowedListParams = {}): Promise<PaginatedResponse<{ id: number, company: Company }>> => {
    const url = 'info/web/companies-follow/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<PaginatedResponse<{ id: number, company: Company }>>;
  },
};

export default companyFollowed;



