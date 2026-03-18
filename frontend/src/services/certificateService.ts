import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const certificateService = {
  addCertificates: (data: AnyRecord): Promise<unknown> => {
    const url = `info/web/certificates-detail/`;
    return httpRequest.post(url, data);
  },

  getCertificateById: (id: IdType): Promise<unknown> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateCertificateById: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteCertificateById: (id: IdType): Promise<unknown> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default certificateService;
