import { readFileSync } from 'fs';
import { join } from 'path';

describe('UI Polish & Micro-Interaction Audit Suite', () => {
  describe('SidebarHeader Breathing Room and Alignment', () => {
    const filePath = join(__dirname, '../../components/Features/Chats/SidebarHeader/index.tsx');
    const source = readFileSync(filePath, 'utf8');

    it('ensures visual breathing room between interactive controls and divider', () => {
      expect(source).toContain('pb: 1.75');
      expect(source).toContain("<Divider sx={{ borderColor: '#e2e8f0' }} />");
    });

    it('ensures logo has no asymmetrical bottom margin offsetting alignment', () => {
      expect(source).not.toContain('mb: 1');
      expect(source).toContain("display: 'block'");
    });

    it('ensures LanguageSwitcher and Chip share matched 36px height with reserved borders', () => {
      expect(source).toContain('<LanguageSwitcher size="small" />');
      expect(source).toContain('height: 36');
      expect(source).toContain("border: '1px solid #e2e8f0'");
      expect(source).toContain("borderRadius: '10px'");
    });
  });

  describe('LanguageSwitcher Layout Stability', () => {
    const filePath = join(__dirname, '../components/commons/LanguageSwitcher/index.tsx');
    const source = readFileSync(filePath, 'utf8');

    it('reserves transparent border to prevent layout shift on hover or focus', () => {
      expect(source).toContain("border: '1px solid transparent'");
      expect(source).toContain("borderRadius: '10px'");
    });

    it('supports small and medium size variants with explicit height dimensions', () => {
      expect(source).toContain("size?: 'small' | 'medium'");
      expect(source).toContain("minHeight: size === 'small' ? 36 : 40");
      expect(source).toContain("height: size === 'small' ? 36 : 40");
    });
  });

  describe('Header Action Controls and Divider Contrast', () => {
    const headerPath = join(__dirname, '../components/commons/Header/index.tsx');
    const headerSource = readFileSync(headerPath, 'utf8');

    const workspaceMenuPath = join(__dirname, '../components/commons/WorkspaceSwitchMenu/index.tsx');
    const workspaceMenuSource = readFileSync(workspaceMenuPath, 'utf8');

    const accountMenuPath = join(__dirname, '../components/commons/AccountSwitchMenu/index.tsx');
    const accountMenuSource = readFileSync(accountMenuPath, 'utf8');

    it('ensures vertical divider has accessible border contrast on light header', () => {
      expect(headerSource).toContain("borderColor: 'rgba(226, 232, 240, 0.9)'");
      expect(headerSource).not.toContain('borderColor: "rgba(255, 255, 255, 0.3)"');
    });

    it('ensures WorkspaceSwitchMenu has visible border and stable hover styling', () => {
      expect(workspaceMenuSource).toContain('border: "1px solid #e2e8f0"');
      expect(workspaceMenuSource).toContain('borderRadius: "10px"');
      expect(workspaceMenuSource).toContain('height: 38');
    });

    it('ensures AccountSwitchMenu avoids layout-shifting translateY transforms', () => {
      expect(accountMenuSource).toContain("border: '1px solid #e2e8f0'");
      expect(accountMenuSource).toContain("borderRadius: '10px'");
      expect(accountMenuSource).toContain('height: 38');
      expect(accountMenuSource).not.toContain("transform: 'translateY(-1px)'");
    });
  });

  describe('ChatRoomSearch Input Polish', () => {
    const filePath = join(__dirname, '../../components/Features/Chats/ChatRoomSearch/index.tsx');
    const source = readFileSync(filePath, 'utf8');

    it('provides SearchRoundedIcon input adornment and 12px rounded borders', () => {
      expect(source).toContain('SearchRoundedIcon');
      expect(source).toContain("borderRadius: '12px'");
      expect(source).toContain("borderColor: '#e2e8f0'");
    });
  });
});
