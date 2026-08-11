import MockAdapter from 'axios-mock-adapter';
import type { AxiosInstance } from 'axios';
import {
  mockJobPosts,
  mockCompanies,
  mockCareers,
  mockCities,
  mockDistricts,
  mockPositions,
  mockExperiences,
  mockAcademicLevels,
  mockJobTypes,
  mockTypeOfWorkplaces,
  mockUser,
  mockConfigs,
  mockBanners,
  mockFeedbacks,
  mockArticles,
  mockPopularKeywords,
  mockArticleCategories,
} from './mockData';

let mockAdapterInstance: MockAdapter | null = null;

export function initMockAdapter(client: AxiosInstance) {
  if (mockAdapterInstance) {
    return mockAdapterInstance;
  }

  console.log('💡 [Mock Mode] Initializing Axios Mock Adapter with rich sample data...');
  const mock = new MockAdapter(client, { delayResponse: 100 });

  // 1. Configs & Common Endpoints
  mock.onGet(/\/common\/configs\/?/).reply(200, { data: mockConfigs });
  mock.onGet(/\/common\/top-careers\/?/).reply(200, { data: mockCareers, results: mockCareers, count: mockCareers.length });
  mock.onGet(/\/common\/all-careers\/?/).reply(200, { data: mockCareers, results: mockCareers, count: mockCareers.length });
  mock.onGet(/\/common\/careers\/?/).reply(200, { data: mockCareers, results: mockCareers, count: mockCareers.length });
  mock.onGet(/\/common\/cities\/?/).reply(200, { data: mockCities, results: mockCities, count: mockCities.length });
  mock.onGet(/\/common\/districts\/?/).reply(200, { data: mockDistricts, results: mockDistricts, count: mockDistricts.length });
  mock.onGet(/\/common\/positions\/?/).reply(200, { data: mockPositions, results: mockPositions, count: mockPositions.length });
  mock.onGet(/\/common\/experiences\/?/).reply(200, { data: mockExperiences, results: mockExperiences, count: mockExperiences.length });
  mock.onGet(/\/common\/academic-levels\/?/).reply(200, { data: mockAcademicLevels, results: mockAcademicLevels, count: mockAcademicLevels.length });
  mock.onGet(/\/common\/job-types\/?/).reply(200, { data: mockJobTypes, results: mockJobTypes, count: mockJobTypes.length });
  mock.onGet(/\/common\/popular-keywords\/?/).reply(200, { data: mockPopularKeywords, results: mockPopularKeywords, count: mockPopularKeywords.length });

  // 2. Banners, Feedbacks, Articles & Categories
  mock.onGet(/\/(banner|common\/banners|content\/banners)\/?/).reply(200, { data: mockBanners, results: mockBanners, count: mockBanners.length });
  mock.onGet(/\/feedbacks\/?/).reply(200, { data: mockFeedbacks, results: mockFeedbacks, count: mockFeedbacks.length });
  mock.onGet(/\/content\/web\/article-categories\/?/).reply(200, { data: mockArticleCategories, results: mockArticleCategories, count: mockArticleCategories.length });
  mock.onGet(/\/content\/web\/admin\/article-categories\/?/).reply(200, { data: mockArticleCategories, results: mockArticleCategories, count: mockArticleCategories.length });
  mock.onGet(/\/content\/web\/articles\/?/).reply(200, { data: mockArticles, results: mockArticles, count: mockArticles.length });

  // 3. Job Posts list & detail
  mock.onGet(/\/job\/web\/job-posts\/[^\/]+\/?$/).reply((config) => {
    const parts = (config.url || '').split('?')[0].split('/').filter(Boolean);
    const slugOrId = parts[parts.length - 1];
    const found = mockJobPosts.find((j) => String(j.id) === slugOrId || j.slug === slugOrId) || mockJobPosts[0];
    return [200, { data: found }];
  });

  mock.onGet(/\/job\/web\/job-posts\/?/).reply(() => {
    return [
      200,
      {
        count: mockJobPosts.length,
        next: null,
        previous: null,
        results: mockJobPosts,
        data: mockJobPosts,
      },
    ];
  });

  // 4. Companies list & detail
  mock.onGet(/\/(company\/web\/companies|info\/web\/companies)\/[^\/]+\/?$/).reply((config) => {
    const parts = (config.url || '').split('?')[0].split('/').filter(Boolean);
    const slugOrId = parts[parts.length - 1];
    const found = mockCompanies.find((c) => String(c.id) === slugOrId || c.slug === slugOrId) || mockCompanies[0];
    return [200, { data: found }];
  });

  mock.onGet(/\/(company\/web\/companies|info\/web\/companies|info\/web\/companies\/top)\/?/).reply(() => {
    return [
      200,
      {
        count: mockCompanies.length,
        results: mockCompanies,
        data: mockCompanies,
      },
    ];
  });

  // 5. Auth & User endpoints
  mock.onGet(/\/(auth\/web\/me|auth\/me)\/?/).reply(200, { data: mockUser });
  mock.onPost(/\/auth\/token\/?/).reply(200, {
    data: {
      access_token: 'mock-access-token-xyz',
      refresh_token: 'mock-refresh-token-xyz',
      token_type: 'Bearer',
      expires_in: 3600,
    },
  });

  mockAdapterInstance = mock;
  return mock;
}
