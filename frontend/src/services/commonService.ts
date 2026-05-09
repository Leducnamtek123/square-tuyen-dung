import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { SystemConfig, Career, District } from '../types/models';

type CityInput = { id?: number | string } | number | string | null | undefined;
type DistrictInput = { id?: number | string } | number | string | null | undefined;

/* ── Response Types ───────────────────────────────────────────────────── */

interface DistrictsResponse {
  data: District[];
}

interface WardsResponse {
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
    const startPage = Number(params.page || 1);
    const fetchPage = async (page: number): Promise<PaginatedLike<Career>> => {
      return (await httpRequest.get(url, {
        params: { page, pageSize, kw },
      })) as PaginatedLike<Career>;
    };

    const fetchUntilShortPage = async (page: number, collected: Career[]): Promise<Career[]> => {
      const res = await fetchPage(page);
      const pageResults = extractResults<Career>(res);
      const nextResults = collected.concat(pageResults);

      if (!pageResults.length || pageResults.length < pageSize) {
        return nextResults;
      }
      return fetchUntilShortPage(page + 1, nextResults);
    };

    const firstPage = await fetchPage(startPage);
    const firstPageResults = extractResults<Career>(firstPage);
    const total = typeof firstPage?.count === 'number' ? firstPage.count : null;

    let results: Career[];
    if (total) {
      const totalPages = Math.ceil(total / pageSize);
      const remainingPages = Array.from(
        { length: Math.max(0, totalPages - startPage) },
        (_, index) => startPage + index + 1
      );
      const remainingResults = await Promise.all(remainingPages.map(fetchPage));
      results = firstPageResults.concat(remainingResults.flatMap((res) => extractResults<Career>(res)));
    } else {
      results = firstPageResults.length < pageSize
        ? firstPageResults
        : await fetchUntilShortPage(startPage + 1, firstPageResults);
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
