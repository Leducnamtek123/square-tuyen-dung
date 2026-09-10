import { SalaryBenchmarkItem } from '@/types/models';

describe('SalaryBenchmarkPage data formatting and calculations', () => {
  const mockBenchmarks: SalaryBenchmarkItem[] = [
    {
      id: 1,
      job_title: 'Kỹ sư giám sát thi công công trình',
      category: 'Xây dựng & Bất động sản',
      seniority: 'middle',
      min_salary: 15000000,
      median_salary: 22000000,
      max_salary: 32000000,
      currency: 'VND',
      year: 2026,
      sample_size: 1420,
      source_notes: 'Dữ liệu khảo sát từ các tổng thầu xây dựng cấp 1',
    },
    {
      id: 2,
      job_title: 'Kiến trúc sư chủ trì thiết kế',
      category: 'Thiết kế kiến trúc & Nội thất',
      seniority: 'senior',
      min_salary: 25000000,
      median_salary: 38000000,
      max_salary: 55000000,
      currency: 'VND',
      year: 2026,
      sample_size: 890,
      source_notes: 'Studio thiết kế kiến trúc cao cấp & quy hoạch đô thị',
    },
    {
      id: 3,
      job_title: 'Frontend Engineer (React / Next.js)',
      category: 'Công nghệ thông tin',
      seniority: 'junior',
      min_salary: 10000000,
      median_salary: 16500000,
      max_salary: 24000000,
      currency: 'VND',
      year: 2026,
      sample_size: 2310,
    },
  ];

  // Helper formatting millions
  const formatCurrencyMillions = (val: number) => {
    const millions = (val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1);
    return `${millions} Tr`;
  };

  // Helper seniority resolution
  const getSeniorityBadge = (seniority?: string) => {
    switch (seniority) {
      case 'senior':
      case 'lead':
        return { label: 'Senior / Quản lý', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'middle':
        return { label: 'Trung cấp (1-3 năm)', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
      default:
        return { label: 'Junior / Mới bắt đầu', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
  };

  test('formats salary values into millions (VND) concisely', () => {
    expect(formatCurrencyMillions(15000000)).toBe('15 Tr');
    expect(formatCurrencyMillions(22000000)).toBe('22 Tr');
    expect(formatCurrencyMillions(16500000)).toBe('16.5 Tr');
    expect(formatCurrencyMillions(38000000)).toBe('38 Tr');
  });

  test('calculates median salary relative percentage position correctly', () => {
    const calculateMedianPercent = (item: SalaryBenchmarkItem) => {
      const span = item.max_salary - item.min_salary;
      return span > 0 ? Math.round(((item.median_salary - item.min_salary) / span) * 100) : 50;
    };

    // item 1: (22M - 15M) / (32M - 15M) = 7 / 17 ≈ 41%
    expect(calculateMedianPercent(mockBenchmarks[0])).toBe(41);

    // item 2: (38M - 25M) / (55M - 25M) = 13 / 30 ≈ 43%
    expect(calculateMedianPercent(mockBenchmarks[1])).toBe(43);

    // item 3: (16.5M - 10M) / (24M - 10M) = 6.5 / 14 ≈ 46%
    expect(calculateMedianPercent(mockBenchmarks[2])).toBe(46);
  });

  test('maps seniority levels accurately to display labels', () => {
    expect(getSeniorityBadge('junior').label).toBe('Junior / Mới bắt đầu');
    expect(getSeniorityBadge('middle').label).toBe('Trung cấp (1-3 năm)');
    expect(getSeniorityBadge('senior').label).toBe('Senior / Quản lý');
    expect(getSeniorityBadge('lead').label).toBe('Senior / Quản lý');
  });

  test('filters salary benchmarks by category, seniority and search keyword', () => {
    // Filter by category
    const archItems = mockBenchmarks.filter(b => b.category === 'Thiết kế kiến trúc & Nội thất');
    expect(archItems).toHaveLength(1);
    expect(archItems[0].job_title).toBe('Kiến trúc sư chủ trì thiết kế');

    // Filter by seniority
    const juniorItems = mockBenchmarks.filter(b => b.seniority === 'junior');
    expect(juniorItems).toHaveLength(1);
    expect(juniorItems[0].min_salary).toBe(10000000);

    // Filter by search keyword
    const keyword = 'giám sát';
    const searchedItems = mockBenchmarks.filter(b =>
      b.job_title.toLowerCase().includes(keyword.toLowerCase())
    );
    expect(searchedItems).toHaveLength(1);
    expect(searchedItems[0].id).toBe(1);
  });

  test('generates direct transition links to practice page with pre-filled query params', () => {
    const buildPracticeLink = (item: SalaryBenchmarkItem) => {
      return `/practice?category=${encodeURIComponent(item.category)}&search=${encodeURIComponent(item.job_title)}`;
    };

    const link = buildPracticeLink(mockBenchmarks[0]);
    expect(link).toContain('/practice?category=');
    expect(link).toContain(encodeURIComponent('Xây dựng & Bất động sản'));
    expect(link).toContain(encodeURIComponent('Kỹ sư giám sát thi công công trình'));
  });
});
