import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { SystemConfig, Career, District } from '../types/models';

type CityInput = { id?: number | string } | number | string | null | undefined;
type DistrictInput = { id?: number | string } | number | string | null | undefined;

/* ── Response Types ───────────────────────────────────────────────────── */

export interface DistrictsResponse {
  data: District[];
}

export interface WardsResponse {
  data: { id: number; name: string; district?: District }[];
}

interface PaginatedLike<T> {
  count?: number;
  results?: T[];
  data?: T[] | { results?: T[] };
}

const extractResults = <T>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  const obj = (raw || {}) as PaginatedLike<T>;
  if (Array.isArray(obj.results)) return obj.results;
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && Array.isArray((obj.data as { results?: T[] }).results)) {
    return (obj.data as { results?: T[] }).results || [];
  }
  return [];
};

/* ── Service ──────────────────────────────────────────────────────────── */

const commonService = {
  getConfigs: async (): Promise<SystemConfig> => {
    const url = 'common/configs/';
    const data = (await httpRequest.get(url)) as SystemConfig;
    return (await presignInObject(data)) as SystemConfig;
  },

  getDistrictsByCityId: (cityId: CityInput): Promise<DistrictsResponse> => {
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
    return httpRequest.get(url) as Promise<DistrictsResponse>;
  },

  getWardsByDistrictId: (districtId: DistrictInput): Promise<WardsResponse> => {
    const normalizedDistrictId =
      districtId && typeof districtId === 'object' ? districtId.id : districtId;

    if (
      normalizedDistrictId === undefined ||
      normalizedDistrictId === null ||
      normalizedDistrictId === ''
    ) {
      return Promise.resolve({ data: [] });
    }

    const url = `common/wards/?districtId=${encodeURIComponent(normalizedDistrictId)}`;
    return httpRequest.get(url) as Promise<WardsResponse>;
  },

  getTop10Careers: async (): Promise<Career[]> => {
    const url = 'common/top-careers/';
    const data = (await httpRequest.get(url)) as unknown;
    return (await presignInObject(data)) as Career[];
  },

  /**
   * Single-request career fetch for app initialization.
   * No while-loop pagination, no presignInObject (careers have no MinIO URLs).
   */
  getAllCareersSimple: async (params: { pageSize?: number } = {}): Promise<Career[]> => {
    const url = 'common/all-careers/';
    const res = await httpRequest.get(url, {
      params: { page: 1, pageSize: Number(params.pageSize || 1000) },
    });

    return extractResults<Career>(res);
  },

  getAllCareers: async (params: { page?: number; pageSize?: number; kw?: string } = {}): Promise<Career[]> => {
    const url = 'common/all-careers/';
    const pageSize = Number(params.pageSize || 1000);
    const kw = params.kw;
    let page = Number(params.page || 1);
    let results: Career[] = [];
    let total = 0;

    while (true) {
      const res = await httpRequest.get(url, {
        params: { page, pageSize, kw },
      }) as PaginatedLike<Career>;

      const pageResults = extractResults<Career>(res);

      const count = typeof res?.count === 'number' ? res.count : null;

      if (typeof count === 'number') total = count;

      results = results.concat(pageResults);

      if (!pageResults.length) break;
      if (total && results.length >= total) break;
      if (pageResults.length < pageSize) break;

      page += 1;
    }

    return (await presignInObject(results)) as Career[];
  },

  healthCheck: (): Promise<{ status: string }> => {
    const url = 'common/health/';
    return httpRequest.get(url) as Promise<{ status: string }>;
  },

  uploadFile: async (
    file: File,
    fileType: string = 'OTHER',
    options: { onUploadProgress?: (progress: number) => void } = {},
  ): Promise<{ id: number; url: string; name: string }> => {
    const url = 'common/upload-file/';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    return httpRequest.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!options.onUploadProgress) return;
        if (!event.total) {
          options.onUploadProgress(0);
          return;
        }

        const progress = Math.round((event.loaded / event.total) * 100);
        options.onUploadProgress(progress);
      },
    }) as Promise<{ id: number; url: string; name: string }>;
  },
};

export default commonService;
