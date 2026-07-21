import { readFileSync } from 'fs';
import { join } from 'path';

const listSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const formSource = readFileSync(join(__dirname, '../AdminArticleFormPage.tsx'), 'utf8');

const fixedKeys = [
  'pages.articles.title',
  'pages.articles.subtitle',
  'pages.articles.newArticle',
  'pages.articles.filter.title',
  'pages.articles.filter.searchPlaceholder',
  'pages.articles.table.title',
  'pages.articles.table.category',
  'pages.articles.table.status',
  'pages.articles.table.author',
  'pages.articles.table.publishedAt',
  'pages.articles.table.viewCount',
  'pages.articles.table.actions',
  'pages.articles.actions.edit',
  'pages.articles.actions.delete',
  'pages.articles.actions.search',
  'pages.articles.actions.clearFilters',
  'pages.articles.actions.advancedFilters',
  'pages.articles.actions.saveDraft',
  'pages.articles.actions.publish',
  'pages.articles.actions.saving',
  'pages.articles.actions.changeImage',
  'pages.articles.actions.chooseImage',
  'pages.articles.actions.addTag',
  'pages.articles.categories.all',
  'pages.articles.categories.news',
  'pages.articles.categories.blog',
  'pages.articles.statuses.all',
  'pages.articles.statuses.draft',
  'pages.articles.statuses.pending',
  'pages.articles.statuses.published',
  'pages.articles.statuses.archived',
  'pages.articles.form.createTitle',
  'pages.articles.form.editTitle',
  'pages.articles.form.titleLabel',
  'pages.articles.form.titlePlaceholder',
  'pages.articles.form.excerptLabel',
  'pages.articles.form.excerptPlaceholder',
  'pages.articles.form.contentTitle',
  'pages.articles.form.publishSettings',
  'pages.articles.form.categoryLabel',
  'pages.articles.form.statusLabel',
  'pages.articles.form.thumbnailTitle',
  'pages.articles.form.thumbnailAria',
  'pages.articles.form.thumbnailAlt',
  'pages.articles.form.tagsTitle',
  'pages.articles.form.tagPlaceholder',
  'pages.articles.validation.titleRequired',
  'pages.articles.validation.titleMax',
  'pages.articles.validation.excerptMax',
  'pages.articles.validation.contentRequired',
  'pages.articles.validation.categoryInvalid',
  'pages.articles.validation.statusInvalid',
  'pages.articles.validation.tagsMax',
  'pages.articles.messages.loadError',
  'pages.articles.messages.deleteConfirm',
  'pages.articles.messages.deleteSuccess',
  'pages.articles.messages.deleteError',
  'pages.articles.messages.formLoadError',
  'pages.articles.messages.createSuccess',
  'pages.articles.messages.updateSuccess',
  'pages.articles.messages.saveError',
];

describe('ArticlesPage i18n', () => {
  it('does not hard-code toast or confirm copy in source', () => {
    [listSource, formSource].forEach((source) => {
      expect(source).not.toMatch(/toastMessages\.(success|error)\(['"`]/);
      expect(source).not.toMatch(/window\.confirm\(`[^`]+`/);
    });
  });

  it('uses admin locale keys for article list and form copy', () => {
    fixedKeys.forEach((key) => {
      expect(`${listSource}\n${formSource}`).toContain(`'${key}'`);
    });
  });

  it('has Vietnamese and English locale entries for article list and form copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      const path = key.replace('pages.', '').split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale.pages
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
