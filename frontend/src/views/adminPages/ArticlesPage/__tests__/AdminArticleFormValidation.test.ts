import { readFileSync } from 'fs';
import { join } from 'path';

import {
  getAdminArticleFormValidationErrors,
  type AdminArticleFormValidationData,
} from '../articleFormValidation';

const validArticleForm: AdminArticleFormValidationData = {
  title: 'Recruitment market update',
  excerpt: 'Short summary',
  content: '<p>Article content</p>',
  category: 'news',
  articleStatus: 'draft',
  tags: 'hiring,market',
};

describe('getAdminArticleFormValidationErrors', () => {
  it('accepts values that match the backend Article model contract', () => {
    expect(getAdminArticleFormValidationErrors(validArticleForm)).toEqual({});
  });

  it('rejects title, excerpt, content and tags values the backend would reject', () => {
    expect(
      getAdminArticleFormValidationErrors({
        ...validArticleForm,
        title: 'A'.repeat(256),
        excerpt: 'E'.repeat(501),
        content: '<p><br></p>',
        tags: 'T'.repeat(501),
      }),
    ).toEqual({
      title: 'titleMax',
      excerpt: 'excerptMax',
      content: 'contentRequired',
      tags: 'tagsMax',
    });
  });

  it('rejects category and status values outside backend choices', () => {
    expect(
      getAdminArticleFormValidationErrors({
        ...validArticleForm,
        category: 'invalid',
        articleStatus: 'invalid',
      }),
    ).toEqual({
      category: 'categoryInvalid',
      articleStatus: 'statusInvalid',
    });
  });

  it('wires validation errors into the admin article form page', () => {
    const source = readFileSync(join(__dirname, '../AdminArticleFormPage.tsx'), 'utf8');

    expect(source).toContain('getAdminArticleFormValidationErrors');
    expect(source).toContain("getArticleValidationText('title')");
    expect(source).toContain("getArticleValidationText('excerpt')");
    expect(source).toContain("getArticleValidationText('content')");
    expect(source).toContain("getArticleValidationText('category')");
    expect(source).toContain("getArticleValidationText('articleStatus')");
    expect(source).toContain("getArticleValidationText('tags')");
    expect(source).toContain('disabled={saving || hasValidationErrors}');
  });
});
