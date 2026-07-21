import { readFileSync } from 'fs';
import { join } from 'path';

const newsPageSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const articleDetailSource = readFileSync(join(__dirname, '../ArticleDetailPage.tsx'), 'utf8');
const newsSources = `${newsPageSource}\n${articleDetailSource}`;

const fixedNewsKeys = [
  'news.category.all',
  'news.category.news',
  'news.category.blog',
  'news.categoryFallback',
  'news.topic.all',
  'news.topic.recruitment',
  'news.topic.realEstate',
  'news.topic.construction',
  'news.topic.interior',
  'news.topic.architecture',
  'news.topic.portfolio',
  'news.topic.skills',
  'news.views',
  'news.heroEyebrow',
  'news.heroTitle',
  'news.heroSubtitle',
  'news.viewAllArticles',
  'news.exploreJobs',
  'news.searchPlaceholder',
  'news.searchButton',
  'news.emptyTitle',
  'news.emptyContent',
  'news.quickReadTitle',
  'news.quickReadDescription',
  'news.currentFilter',
  'news.audienceTitle',
  'news.audienceDescription',
  'news.newJobsCta',
  'news.article.notFoundTitle',
  'news.article.notFoundContent',
  'news.article.backToNews',
  'news.article.backToList',
  'news.article.emptyContent',
  'news.article.infoTitle',
  'news.article.moreTitle',
  'news.article.moreDescription',
  'news.article.newsHomeCta',
];

const hardCodedVietnameseCopy = [
  'Tin tức & Blog tuyển dụng',
  'Tin tức và blog tuyển dụng dành cho ứng viên, nhà tuyển dụng',
  'Cập nhật xu hướng tuyển dụng',
  'Xem tất cả bài viết',
  'Khám phá việc làm',
  'Tìm bài viết, chủ đề hoặc từ khóa',
  'Chưa có bài viết phù hợp',
  'Góc đọc nhanh',
  'Dành cho ứng viên và nhà tuyển dụng',
  'Không tìm thấy bài viết',
  'Quay lại tin tức',
  'Quay về danh sách',
  'Nội dung đang được cập nhật.',
  'Thông tin bài viết',
  'Khám phá thêm',
  'Về trang tin tức',
];

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('News page i18n', () => {
  it('does not keep public news copy hard-coded in source', () => {
    hardCodedVietnameseCopy.forEach((copy) => {
      expect(newsSources).not.toContain(copy);
    });

    fixedNewsKeys.forEach((key) => {
      expect(newsSources).toContain(key);
    });
  });

  it('has Vietnamese and English locale entries for public news copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/public.json'), 'utf8'));

    fixedNewsKeys.forEach((key) => {
      expect(readKey(vi, key)).toEqual(expect.any(String));
      expect(readKey(en, key)).toEqual(expect.any(String));
    });
  });
});
