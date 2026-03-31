import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { Company } from '../types/models';


const companyFollowed = {
  getCompaniesFollowed: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<{ id: number, company: Company }>> => {
    const url = 'info/web/companies-follow/';
    return httpRequest.get(url, { params: params }) as Promise<PaginatedResponse<{ id: number, company: Company }>>;
  },
};

export default companyFollowed;

