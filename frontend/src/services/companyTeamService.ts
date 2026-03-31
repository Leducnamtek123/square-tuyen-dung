import httpRequest from '../utils/httpRequest';

import type { PaginatedResponse } from '../types/api';
import type { CompanyRole, CompanyMember } from '../types/models';


type IdType = string | number;

const companyTeamService = {
  getRoles: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<CompanyRole>> => {
    return httpRequest.get<unknown, PaginatedResponse<CompanyRole>>('info/web/company-roles/', { params });
  },
  createRole: (data: Record<string, unknown>): Promise<CompanyRole> => {
    return httpRequest.post<unknown, CompanyRole>('info/web/company-roles/', data);
  },
  updateRole: (id: IdType, data: Record<string, unknown>): Promise<CompanyRole> => {
    return httpRequest.patch<unknown, CompanyRole>(`info/web/company-roles/${id}/`, data);
  },
  deleteRole: (id: IdType): Promise<void> => {
    return httpRequest.delete<unknown, void>(`info/web/company-roles/${id}/`);
  },
  getMembers: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<CompanyMember>> => {
    return httpRequest.get<unknown, PaginatedResponse<CompanyMember>>('info/web/company-members/', { params });
  },
  createMember: (data: Record<string, unknown>): Promise<CompanyMember> => {
    return httpRequest.post<unknown, CompanyMember>('info/web/company-members/', data);
  },
  updateMember: (id: IdType, data: Record<string, unknown>): Promise<CompanyMember> => {
    return httpRequest.patch<unknown, CompanyMember>(`info/web/company-members/${id}/`, data);
  },
  deleteMember: (id: IdType): Promise<void> => {
    return httpRequest.delete<unknown, void>(`info/web/company-members/${id}/`);
  },
  getMyMembership: (): Promise<CompanyMember> => {
    return httpRequest.get<unknown, CompanyMember>('info/web/company-members/me/');
  },
};

export default companyTeamService;

