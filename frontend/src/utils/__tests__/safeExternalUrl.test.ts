import { getSafeExternalOpenUrl, getSafeResourceUrl, openExternalUrlSafely, openResourceUrlSafely } from '../safeExternalUrl';

describe('safeExternalUrl', () => {
  it('keeps safe absolute and relative urls', () => {
    expect(getSafeExternalOpenUrl('https://example.com/file.pdf')).toBe('https://example.com/file.pdf');
    expect(getSafeExternalOpenUrl('/uploads/file.pdf')).toBe('/uploads/file.pdf');
    expect(getSafeExternalOpenUrl('#section')).toBe('#section');
  });

  it('rejects script-like protocols even when obfuscated with whitespace', () => {
    expect(getSafeExternalOpenUrl('javascript:alert(1)')).toBeUndefined();
    expect(getSafeExternalOpenUrl(' java\nscript:alert(1)')).toBeUndefined();
    expect(getSafeExternalOpenUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(getSafeExternalOpenUrl('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('keeps resource urls stricter than external open urls', () => {
    expect(getSafeResourceUrl('https://cdn.example.com/resume.pdf')).toBe('https://cdn.example.com/resume.pdf');
    expect(getSafeResourceUrl('/uploads/resume.pdf')).toBe('/uploads/resume.pdf');
    expect(getSafeResourceUrl('blob:https://example.com/123')).toBe('blob:https://example.com/123');
    expect(getSafeResourceUrl('mailto:candidate@example.com')).toBeUndefined();
    expect(getSafeResourceUrl('tel:0900000000')).toBeUndefined();
    expect(getSafeResourceUrl('#resume')).toBeUndefined();
    expect(getSafeResourceUrl('data:application/pdf;base64,JVBERi0=')).toBeUndefined();
  });

  it('opens safe urls with noopener and noreferrer', () => {
    const originalWindow = global.window;
    const open = jest.fn();
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: { open },
    });

    expect(openExternalUrlSafely('https://example.com/file.pdf')).toBe(true);
    expect(open).toHaveBeenCalledWith('https://example.com/file.pdf', '_blank', 'noopener,noreferrer');

    Object.defineProperty(global, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('opens resource urls with the resource URL contract', () => {
    const originalWindow = global.window;
    const open = jest.fn();
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: { open },
    });

    expect(openResourceUrlSafely('blob:https://example.com/123')).toBe(true);
    expect(open).toHaveBeenCalledWith('blob:https://example.com/123', '_blank', 'noopener,noreferrer');

    expect(openResourceUrlSafely('mailto:candidate@example.com')).toBe(false);
    expect(open).toHaveBeenCalledTimes(1);

    Object.defineProperty(global, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('does not open unsafe urls', () => {
    const originalWindow = global.window;
    const open = jest.fn();
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: { open },
    });

    expect(openExternalUrlSafely('javascript:alert(1)')).toBe(false);
    expect(open).not.toHaveBeenCalled();

    Object.defineProperty(global, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });
});
