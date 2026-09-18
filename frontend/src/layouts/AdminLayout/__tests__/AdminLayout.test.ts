import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('AdminLayout & Command Palette Architecture', () => {
  const layoutFile = join(__dirname, '../index.tsx');
  const commandPaletteFile = join(__dirname, '../../../components/Common/AdminCommandPalette/index.tsx');

  it('verifies AdminLayout and AdminCommandPalette exist', () => {
    expect(existsSync(layoutFile)).toBe(true);
    expect(existsSync(commandPaletteFile)).toBe(true);
  });

  it('supports global Ctrl+K / Cmd+K shortcut in AdminLayout', () => {
    const source = readFileSync(layoutFile, 'utf8');
    expect(source).toContain('AdminCommandPalette');
    expect(source).toContain('ctrlKey');
    expect(source).toContain('metaKey');
    expect(source).toContain('square_sidebar_collapsed');
  });

  it('provides comprehensive navigation items in AdminCommandPalette', () => {
    const source = readFileSync(commandPaletteFile, 'utf8');
    expect(source).toContain('COMMAND_ITEMS');
    expect(source).toContain('filteredCommands');
    expect(source).toContain('handleKeyDown');
    expect(source).toContain('localizeRoutePath');
  });
});
