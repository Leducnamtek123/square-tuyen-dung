import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateSidebar Navigation Configuration', () => {
  const sidebarPath = join(__dirname, '../CandidateSidebar.tsx');
  const source = readFileSync(sidebarPath, 'utf8');

  it('imports TrendingUpOutlinedIcon for salary navigation', () => {
    expect(source).toContain("import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';");
  });

  it('defines salary menu item with Tra cứu lương and /tra-cuu-luong', () => {
    expect(source).toContain("key: 'salary'");
    expect(source).toContain("label: 'Tra cứu lương'");
    expect(source).toContain("rawPath: '/tra-cuu-luong'");
  });

  it('places Tra cứu lương directly under Phỏng vấn thử and above Cài đặt tài khoản', () => {
    const practiceIndex = source.indexOf("key: 'practice'");
    const salaryIndex = source.indexOf("key: 'salary'");
    const accountIndex = source.indexOf("key: 'account'");

    expect(practiceIndex).toBeGreaterThan(0);
    expect(salaryIndex).toBeGreaterThan(practiceIndex);
    expect(accountIndex).toBeGreaterThan(salaryIndex);
  });

  it('handles active route matching for /tra-cuu-luong and /salary', () => {
    expect(source).toContain("case 'salary':");
    expect(source).toContain("cleanPathname.includes('/tra-cuu-luong')");
    expect(source).toContain("cleanPathname.includes('/salary')");
  });

  it('uses accurate Vietnamese typography for interview navigation', () => {
    expect(source).toMatch(/label:\s*'(?:Lịch phỏng vấn tuyển dụng|Phỏng vấn của tôi)'/);
    expect(source).not.toContain("label: 'Phòng vấn của tôi'");
  });

  describe('Desktop Sticky Sidebar Scrolling Behavior', () => {
    it('applies position sticky to desktop sidebar nav', () => {
      expect(source).toContain("position: 'sticky'");
    });

    it('calculates dynamic top offset based on viewport and sidebar height', () => {
      expect(source).toContain("min(88px, calc(100dvh - ");
      expect(source).toContain("calc(100dvh - ${sidebarHeight}px - 24px)");
    });

    it('observes sidebar height dynamically using ResizeObserver', () => {
      expect(source).toContain('new ResizeObserver');
      expect(source).toContain('ro.observe(el)');
    });

    it('preserves responsive layout without sticky sidebar on mobile devices', () => {
      expect(source).toContain("display: { xs: 'none', md: 'flex' }");
      expect(source).toContain("display: { xs: 'flex', md: 'none' }");
    });
  });
});

