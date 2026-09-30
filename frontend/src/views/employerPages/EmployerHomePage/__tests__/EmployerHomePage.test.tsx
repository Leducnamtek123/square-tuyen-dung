/**
 * @jest-environment jsdom
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { join } from 'path';
import EmployerHomePage from '../index';
import CandidateScorecardMockup from '../components/CandidateScorecardMockup';

// Mock Next.js navigation & Link
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/employer',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
});

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key,
    i18n: { language: 'vi' },
  }),
}));

// Mock GSAP
jest.mock('gsap', () => ({
  matchMedia: () => ({
    add: jest.fn(),
  }),
  timeline: () => ({
    fromTo: jest.fn().mockReturnThis(),
  }),
  fromTo: jest.fn(),
  set: jest.fn(),
  registerPlugin: jest.fn(),
}));

jest.mock('@gsap/react', () => ({
  useGSAP: (callback: () => void) => {
    callback();
  },
}));

describe('CandidateScorecardMockup Component', () => {
  it('renders realistic candidate info, position, and technical match score', () => {
    render(<CandidateScorecardMockup />);

    expect(
      screen.getByText('Nguyễn Văn Cường — Kỹ sư Giám sát MEP (4 năm KN)')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Chỉ huy phó MEP — Tòa nhà Cao ốc Văn phòng/i)
    ).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('Match Score Kỹ Thuật')).toBeInTheDocument();
  });

  it('renders the 3 verified credential and practical competency checklist items', () => {
    render(<CandidateScorecardMockup />);

    expect(
      screen.getByText('Chứng chỉ hành nghề Giám sát MEP Hạng II (Đã xác thực)')
    ).toBeInTheDocument();
    expect(screen.getByText('Thành thạo Revit MEP & Navisworks')).toBeInTheDocument();
    expect(
      screen.getByText('Sẵn sàng làm việc theo tiến độ công trường')
    ).toBeInTheDocument();
  });

  it('renders mini audio player with on-site scenario question and supports playback toggle', () => {
    render(<CandidateScorecardMockup />);

    expect(
      screen.getByText(/Quy trình xử lý xung đột ống gió HVAC với dầm bê tông cốt thép/i)
    ).toBeInTheDocument();

    const playBtn = screen.getByLabelText('Nghe câu trả lời của ứng viên');
    expect(playBtn).toBeInTheDocument();

    // Toggle play
    fireEvent.click(playBtn);
    expect(screen.getByLabelText('Tạm dừng nghe câu trả lời')).toBeInTheDocument();

    // Toggle pause
    fireEvent.click(screen.getByLabelText('Tạm dừng nghe câu trả lời'));
    expect(screen.getByLabelText('Nghe câu trả lời của ứng viên')).toBeInTheDocument();
  });

  it('renders qualification status badge and forwards scorecard to Project Director', () => {
    render(<CandidateScorecardMockup />);

    expect(
      screen.getByText('Đã qua sơ tuyển AILA AI — Đủ tiêu chuẩn phỏng vấn vòng 2')
    ).toBeInTheDocument();

    const forwardBtn = screen.getByRole('button', { name: /Chuyển Giám Đốc Dự Án Duyệt/i });
    expect(forwardBtn).toBeInTheDocument();

    fireEvent.click(forwardBtn);
    expect(screen.getByText(/Đã Gửi Tới Giám Đốc Dự Án Duyệt/i)).toBeInTheDocument();
  });
});

describe('EmployerHomePage View Component (Anti-Slop B2B Modern Technical)', () => {
  it('renders Hero section with direct problem-solving headline and operational metrics', () => {
    render(<EmployerHomePage />);

    // H1 Heading
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Đừng để bộ phận HR mất hàng tuần sàng lọc hàng trăm CV không đúng chuyên ngành/i,
      })
    ).toBeInTheDocument();

    // 2 Core CTAs
    expect(screen.getByRole('link', { name: /Đăng Ký Đăng Tuyển/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem Bảng Giá Dịch Vụ/i })).toBeInTheDocument();

    // Real operational metrics (no invented fake stats like 80% or 3.5x)
    expect(screen.getByText('Tiết kiệm 15-20 giờ')).toBeInTheDocument();
    expect(screen.getByText('100% hồ sơ chuyên ngành')).toBeInTheDocument();
    expect(screen.getByText('Nhận Scorecard trong 3 phút')).toBeInTheDocument();
  });

  it('renders Section 2: PartnerLogoCarousel marquee', () => {
    render(<EmployerHomePage />);
    expect(
      screen.getByText('ĐỒNG HÀNH CÙNG CÁC TẬP ĐOÀN & DOANH NGHIỆP TIÊN PHONG')
    ).toBeInTheDocument();
  });

  it('renders Section 3: The Contrast Grid comparing generic job boards with InfoHR & AILA', () => {
    render(<EmployerHomePage />);

    expect(
      screen.getByText('Sự Khác Biệt Giữa Sàn Việc Làm Đại Trà & InfoHR Kỹ Thuật')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Sàn Tuyển Dụng Đại Trà Truyền Thống').length).toBe(4);
    expect(screen.getAllByText('Giải Pháp InfoHR & Voice AI AILA').length).toBe(4);
  });

  it('renders Section 4: 4 Focus Technical Industries with key roles', () => {
    render(<EmployerHomePage />);

    expect(
      screen.getByText('Tập Trung Chuyên Sâu 4 Khối Ngành Kỹ Thuật Trọng Điểm')
    ).toBeInTheDocument();
    expect(screen.getByText('Khối Xây Dựng & Hạ Tầng')).toBeInTheDocument();
    expect(screen.getByText('Khối Bất Động Sản & Dự Án')).toBeInTheDocument();
    expect(screen.getByText('Khối Kiến Trúc & Nội Thất')).toBeInTheDocument();
    expect(screen.getByText('Khối Kỹ Thuật & Cơ Điện (MEP)')).toBeInTheDocument();

    // Key roles check
    expect(screen.getByText('Chỉ huy trưởng công trình')).toBeInTheDocument();
    expect(screen.getByText('Giám đốc Quản lý dự án (Project Manager)')).toBeInTheDocument();
    expect(screen.getByText('Kiến trúc sư chủ trì hồ sơ thi công')).toBeInTheDocument();
    expect(screen.getByText('Kỹ sư Trưởng MEP công trình')).toBeInTheDocument();
  });

  it('renders Section 5: Streamlined 3-step hiring process', () => {
    render(<EmployerHomePage />);

    expect(
      screen.getByText('Quy Trình 3 Bước Tiếp Nhận Ứng Viên Đã Qua Sơ Loại Kỹ Thuật')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Đăng Tin & Cấu Hình Tiêu Chuẩn Kỹ Thuật')
    ).toBeInTheDocument();
    expect(
      screen.getByText('AILA Voice AI Phỏng Vấn Sơ Loại 24/7')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Lãnh Đạo Nhận Scorecard & Duyệt Trong 2 Phút')
    ).toBeInTheDocument();
  });

  it('renders Section 6: B2B conversion CTA banner with business hotline', () => {
    render(<EmployerHomePage />);

    expect(
      screen.getByText('Sẵn sàng nâng cấp quy trình tuyển dụng kỹ thuật cho doanh nghiệp?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Đăng Ký Tài Khoản NTD/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hỗ trợ thiết lập kịch bản tuyển dụng kỹ thuật/i)
    ).toBeInTheDocument();
  });
});

describe('EmployerHomePage GSAP Animation & Code Resilience', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('imports GSAP helper utilities and registers plugins safely', () => {
    expect(source).toContain('registerGsapPlugins');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS');
  });

  it('uses gsap.matchMedia for desktop, mobile and reduced-motion conditions', () => {
    expect(source).toContain('gsap.matchMedia()');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isDesktop');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isMobile');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.reduceMotion');
  });

  it('ensures animations use once: true and clearProps: "all"', () => {
    expect(source).toContain("clearProps: 'all'");
    expect(source).toContain('once: true');
  });
});
