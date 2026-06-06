import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';

import type { PaginatedResponse } from '../types/api';
import type { CompanyRole, CompanyMember } from '../types/models';


type IdType = string | number;
type CompanyTeamListParams = {
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
  invited_email?: string;
  is_active?: boolean;
}

export interface CompanyMemberUpdatePayload {
  roleId?: number;
  status?: string;
  invitedEmail?: string;
  invited_email?: string;
  is_active?: boolean;
}

const normalizeMemberPayload = <T extends CompanyMemberPayload | CompanyMemberUpdatePayload>(data: T) => {
  const payload = { ...data } as T & { invitedEmail?: string; invited_email?: string };
  if (payload.invitedEmail && !payload.invited_email) {
    payload.invited_email = payload.invitedEmail;
  }
  delete payload.invitedEmail;
  return payload;
};

const companyTeamService = {
  getRoles: (params: CompanyTeamListParams = {}): Promise<PaginatedResponse<CompanyRole>> => {
    return httpRequest
      .get('info/web/company-roles/', { params: cleanParams(params) })
      .then((data) => normalizePaginatedResponse<CompanyRole>(data));
  },
  createRole: (data: CompanyRolePayload): Promise<CompanyRole> => {
    return (httpRequest.post('info/web/company-roles/', data) as Promise<unknown>)
      .then(unwrapDataResponse<CompanyRole>);
  },
  updateRole: (id: IdType, data: Partial<CompanyRolePayload>): Promise<CompanyRole> => {
    return (httpRequest.patch(`info/web/company-roles/${id}/`, data) as Promise<unknown>)
      .then(unwrapDataResponse<CompanyRole>);
  },
  deleteRole: (id: IdType): Promise<void> => {
    return httpRequest.delete<void>(`info/web/company-roles/${id}/`);
  },
  getMembers: (params: CompanyTeamListParams = {}): Promise<PaginatedResponse<CompanyMember>> => {
    return httpRequest
      .get('info/web/company-members/', { params: cleanParams(params) })
      .then((data) => normalizePaginatedResponse<CompanyMember>(data));
  },
  createMember: (data: CompanyMemberPayload): Promise<CompanyMember> => {
    return (httpRequest.post('info/web/company-members/', normalizeMemberPayload(data)) as Promise<unknown>)
      .then(unwrapDataResponse<CompanyMember>);
  },
  updateMember: (id: IdType, data: CompanyMemberUpdatePayload): Promise<CompanyMember> => {
    return (httpRequest.patch(`info/web/company-members/${id}/`, normalizeMemberPayload(data)) as Promise<unknown>)
      .then(unwrapDataResponse<CompanyMember>);
  },
  deleteMember: (id: IdType): Promise<void> => {
    return httpRequest.delete<void>(`info/web/company-members/${id}/`);
  },
  getMyMembership: (): Promise<CompanyMember | null> => {
    return (httpRequest.get('info/web/company-members/me/') as Promise<unknown>)
      .then(unwrapDataResponse<CompanyMember | null>);
  },
};

export default companyTeamService;



