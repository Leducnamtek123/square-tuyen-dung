import httpRequest from '../utils/httpRequest';


type IdType = string | number;

const certificateService = {
  addCertificates: (data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/certificates-detail/`;
    return httpRequest.post(url, data);
  },

  getCertificateById: (id: IdType): Promise<unknown> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateCertificateById: (id: IdType, data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteCertificateById: (id: IdType): Promise<unknown> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default certificateService;

