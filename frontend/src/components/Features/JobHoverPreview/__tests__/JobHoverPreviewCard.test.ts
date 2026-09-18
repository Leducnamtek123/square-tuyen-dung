import { readFileSync } from 'fs';
import { join } from 'path';

const cardSource = readFileSync(join(__dirname, '../JobHoverPreviewCard.tsx'), 'utf8');
const hookSource = readFileSync(join(__dirname, '../useJobHoverPreview.ts'), 'utf8');

describe('JobHoverPreview Feature Component & Hook', () => {
  it('JobHoverPreviewCard defines full Vieclam24h style job preview popover', () => {
    expect(cardSource).toContain('JobHoverPreviewCard');
    expect(cardSource).toContain('Popper');
    expect(cardSource).toContain('salaryText');
    expect(cardSource).toContain('Mô tả công việc');
    expect(cardSource).toContain('Yêu cầu công việc');
    expect(cardSource).toContain('Quyền lợi được hưởng');
    expect(cardSource).toContain('Xem chi tiết');
    expect(cardSource).toContain('Ứng tuyển ngay');
  });

  it('cleanHtmlToLines helper properly parses HTML to clean readable bullet points', () => {
    expect(cardSource).toContain('cleanHtmlToLines');
    expect(cardSource).toContain('replace(/<[^>]+>/g');
  });

  it('useJobHoverPreview hook manages debounce, grace periods and popper mouse events', () => {
    expect(hookSource).toContain('useJobHoverPreview');
    expect(hookSource).toContain('handleCardMouseEnter');
    expect(hookSource).toContain('handleCardMouseLeave');
    expect(hookSource).toContain('handlePopperMouseEnter');
    expect(hookSource).toContain('handlePopperMouseLeave');
  });
});
