import { readFileSync } from 'fs';
import { join } from 'path';

const listSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const formSource = readFileSync(join(__dirname, '../EmployerBlogFormPage.tsx'), 'utf8');

const fixedKeys = [
  'blog.title',
  'blog.subtitle',
  'blog.newPost',
  'blog.reviewNotice',
  'blog.filter.title',
  'blog.filter.searchPlaceholder',
  'blog.table.title',
  'blog.table.status',
  'blog.table.publishedAt',
  'blog.table.viewCount',
  'blog.table.actions',
  'blog.actions.edit',
  'blog.actions.delete',
  'blog.actions.search',
  'blog.actions.clearFilters',
  'blog.actions.advancedFilters',
  'blog.actions.saveDraft',
  'blog.actions.submitReview',
  'blog.actions.submitting',
  'blog.actions.changeImage',
  'blog.actions.chooseImage',
  'blog.actions.addTag',
  'blog.statuses.all',
  'blog.statuses.draft',
  'blog.statuses.pending',
  'blog.statuses.published',
  'blog.form.createTitle',
  'blog.form.editTitle',
  'blog.form.reviewHint',
  'blog.form.titleLabel',
  'blog.form.titlePlaceholder',
  'blog.form.excerptLabel',
  'blog.form.excerptPlaceholder',
  'blog.form.contentTitle',
  'blog.form.thumbnailTitle',
  'blog.form.thumbnailAria',
  'blog.form.thumbnailAlt',
  'blog.form.tagsTitle',
  'blog.form.tagPlaceholder',
  'blog.validation.titleRequired',
  'blog.validation.contentRequired',
  'blog.messages.loadError',
  'blog.messages.deleteConfirm',
  'blog.messages.deleteSuccess',
  'blog.messages.deleteError',
  'blog.messages.formLoadError',
  'blog.messages.createDraftSuccess',
  'blog.messages.createReviewSuccess',
  'blog.messages.updateDraftSuccess',
  'blog.messages.updateReviewSuccess',
  'blog.messages.saveError',
];

describe('BlogPage i18n', () => {
  it('does not hard-code toast or confirm copy in source', () => {
    [listSource, formSource].forEach((source) => {
      expect(source).not.toMatch(/toastMessages\.(success|error)\(['"`]/);
      expect(source).not.toMatch(/window\.confirm\(`[^`]+`/);
    });
  });

  it('uses employer locale keys for blog list and form copy', () => {
    fixedKeys.forEach((key) => {
      expect(`${listSource}\n${formSource}`).toContain(`'${key}'`);
    });
  });

  it('has Vietnamese and English locale entries for blog list and form copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/employer.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/employer.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      const path = key.split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
