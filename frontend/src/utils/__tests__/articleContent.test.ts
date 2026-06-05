import { hasArticleTextContent } from '../articleContent';

describe('hasArticleTextContent', () => {
  it('rejects empty rich-text HTML wrappers', () => {
    expect(hasArticleTextContent('')).toBe(false);
    expect(hasArticleTextContent('<p><br></p>')).toBe(false);
    expect(hasArticleTextContent('<p>&nbsp;</p>')).toBe(false);
  });

  it('accepts rich-text HTML with visible text', () => {
    expect(hasArticleTextContent('<p>Article content</p>')).toBe(true);
  });
});
