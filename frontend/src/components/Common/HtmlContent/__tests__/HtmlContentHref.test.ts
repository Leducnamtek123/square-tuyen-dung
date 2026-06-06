import { getSafeHtmlHref, getSafeHtmlImageSrc } from '../index';

describe('HtmlContent link href safety', () => {
  it('does not generate placeholder hrefs for missing links', () => {
    expect(getSafeHtmlHref(null)).toBeUndefined();
    expect(getSafeHtmlHref('')).toBeUndefined();
    expect(getSafeHtmlHref('   ')).toBeUndefined();
  });

  it('blocks script/data protocols in rendered HTML links', () => {
    expect(getSafeHtmlHref('javascript:alert(1)')).toBeUndefined();
    expect(getSafeHtmlHref('JaVaScRiPt:alert(1)')).toBeUndefined();
    expect(getSafeHtmlHref('java\nscript:alert(1)')).toBeUndefined();
    expect(getSafeHtmlHref('vbscript:msgbox(1)')).toBeUndefined();
    expect(getSafeHtmlHref('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('keeps safe absolute and relative links', () => {
    expect(getSafeHtmlHref('https://square.vn/jobs')).toBe('https://square.vn/jobs');
    expect(getSafeHtmlHref('mailto:hr@square.vn')).toBe('mailto:hr@square.vn');
    expect(getSafeHtmlHref('/viec-lam')).toBe('/viec-lam');
    expect(getSafeHtmlHref('#benefits')).toBe('#benefits');
  });
});

describe('HtmlContent image src safety', () => {
  it('does not render images with missing sources', () => {
    expect(getSafeHtmlImageSrc(null)).toBeUndefined();
    expect(getSafeHtmlImageSrc('')).toBeUndefined();
    expect(getSafeHtmlImageSrc('   ')).toBeUndefined();
  });

  it('blocks script/data protocols in rendered HTML images', () => {
    expect(getSafeHtmlImageSrc('javascript:alert(1)')).toBeUndefined();
    expect(getSafeHtmlImageSrc('java\nscript:alert(1)')).toBeUndefined();
    expect(getSafeHtmlImageSrc('vbscript:msgbox(1)')).toBeUndefined();
    expect(getSafeHtmlImageSrc('data:image/svg+xml,<svg onload=alert(1)>')).toBeUndefined();
  });

  it('keeps safe absolute and relative image sources', () => {
    expect(getSafeHtmlImageSrc('https://cdn.square.vn/article.png')).toBe('https://cdn.square.vn/article.png');
    expect(getSafeHtmlImageSrc('/images/article.png')).toBe('/images/article.png');
  });
});
