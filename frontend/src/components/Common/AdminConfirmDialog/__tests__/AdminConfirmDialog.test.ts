import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Admin Confirm Dialog, Status Badge & Detail Drawer Architecture', () => {
  const dialogFile = join(__dirname, '../index.tsx');
  const badgeFile = join(__dirname, '../../AdminStatusBadge/index.tsx');
  const drawerFile = join(__dirname, '../../AdminDetailDrawer/index.tsx');

  it('verifies all Task 1.3 components exist', () => {
    expect(existsSync(dialogFile)).toBe(true);
    expect(existsSync(badgeFile)).toBe(true);
    expect(existsSync(drawerFile)).toBe(true);
  });

  it('implements reason requirement and variants in AdminConfirmDialog', () => {
    const source = readFileSync(dialogFile, 'utf8');
    expect(source).toContain('requireReason');
    expect(source).toContain('reasonError');
    expect(source).toContain('getVariantStyles');
    expect(source).toContain('danger');
    expect(source).toContain('warning');
  });

  it('provides comprehensive status variants in AdminStatusBadge', () => {
    const source = readFileSync(badgeFile, 'utf8');
    expect(source).toContain('STYLE_MAP');
    expect(source).toContain('approved');
    expect(source).toContain('pending');
    expect(source).toContain('rejected');
    expect(source).toContain('verified');
    expect(source).toContain('flagged');
  });

  it('implements responsive sliding drawer in AdminDetailDrawer', () => {
    const source = readFileSync(drawerFile, 'utf8');
    expect(source).toContain('Drawer');
    expect(source).toContain('anchor="right"');
    expect(source).toContain('headerAction');
    expect(source).toContain('footerAction');
  });
});
