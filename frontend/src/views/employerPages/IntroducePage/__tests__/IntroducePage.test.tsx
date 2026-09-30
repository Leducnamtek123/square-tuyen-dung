/**
 * @jest-environment jsdom
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { join } from 'path';
import IntroducePage from '../index';

// Mock Next.js navigation & Link
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/employer/introduce',
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

// Mock PartnerLogoCarousel
jest.mock('@/components/Features/PartnerLogoCarousel', () => {
  return function MockPartnerLogoCarousel({ label }: { label?: string }) {
    return <div data-testid="partner-logo-carousel">{label || 'Partner Logos'}</div>;
  };
});

describe('IntroducePage View Component (Authentic Company & Tech Profile)', () => {
  it('renders Section 1: Hero Editorial with H1 and core credibility metrics', () => {
    render(<IntroducePage />);

    // Eyebrow Chip
    expect(screen.getByText('HỒ SƠ NĂNG LỰC & SỨ MỆNH CÔNG NGHỆ')).toBeInTheDocument();

    // H1 Heading
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Tại Sao InfoHR Ra Đời\? — Lời Giải Cho Bài Toán Nhân Lực Kỹ Thuật Việt Nam\./i,
      })
    ).toBeInTheDocument();

    // Subtitle
    expect(
      screen.getByText(/Thấu hiểu sự trăn trở của các nhà thầu, chủ đầu tư và công ty tư vấn thiết kế/i)
    ).toBeInTheDocument();

    // Action buttons
    expect(screen.getByRole('button', { name: /Khám Phá Giải Pháp/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đặt Lịch Tư Vấn/i })).toBeInTheDocument();

    // Credibility metrics
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/Hồ sơ kỹ thuật chuẩn hóa/i)).toBeInTheDocument();
    expect(screen.getByText('<500ms')).toBeInTheDocument();
    expect(screen.getByText(/Độ trễ Voice AI AILA/i)).toBeInTheDocument();
    expect(screen.getByText('0 Giờ')).toBeInTheDocument();
    expect(screen.getByText(/Lãng phí cho CV ảo/i)).toBeInTheDocument();
  });

  it('triggers smooth scroll when clicking Explore Solutions button', () => {
    const scrollIntoViewMock = jest.fn();
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn((id: string) => {
      if (id === 'nang-luc-tham-dinh') {
        return {
          scrollIntoView: scrollIntoViewMock,
        } as unknown as HTMLElement;
      }
      return null;
    });

    render(<IntroducePage />);
    const exploreBtn = screen.getByRole('button', { name: /Khám Phá Giải Pháp/i });
    fireEvent.click(exploreBtn);

    expect(document.getElementById).toHaveBeenCalledWith('nang-luc-tham-dinh');
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    document.getElementById = originalGetElementById;
  });

  it('renders Partner Logo Marquee section', () => {
    render(<IntroducePage />);
    expect(screen.getByTestId('partner-logo-carousel')).toBeInTheDocument();
    expect(
      screen.getByText('ĐỒNG HÀNH CÙNG CÁC DOANH NGHIỆP & TẬP ĐOÀN TIÊN PHONG')
    ).toBeInTheDocument();
  });

  it('renders Section 2: Mission, Vision & Core Philosophy with 3 sharp cards', () => {
    render(<IntroducePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Sứ Mệnh, Tầm Nhìn & Triết Lý Hoạt Động/i,
      })
    ).toBeInTheDocument();

    // 3 Cards
    expect(screen.getByText('Sứ Mệnh Chuẩn Hóa Tiêu Chí Kỹ Thuật')).toBeInTheDocument();
    expect(screen.getByText('Tầm Nhìn Dẫn Đầu Công Nghệ Voice AI Tuyển Dụng')).toBeInTheDocument();
    expect(screen.getByText('Triết Lý Minh Bạch & Tôn Trọng Thời Gian')).toBeInTheDocument();
  });

  it('renders Section 3: 3 Core Pillars of Technical Assessment', () => {
    render(<IntroducePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /3 Trụ Cột Năng Lực Thẩm Định Chuyên Sâu Của InfoHR/i,
      })
    ).toBeInTheDocument();

    // Pillar 1
    expect(screen.getByText('Thẩm Định Hồ Sơ Chuyên Môn')).toBeInTheDocument();
    expect(screen.getAllByText(/Xác minh chứng chỉ hành nghề Bộ Xây dựng/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Khảo sát mốc dự án thực tế đã tham gia/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Đánh giá kỹ năng BIM & Shop drawing/i)).toBeInTheDocument();

    // Pillar 2
    expect(screen.getByText('Công Nghệ Voice AI Thời Gian Thực AILA')).toBeInTheDocument();
    expect(screen.getByText(/Kiến trúc WebRTC phản xạ tức thì/i)).toBeInTheDocument();
    expect(screen.getByText(/Kịch bản tình huống theo TCVN \/ ASTM/i)).toBeInTheDocument();
    expect(screen.getByText(/Phiếu Scorecard & Audio ghi âm nguyên bản/i)).toBeInTheDocument();

    // Pillar 3
    expect(screen.getByText('Hệ Sinh Thái Nhân Sự Liên Thông')).toBeInTheDocument();
    expect(screen.getByText(/InfoHR Recruitment Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/InfoHR HRM Quản Trị Nhân Sự/i)).toBeInTheDocument();
    expect(screen.getByText(/AILA AI Interview Center/i)).toBeInTheDocument();
  });

  it('renders Section 4: Information Security Standards & AI Ethics', () => {
    render(<IntroducePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Tiêu Chuẩn Bảo Mật Thông Tin & Đạo Đức AI/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Bảo Mật Tuyệt Đối Danh Mục Dự Án & Gói Thầu')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tuân thủ Nghị định 13\/2023\/NĐ-CP/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText('Thuật Toán AI Công Tâm — Không Định Kiến')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/100% Đánh giá trên năng lực kỹ thuật/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Triệt tiêu định kiến vô thức/i)
    ).toBeInTheDocument();
  });

  it('renders Section 5: Partnership & Recruitment Guarantee Policies', () => {
    render(<IntroducePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Chính Sách Đồng Hành & Bảo Hành Tuyển Dụng/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText('Bảo Hành Đổi Hồ Sơ Thử Việc')).toBeInTheDocument();
    expect(screen.getByText('Bảo Lưu & Cam Kết Hoàn Điểm')).toBeInTheDocument();
    expect(screen.getByText('Tư Vấn Kỹ Thuật Đồng Hành 1-on-1')).toBeInTheDocument();
  });

  it('renders Section 6: Enterprise Collaboration CTA & Direct Contacts', () => {
    render(<IntroducePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Sẵn Sàng Đồng Hành Cùng InfoHR Nâng Tầm Đội Ngũ Kỹ Thuật\?/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Đăng Ký Tài Khoản Doanh Nghiệp/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Xem Bảng Giá & Đặt Lịch Demo/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Hotline Doanh Nghiệp: 028 7108 8688/i)).toBeInTheDocument();
    expect(screen.getByText(/Email: hotline@infohr.vn/i)).toBeInTheDocument();
  });
});

describe('IntroducePage GSAP Architecture & Standards', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('registers GSAP plugins safely', () => {
    expect(source).toContain('registerGsapPlugins()');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS');
  });

  it('configures gsap.matchMedia for desktop, mobile and reduced-motion modes', () => {
    expect(source).toContain('gsap.matchMedia()');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isDesktop');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.isMobile');
    expect(source).toContain('GSAP_MEDIA_CONDITIONS.reduceMotion');
  });

  it('guarantees ScrollTrigger animations execute once and clearProps all', () => {
    expect(source).toContain('once: true');
    expect(source).toContain('clearProps: "all"');
  });
});
