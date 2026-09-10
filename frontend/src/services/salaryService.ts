import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse } from '../utils/apiResponse';
import type { SalaryBenchmarkItem } from '../types/models';
import type { PaginatedResponse } from '../types/api';

export interface GetSalaryBenchmarksParams {
  search?: string;
  career_id?: number;
  experience_level?: string;
  is_hot?: boolean;
  year?: number;
  page?: number;
  pageSize?: number;
}

const salaryService = {
  getSalaryBenchmarks: (params?: GetSalaryBenchmarksParams): Promise<PaginatedResponse<SalaryBenchmarkItem>> => {
    const url = 'interview/web/salary-benchmarks/';
    return httpRequest
      .get(url, { params })
      .then((data) => normalizePaginatedResponse<SalaryBenchmarkItem>(data));
  },
};

export default salaryService;
