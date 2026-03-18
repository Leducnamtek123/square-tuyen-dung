import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { SystemConfig } from '../types/models';

type AnyRecord = Record<string, unknown>;

type CityInput = { id?: number | string } | number | string | null | undefined;

const commonService = {
  getConfigs: async (): Promise<SystemConfig> => {
    const url = 'common/configs/';
    const data = (await httpRequest.get(url)) as SystemConfig;
    return presignInObject(data);
  },

  getDistrictsByCityId: (cityId: CityInput): Promise<any> => {
    const normalizedCityId =
      cityId && typeof cityId === 'object' ? cityId.id : cityId;

    if (
      normalizedCityId === undefined ||
      normalizedCityId === null ||
      normalizedCityId === ''
    ) {
      return Promise.resolve({ data: [] } as AnyRecord);
    }

    const url = `common/districts/?cityId=${encodeURIComponent(normalizedCityId)}`;
    return httpRequest.get(url);
  },

  getTop10Careers: async (): Promise<any> => {
    const url = 'common/top-careers/';
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },
};

export default commonService;
