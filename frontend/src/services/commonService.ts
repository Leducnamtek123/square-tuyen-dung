import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { SystemConfig } from '../types/models';

type AnyRecord = Record<string, unknown>;

type CityInput = { id?: number | string } | number | string | null | undefined;
type DistrictInput = { id?: number | string } | number | string | null | undefined;

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

  getWardsByDistrictId: (districtId: DistrictInput): Promise<any> => {
    const normalizedDistrictId =
      districtId && typeof districtId === 'object' ? districtId.id : districtId;

    if (
      normalizedDistrictId === undefined ||
      normalizedDistrictId === null ||
      normalizedDistrictId === ''
    ) {
      return Promise.resolve({ data: [] } as AnyRecord);
    }

    const url = `common/wards/?districtId=${encodeURIComponent(normalizedDistrictId)}`;
    return httpRequest.get(url);
  },

  getTop10Careers: async (): Promise<any> => {
    const url = 'common/top-careers/';
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  /**
   * Single-request career fetch for app initialization.
   * No while-loop pagination, no presignInObject (careers have no MinIO URLs).
   */
  getAllCareersSimple: async (params: AnyRecord = {}): Promise<any[]> => {
    const url = 'common/all-careers/';
    const res = (await httpRequest.get(url, {
      params: { page: 1, pageSize: Number(params.pageSize || 1000) },
    })) as AnyRecord;

    return (
      (Array.isArray(res?.results) && res.results) ||
      (Array.isArray((res as any)?.data?.results) && (res as any).data.results) ||
      (Array.isArray(res) && res) ||
      []
    );
  },

  getAllCareers: async (params: AnyRecord = {}): Promise<any[]> => {
    const url = 'common/all-careers/';
    const pageSize = Number(params.pageSize || 1000);
    const kw = params.kw;
    let page = Number(params.page || 1);
    let results: any[] = [];
    let total = 0;

    while (true) {
      const res = (await httpRequest.get(url, {
        params: { page, pageSize, kw },
      })) as AnyRecord;

      const pageResults =
        (Array.isArray(res?.results) && res.results) ||
        (Array.isArray((res as any)?.data?.results) && (res as any).data.results) ||
        (Array.isArray(res) && res) ||
        [];

      const count =
        typeof res?.count === 'number'
          ? (res.count as number)
          : typeof (res as any)?.data?.count === 'number'
          ? (res as any).data.count
          : null;

      if (typeof count === 'number') total = count;

      results = results.concat(pageResults);

      if (!pageResults.length) break;
      if (total && results.length >= total) break;
      if (pageResults.length < pageSize) break;

      page += 1;
    }

    return presignInObject(results);
  },

  healthCheck: (): Promise<any> => {
    const url = 'common/health/';
    return httpRequest.get(url);
  },
};

export default commonService;
