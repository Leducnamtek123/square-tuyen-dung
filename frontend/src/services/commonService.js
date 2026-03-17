import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

const commonService = {

  getConfigs: async () => {

    const url = 'common/configs/';

    const data = await httpRequest.get(url);
    return presignInObject(data);

  },

  getDistrictsByCityId: (cityId) => {

    const normalizedCityId =
      cityId && typeof cityId === 'object' ? cityId.id : cityId;

    if (
      normalizedCityId === undefined ||
      normalizedCityId === null ||
      normalizedCityId === ''
    ) {
      return Promise.resolve({ data: [] });
    }

    const url = `common/districts/?cityId=${encodeURIComponent(normalizedCityId)}`;

    return httpRequest.get(url);

  },

  getTop10Careers: async () => {

    const url = 'common/top-careers/';

    const data = await httpRequest.get(url);
    return presignInObject(data);

  },

};

export default commonService;
