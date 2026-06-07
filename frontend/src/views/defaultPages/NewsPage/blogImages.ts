import type { Article } from '@/services/contentService';

export const BLOG_IMAGES = {
  hero: '/images/blog/blog-hero-square-recruitment.jpg',
  realEstate: '/images/blog/blog-real-estate-consultant.jpg',
  construction: '/images/blog/blog-construction-site-hiring.jpg',
  interior: '/images/blog/blog-interior-design-team.jpg',
  architecture: '/images/blog/blog-architecture-portfolio.jpg',
  interview: '/images/blog/blog-ai-interview.jpg',
  skills: '/images/blog/blog-candidate-skills.jpg',
} as const;

const fallbackImageCycle = [
  BLOG_IMAGES.realEstate,
  BLOG_IMAGES.construction,
  BLOG_IMAGES.interior,
  BLOG_IMAGES.architecture,
  BLOG_IMAGES.interview,
  BLOG_IMAGES.skills,
] as const;

const normalizeForMatch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const getArticleImage = (
  article: Pick<Article, 'thumbnailUrl' | 'tagList' | 'category'>,
  index = 0
) => {
  if (article.thumbnailUrl) return article.thumbnailUrl;

  const tags = article.tagList?.map(normalizeForMatch) || [];
  if (tags.some((tag) => tag.includes('bat dong san'))) return BLOG_IMAGES.realEstate;
  if (tags.some((tag) => tag.includes('xay dung'))) return BLOG_IMAGES.construction;
  if (tags.some((tag) => tag.includes('noi that'))) return BLOG_IMAGES.interior;
  if (tags.some((tag) => tag.includes('kien truc'))) return BLOG_IMAGES.architecture;
  if (tags.some((tag) => tag.includes('phong van'))) return BLOG_IMAGES.interview;
  if (tags.some((tag) => tag.includes('ky nang') || tag.includes('portfolio'))) return BLOG_IMAGES.skills;

  return fallbackImageCycle[index % fallbackImageCycle.length];
};

export const withArticleImages = (articles: Article[]) =>
  articles.map((article, index) => ({
    ...article,
    thumbnailUrl: getArticleImage(article, index),
  }));
