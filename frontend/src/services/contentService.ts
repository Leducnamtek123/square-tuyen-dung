import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { Banner, Feedback } from '../types/models';
import { cleanParams } from '../utils/params';


const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as T;
};

interface FeedbackPayload {
  rating: number;
  content: string;
}

interface SMSDownloadAppPayload {
  phone: string;
}

type BannerListParams = {
  type?: number | string;
  platform?: string;
  isActive?: boolean;
};

const toListData = <T>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  const obj = (raw || {}) as { results?: unknown[]; data?: unknown[] };
  if (Array.isArray(obj.results)) return obj.results as T[];
  if (Array.isArray(obj.data)) return obj.data as T[];
  return [];
};

// ─── Article Types ────────────────────────────────────────────────────────────

export type ArticleCategory = 'news' | 'blog';
export type ArticleStatus = 'draft' | 'pending' | 'published' | 'archived';

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string | null;
  category: ArticleCategory;
  status: ArticleStatus;
  statusDisplay?: string;
  authorName: string | null;
  publishedAt: string | null;
  viewCount: number;
  tagList: string[];
  content?: string;
  tags?: string;
  thumbnail?: number | null;
  create_at?: string;
  update_at?: string;
}

export interface ArticleListParams {
  category?: ArticleCategory;
  status?: ArticleStatus;
  search?: string;
  tag?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}

export interface ArticlePayload {
  title: string;
  excerpt?: string;
  content: string;
  category?: ArticleCategory;
  status?: ArticleStatus;
  tags?: string;
  thumbnail?: number | null;
  slug?: string;
}

export interface PaginatedArticles {
  results: Article[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ─── Content Service ──────────────────────────────────────────────────────────

const contentService = {
  getFeedbacks: async (): Promise<Feedback[]> => {
    const url = 'content/web/feedbacks/';
    const response = await httpRequest.get(url);
    return toListData<Feedback>(response);
  },

  createFeedback: (data: FeedbackPayload): Promise<Feedback> => {
    const url = 'content/web/feedbacks/';
    return httpRequest.post(url, data) as Promise<Feedback>;
  },

  sendSMSDownloadApp: (data: SMSDownloadAppPayload): Promise<{ sent?: boolean; message?: string }> => {
    const url = 'content/web/sms-download-app/';
    return httpRequest.post(url, data) as Promise<{ sent?: boolean; message?: string }>;
  },

  getBanners: async (params: BannerListParams = {}): Promise<Banner[]> => {
    const url = 'content/web/banner/';
    const response = await withPresign(httpRequest.get(url, { params: cleanParams(params) }));
    return toListData<Banner>(response);
  },

  sendNotificationDemo: (): Promise<{ success?: boolean; message?: string }> => {
    const url = 'content/send-noti-demo/';
    return httpRequest.post(url);
  },

  // ─── Public Article API ──────────────────────────────────────────────────

  getPublicArticles: async (params: ArticleListParams = {}): Promise<PaginatedArticles> => {
    const response = await httpRequest.get('content/web/articles/', { params: cleanParams(params) });
    const raw = response as PaginatedArticles & { data?: PaginatedArticles };
    if (raw && typeof raw === 'object' && 'data' in raw) return (raw as { data: PaginatedArticles }).data;
    return raw as PaginatedArticles;
  },

  getPublicArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await httpRequest.get(`content/web/articles/${slug}/`);
    const raw = response as Article & { data?: Article };
    if (raw && typeof raw === 'object' && 'data' in raw) return (raw as { data: Article }).data;
    return raw as Article;
  },

  // ─── Admin Article API ───────────────────────────────────────────────────

  adminGetArticles: async (params: ArticleListParams = {}): Promise<PaginatedArticles> => {
    const response = await httpRequest.get('content/web/admin/articles/', { params: cleanParams(params) });
    const raw = response as PaginatedArticles & { data?: PaginatedArticles };
    if (raw && typeof raw === 'object' && 'data' in raw) return (raw as { data: PaginatedArticles }).data;
    return raw as PaginatedArticles;
  },

  adminGetArticle: async (id: number): Promise<Article> => {
    const response = await httpRequest.get(`content/web/admin/articles/${id}/`);
    const raw = response as Article & { data?: Article };
    if (raw && typeof raw === 'object' && 'data' in raw) return (raw as { data: Article }).data;
    return raw as Article;
  },

  adminCreateArticle: (data: ArticlePayload, thumbnailFile?: File): Promise<Article> => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (thumbnailFile) form.append('thumbnailFile', thumbnailFile);
    return httpRequest.post('content/web/admin/articles/', form) as Promise<Article>;
  },

  adminUpdateArticle: (id: number, data: Partial<ArticlePayload>, thumbnailFile?: File): Promise<Article> => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (thumbnailFile) form.append('thumbnailFile', thumbnailFile);
    return httpRequest.patch(`content/web/admin/articles/${id}/`, form) as Promise<Article>;
  },

  adminDeleteArticle: (id: number): Promise<void> => {
    return httpRequest.delete(`content/web/admin/articles/${id}/`) as Promise<void>;
  },

  // ─── Employer Article (Blog) API ─────────────────────────────────────────

  employerGetBlogs: async (params: ArticleListParams = {}): Promise<PaginatedArticles> => {
    const response = await httpRequest.get('content/web/employer/articles/', { params: cleanParams(params) });
    const raw = response as PaginatedArticles & { data?: PaginatedArticles };
    if (raw && typeof raw === 'object' && 'data' in raw) return (raw as { data: PaginatedArticles }).data;
    return raw as PaginatedArticles;
  },

  employerGetBlog: async (id: number): Promise<Article> => {
    const response = await httpRequest.get(`content/web/employer/articles/${id}/`);
    const raw = response as Article & { data?: Article };
    if (raw && typeof raw === 'object' && 'data' in raw) return (raw as { data: Article }).data;
    return raw as Article;
  },

  employerCreateBlog: (data: ArticlePayload, thumbnailFile?: File): Promise<Article> => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (thumbnailFile) form.append('thumbnailFile', thumbnailFile);
    return httpRequest.post('content/web/employer/articles/', form) as Promise<Article>;
  },

  employerUpdateBlog: (id: number, data: Partial<ArticlePayload>, thumbnailFile?: File): Promise<Article> => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (thumbnailFile) form.append('thumbnailFile', thumbnailFile);
    return httpRequest.patch(`content/web/employer/articles/${id}/`, form) as Promise<Article>;
  },

  employerDeleteBlog: (id: number): Promise<void> => {
    return httpRequest.delete(`content/web/employer/articles/${id}/`) as Promise<void>;
  },
};

export default contentService;
