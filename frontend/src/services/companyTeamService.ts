import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const companyTeamService = {
  getRoles: (params: AnyRecord = {}): Promise<unknown> => {
    return httpRequest.get('info/web/company-roles/', { params });
  },
  createRole: (data: AnyRecord): Promise<unknown> => {
    return httpRequest.post('info/web/company-roles/', data);
  },
  updateRole: (id: IdType, data: AnyRecord): Promise<unknown> => {
    return httpRequest.patch(`info/web/company-roles/${id}/`, data);
  },
  deleteRole: (id: IdType): Promise<unknown> => {
    return httpRequest.delete(`info/web/company-roles/${id}/`);
  },
  getMembers: (params: AnyRecord = {}): Promise<unknown> => {
    return httpRequest.get('info/web/company-members/', { params });
  },
  createMember: (data: AnyRecord): Promise<unknown> => {
    return httpRequest.post('info/web/company-members/', data);
  },
  updateMember: (id: IdType, data: AnyRecord): Promise<unknown> => {
    return httpRequest.patch(`info/web/company-members/${id}/`, data);
  },
  deleteMember: (id: IdType): Promise<unknown> => {
    return httpRequest.delete(`info/web/company-members/${id}/`);
  },
  getMyMembership: (): Promise<unknown> => {
    return httpRequest.get('info/web/company-members/me/');
  },
};

export default companyTeamService;
