import httpRequest from "../utils/httpRequest";

const companyTeamService = {
  getRoles: (params = {}) => {
    return httpRequest.get("info/web/company-roles/", { params });
  },
  createRole: (data) => {
    return httpRequest.post("info/web/company-roles/", data);
  },
  updateRole: (id, data) => {
    return httpRequest.patch(`info/web/company-roles/${id}/`, data);
  },
  deleteRole: (id) => {
    return httpRequest.delete(`info/web/company-roles/${id}/`);
  },
  getMembers: (params = {}) => {
    return httpRequest.get("info/web/company-members/", { params });
  },
  createMember: (data) => {
    return httpRequest.post("info/web/company-members/", data);
  },
  updateMember: (id, data) => {
    return httpRequest.patch(`info/web/company-members/${id}/`, data);
  },
  deleteMember: (id) => {
    return httpRequest.delete(`info/web/company-members/${id}/`);
  },
  getMyMembership: () => {
    return httpRequest.get("info/web/company-members/me/");
  },
};

export default companyTeamService;
