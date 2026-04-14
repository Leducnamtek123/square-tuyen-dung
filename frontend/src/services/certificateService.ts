import httpRequest from '../utils/httpRequest';
import type { Certificate } from '../types/models';

type IdType = string | number;

export interface CertificateInput {
  id?: string | number;
  name?: string;
  trainingPlace?: string;
  startDate?: string | Date | null;
  expirationDate?: string | Date | null;
  certificateName?: string;
  trainingPlaceName?: string;
  resumeSlug?: string;
  resume?: string;
}

const certificateService = {
  addCertificates: (data: CertificateInput): Promise<Certificate> => {
    const url = `info/web/certificates-detail/`;
    return httpRequest.post(url, data);
  },

  getCertificateById: (id: IdType): Promise<Certificate> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateCertificateById: (id: IdType, data: CertificateInput): Promise<Certificate> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteCertificateById: (id: IdType): Promise<void> => {
    const url = `info/web/certificates-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default certificateService;
