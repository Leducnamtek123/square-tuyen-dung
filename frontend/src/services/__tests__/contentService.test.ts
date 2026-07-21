import httpRequest from '../../utils/httpRequest';
import contentService from '../contentService';
import { readFileSync } from 'fs';
import { join } from 'path';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}));

describe('contentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes nested data.results feedback list responses', async () => {
    const feedback = { id: 4, content: 'Great hiring experience', rating: 5 };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { results: [feedback] },
    });

    const result = await contentService.getFeedbacks();

    expect(httpRequest.get).toHaveBeenCalledWith('content/web/feedbacks/');
    expect(result).toEqual([feedback]);
  });

  it('normalizes public, admin, and employer article list response shapes', async () => {
    const publicArticle = { id: 1, title: 'Public news', slug: 'public-news' };
    const adminArticle = { id: 2, title: 'Admin news', slug: 'admin-news' };
    const employerBlog = { id: 3, title: 'Employer blog', slug: 'employer-blog' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce([publicArticle])
      .mockResolvedValueOnce({ data: { count: 1, results: [adminArticle] } })
      .mockResolvedValueOnce({ data: [employerBlog] });

    await expect(contentService.getPublicArticles({ page: 1 })).resolves.toEqual({
      count: 1,
      results: [publicArticle],
    });
    await expect(contentService.adminGetArticles({ page: 2 })).resolves.toEqual({
      count: 1,
      results: [adminArticle],
    });
    await expect(contentService.employerGetBlogs({ page: 3 })).resolves.toEqual({
      count: 1,
      results: [employerBlog],
    });
  });

  it('unwraps nested article detail envelopes for public, admin, and employer detail pages', async () => {
    const publicArticle = { id: 11, title: 'Public detail', slug: 'public-detail' };
    const adminArticle = { id: 12, title: 'Admin detail', slug: 'admin-detail' };
    const employerBlog = { id: 13, title: 'Employer detail', slug: 'employer-detail' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: publicArticle } })
      .mockResolvedValueOnce({ data: { data: adminArticle } })
      .mockResolvedValueOnce({ data: { data: employerBlog } });

    await expect(contentService.getPublicArticleBySlug('public-detail')).resolves.toEqual(publicArticle);
    await expect(contentService.adminGetArticle(12)).resolves.toEqual(adminArticle);
    await expect(contentService.employerGetBlog(13)).resolves.toEqual(employerBlog);
  });

  it('normalizes empty successful content action responses', async () => {
    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ data: null });

    await expect(contentService.sendSMSDownloadApp({ phone: '0901234567' })).resolves.toEqual({ sent: true });
    await expect(contentService.sendNotificationDemo()).resolves.toEqual({ success: true });
  });

  it('unwraps nested content action response messages', async () => {
    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { message: 'SMS download link queued' } } })
      .mockResolvedValueOnce({ data: { data: { message: 'Demo notification queued' } } });

    await expect(contentService.sendSMSDownloadApp({ phone: '0901234567' })).resolves.toEqual({
      sent: true,
      message: 'SMS download link queued',
    });
    await expect(contentService.sendNotificationDemo()).resolves.toEqual({
      success: true,
      message: 'Demo notification queued',
    });
  });

  it('unwraps nested content create and update response envelopes', async () => {
    const feedback = { id: 21, content: 'Great hiring experience', rating: 5 };
    const adminCreated = { id: 22, title: 'Admin created', slug: 'admin-created' };
    const employerCreated = { id: 23, title: 'Employer created', slug: 'employer-created' };
    const adminUpdated = { id: 22, title: 'Admin updated', slug: 'admin-created' };
    const employerUpdated = { id: 23, title: 'Employer updated', slug: 'employer-created' };

    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: feedback } })
      .mockResolvedValueOnce({ data: { data: adminCreated } })
      .mockResolvedValueOnce({ data: { data: employerCreated } });
    (httpRequest.patch as jest.Mock)
      .mockResolvedValueOnce({ data: { data: adminUpdated } })
      .mockResolvedValueOnce({ data: { data: employerUpdated } });

    await expect(contentService.createFeedback({ rating: 5, content: 'Great hiring experience' })).resolves.toEqual(feedback);
    await expect(contentService.adminCreateArticle({ title: 'Admin created', content: 'Body' })).resolves.toEqual(adminCreated);
    await expect(contentService.employerCreateBlog({ title: 'Employer created', content: 'Body' })).resolves.toEqual(employerCreated);
    await expect(contentService.adminUpdateArticle(22, { title: 'Admin updated' })).resolves.toEqual(adminUpdated);
    await expect(contentService.employerUpdateBlog(23, { title: 'Employer updated' })).resolves.toEqual(employerUpdated);
  });

  it('keeps article timestamp fields aligned with camelized API responses', () => {
    const serviceSource = readFileSync(join(process.cwd(), 'src/services/contentService.ts'), 'utf8');
    const newsPageSource = readFileSync(join(process.cwd(), 'src/views/defaultPages/NewsPage/index.tsx'), 'utf8');
    const detailPageSource = readFileSync(
      join(process.cwd(), 'src/views/defaultPages/NewsPage/ArticleDetailPage.tsx'),
      'utf8'
    );

    expect(serviceSource).toContain('createAt?: string;');
    expect(serviceSource).toContain('updateAt?: string;');
    expect(newsPageSource).toContain('article.publishedAt || article.createAt || article.updateAt');
    expect(detailPageSource).toContain('article.publishedAt || article.createAt || article.updateAt');
    expect(`${serviceSource}\n${newsPageSource}\n${detailPageSource}`).not.toMatch(/article\.create_at|article\.update_at|create_at\?: string|update_at\?: string/);
  });
});
