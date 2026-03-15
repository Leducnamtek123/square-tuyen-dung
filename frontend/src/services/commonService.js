import httpRequest from '../utils/httpRequest';

const commonService = {

  getConfigs: () => {

    const url = 'common/configs/';

    return httpRequest.get(url);

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

  getTop10Careers: () => {

    const url = 'common/top-careers/';

    return httpRequest.get(url);

  },

};

export default commonService;
