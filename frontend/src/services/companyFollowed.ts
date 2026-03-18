import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const companyFollowed = {
  getCompaniesFollowed: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/companies-follow/';
    return httpRequest.get(url, { params: params });
  },
};

export default companyFollowed;
