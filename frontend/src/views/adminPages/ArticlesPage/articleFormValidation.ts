import { hasArticleTextContent } from '@/utils/articleContent';

export type AdminArticleFormValidationData = {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  articleStatus?: string | null;
  tags?: string | null;
};

export type AdminArticleFormValidationErrors = Partial<Record<
  'title' | 'excerpt' | 'content' | 'category' | 'articleStatus' | 'tags',
  string
>>;

const ARTICLE_CATEGORIES = new Set(['news', 'blog']);
const ARTICLE_STATUSES = new Set(['draft', 'pending', 'published', 'archived']);

export const getAdminArticleFormValidationErrors = (
  formData: AdminArticleFormValidationData,
): AdminArticleFormValidationErrors => {
  const errors: AdminArticleFormValidationErrors = {};
  const title = String(formData.title ?? '').trim();
  const excerpt = String(formData.excerpt ?? '').trim();
  const content = String(formData.content ?? '');
  const category = String(formData.category ?? '').trim();
  const articleStatus = String(formData.articleStatus ?? '').trim();
  const tags = String(formData.tags ?? '').trim();

  if (!title) {
    errors.title = 'titleRequired';
  } else if (title.length > 255) {
    errors.title = 'titleMax';
  }

  if (excerpt.length > 500) {
    errors.excerpt = 'excerptMax';
  }

  if (!hasArticleTextContent(content)) {
    errors.content = 'contentRequired';
  }

  if (!ARTICLE_CATEGORIES.has(category)) {
    errors.category = 'categoryInvalid';
  }

  if (!ARTICLE_STATUSES.has(articleStatus)) {
    errors.articleStatus = 'statusInvalid';
  }

  if (tags.length > 500) {
    errors.tags = 'tagsMax';
  }

  return errors;
};
