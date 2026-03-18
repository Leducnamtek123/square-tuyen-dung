import httpRequest from '../utils/httpRequest';

const mediaService = {
  presignUrl: (url: string): Promise<unknown> => {
    const endpoint = 'common/presign/';
    return httpRequest.get(endpoint, { params: { url } });
  },
};

export default mediaService;
