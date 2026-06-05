import fs from 'fs';
import path from 'path';

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('admin pages camelized API response fields', () => {
  it('does not read feedback response fields with snake_case keys', () => {
    const source = readSource('FeedbacksPage/index.tsx');

    expect(source).not.toContain('fb.is_active');
    expect(source).not.toContain("accessorKey: 'is_active'");
    expect(source).not.toContain("accessorKey: 'create_at'");
    expect(source).toContain('fb.isActive');
    expect(source).toContain("id: 'is_active'");
    expect(source).toContain("id: 'create_at'");
  });

  it('does not read banner response fields with snake_case keys', () => {
    const pageSource = readSource('BannersPage/index.tsx');
    const columnSource = readSource('BannersPage/useBannersPageColumns.tsx');

    [
      'action.banner.button_text',
      'action.banner.button_link',
      'action.banner.is_show_button',
      'action.banner.is_active',
      'action.banner.description_location',
      'item.is_active',
      'item.web_aspect_ratio',
    ].forEach((forbidden) => expect(pageSource).not.toContain(forbidden));

    expect(columnSource).not.toContain("accessorKey: 'is_active'");
    expect(pageSource).toContain('action.banner.buttonText');
    expect(pageSource).toContain('action.banner.isActive');
    expect(columnSource).toContain("id: 'is_active'");
  });

  it('does not read banner type response fields with snake_case keys', () => {
    const source = readSource('BannerTypesPage/index.tsx');

    [
      'action.item.web_aspect_ratio',
      'action.item.mobile_aspect_ratio',
      'action.item.is_active',
      "accessorKey: 'web_aspect_ratio'",
      "accessorKey: 'is_active'",
    ].forEach((forbidden) => expect(source).not.toContain(forbidden));

    expect(source).toContain('action.item.webAspectRatio');
    expect(source).toContain('action.item.isActive');
    expect(source).toContain("id: 'web_aspect_ratio'");
    expect(source).toContain("id: 'is_active'");
  });
});
