import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
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

const extractResults = <T>(raw: unknown): T[] => {
  return normalizePaginatedResponse<T>(raw).results;
};

const extractExplicitCount = (raw: unknown): number | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as { count?: unknown; data?: unknown };
  if (typeof obj.count === 'number') return obj.count;
  if (!obj.data || typeof obj.data !== 'object' || Array.isArray(obj.data)) return null;
  const nested = obj.data as { count?: unknown; data?: unknown };
  if (typeof nested.count === 'number') return nested.count;
  if (!nested.data || typeof nested.data !== 'object' || Array.isArray(nested.data)) return null;
  const nestedData = nested.data as { count?: unknown };
  return typeof nestedData.count === 'number' ? nestedData.count : null;
};

/* ── Service ──────────────────────────────────────────────────────────── */

const commonService = {
  getConfigs: async (): Promise<SystemConfig> => {
    const url = 'common/configs/';
    const data = (await httpRequest.get(url)) as SystemConfig;
    return unwrapDataResponse<SystemConfig>(await presignInObject(data));
  },

  getDistrictsByCityId: async (cityId: CityInput): Promise<DistrictsResponse> => {
    const normalizedCityId =
      cityId && typeof cityId === 'object' ? cityId.id : cityId;

    if (
      normalizedCityId === undefined ||
      normalizedCityId === null ||
      normalizedCityId === ''
    ) {
      return { data: [] };
    }

    const url = `common/districts/?cityId=${encodeURIComponent(normalizedCityId)}`;
    const data = await httpRequest.get(url);
    return { data: extractResults<District>(data) };
  },

  getWardsByDistrictId: async (districtId: DistrictInput): Promise<WardsResponse> => {
    const normalizedDistrictId =
      districtId && typeof districtId === 'object' ? districtId.id : districtId;

    if (
      normalizedDistrictId === undefined ||
      normalizedDistrictId === null ||
      normalizedDistrictId === ''
    ) {
      return { data: [] };
    }

    const url = `common/wards/?districtId=${encodeURIComponent(normalizedDistrictId)}`;
    const data = await httpRequest.get(url);
    return { data: extractResults<WardsResponse['data'][number]>(data) };
  },

  getTop10Careers: async (): Promise<Career[]> => {
    const url = 'common/top-careers/';
    const data = (await httpRequest.get(url)) as unknown;
    const signedData = await presignInObject(data);
    return extractResults<Career>(signedData);
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
    const fetchPage = async (page: number): Promise<unknown> => {
      return httpRequest.get(url, {
        params: { page, pageSize, kw },
      });
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
    const total = extractExplicitCount(firstPage);

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
    return (httpRequest.post(url, formData, {
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
    }) as Promise<unknown>).then(unwrapDataResponse<{ id: number; url: string; name: string }>);
  },
};

export default commonService;
