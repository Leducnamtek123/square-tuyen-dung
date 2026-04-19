import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';

import type { PaginatedResponse } from '../types/api';
import type { CompanyRole, CompanyMember } from '../types/models';


type IdType = string | number;
export type CompanyTeamListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  search?: string;
  status?: string;
};

export interface CompanyRolePayload {
  code: string;
  name: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
}

export interface CompanyMemberPayload {
  userId: number;
  roleId: number;
  status?: string;
  invitedEmail?: string;
  is_active?: boolean;
}

export interface CompanyMemberUpdatePayload {
  roleId?: number;
  status?: string;
  is_active?: boolean;
}

const companyTeamService = {
  getRoles: (params: CompanyTeamListParams = {}): Promise<PaginatedResponse<CompanyRole>> => {
    return httpRequest.get<PaginatedResponse<CompanyRole>>('info/web/company-roles/', { params: cleanParams(params) });
  },
  createRole: (data: CompanyRolePayload): Promise<CompanyRole> => {
    return httpRequest.post<CompanyRole>('info/web/company-roles/', data);
  },
  updateRole: (id: IdType, data: Partial<CompanyRolePayload>): Promise<CompanyRole> => {
    return httpRequest.patch<CompanyRole>(`info/web/company-roles/${id}/`, data);
  },
  deleteRole: (id: IdType): Promise<void> => {
    return httpRequest.delete<void>(`info/web/company-roles/${id}/`);
  },
  getMembers: (params: CompanyTeamListParams = {}): Promise<PaginatedResponse<CompanyMember>> => {
    return httpRequest.get<PaginatedResponse<CompanyMember>>('info/web/company-members/', { params: cleanParams(params) });
  },
  createMember: (data: CompanyMemberPayload): Promise<CompanyMember> => {
    return httpRequest.post<CompanyMember>('info/web/company-members/', data);
  },
  updateMember: (id: IdType, data: CompanyMemberUpdatePayload): Promise<CompanyMember> => {
    return httpRequest.patch<CompanyMember>(`info/web/company-members/${id}/`, data);
  },
  deleteMember: (id: IdType): Promise<void> => {
    return httpRequest.delete<void>(`info/web/company-members/${id}/`);
  },
  getMyMembership: (): Promise<CompanyMember> => {
    return httpRequest.get<CompanyMember>('info/web/company-members/me/');
  },
};

export default companyTeamService;



