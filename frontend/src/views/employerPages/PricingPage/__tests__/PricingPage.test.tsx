/**
 * @jest-environment jsdom
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { readFileSync } from 'fs';
import { join } from 'path';
import PricingPage from '../index';

// Mock Next.js navigation & Link
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/employer/pricing',
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
    revert: jest.fn(),
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

describe('PricingPage View Component (Comprehensive Services & Pricing Portal)', () => {
  it('renders Section 1: Hero with H1, Eyebrow and 3 Operational Guarantees', () => {
    render(<PricingPage />);

    // Eyebrow Chip
    expect(screen.getByText('BẢNG GIÁ & DỊCH VỤ MINH BẠCH')).toBeInTheDocument();

    // H1 Heading
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Dịch Vụ & Bảng Giá Tuyển Dụng Chuyên Ngành — Minh Bạch, Trả Theo Nhu Cầu\./i,
      })
    ).toBeInTheDocument();

    // Subtitle
    expect(
      screen.getByText(/Không chi phí ẩn, không ép mua gói lớn\. Chỉ trả tiền cho hồ sơ và dịch vụ/i)
    ).toBeInTheDocument();

    // Quick scroll buttons
    expect(screen.getByRole('button', { name: /Xem Các Gói Giá/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tư Vấn Doanh Nghiệp/i })).toBeInTheDocument();

    // 3 Operational Guarantees
    expect(
      screen.getByText('Hoàn điểm 100% nếu số thuê bao không nghe máy')
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Bảo hành đổi ứng viên thử việc').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('Xuất hóa đơn VAT điện tử trong ngày').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('triggers smooth scroll when clicking anchor navigation buttons', () => {
    const scrollIntoViewMock = jest.fn();
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn((id: string) => {
      if (id === 'cac-goi-gia' || id === 'dang-ky-tu-van') {
        return {
          scrollIntoView: scrollIntoViewMock,
        } as unknown as HTMLElement;
      }
      return null;
    });

    render(<PricingPage />);
    const scrollBtn = screen.getByRole('button', { name: /Xem Các Gói Giá/i });
    fireEvent.click(scrollBtn);

    expect(document.getElementById).toHaveBeenCalledWith('cac-goi-gia');
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    document.getElementById = originalGetElementById;
  });

  it('renders Section 2: 3 Core Service Pillars with detailed benefits', () => {
    render(<PricingPage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /3 Trụ Cột Dịch Vụ Cốt Lõi Cho Doanh Nghiệp Kỹ Thuật/i,
      })
    ).toBeInTheDocument();

    // Pillar 1
    expect(
      screen.getByText(/Đăng tin tuyển dụng chuyên ngành & hiển thị ưu tiên giờ vàng/i)
    ).toBeInTheDocument();
    expect(screen.getByText('TIẾP CẬN ĐÚNG NGÀNH')).toBeInTheDocument();
    expect(screen.getByText(/Thuật toán đẩy tin tự động vào giờ vàng kỹ sư tìm việc/i)).toBeInTheDocument();

    // Pillar 2
    expect(
      screen.getByText(/Điểm lọc hồ sơ CV bảo đảm có xác thực chứng chỉ hành nghề/i)
    ).toBeInTheDocument();
    expect(screen.getByText('100% HỒ SƠ THẬT')).toBeInTheDocument();
    expect(screen.getByText(/Xác thực chứng chỉ hành nghề Giám sát, Thiết kế, Định giá/i)).toBeInTheDocument();

    // Pillar 3
    expect(
      screen.getByText(/Trợ lý phỏng vấn sơ loại AILA Voice AI 24\/7 & báo cáo Scorecard/i)
    ).toBeInTheDocument();
    expect(screen.getByText('CÔNG NGHỆ ĐỘT PHÁ')).toBeInTheDocument();
    expect(screen.getByText(/Tự động gọi điện và phỏng vấn sơ loại tình huống kỹ thuật 24\/7/i)).toBeInTheDocument();
  });

  it('renders Section 3: 4 Pricing Cards including recommended Professional package', () => {
    render(<PricingPage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Lựa Chọn Gói Dịch Vụ Phù Hợp Với Quy Mô Doanh Nghiệp/i,
      })
    ).toBeInTheDocument();

    // Gói 1: Starter
    expect(screen.getByText('Gói Khởi Đầu (Starter)')).toBeInTheDocument();
    expect(screen.getByText('1.800.000 đ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Chọn Gói Khởi Đầu/i })).toBeInTheDocument();

    // Gói 2: Professional (Recommended)
    expect(screen.getByText('Gói Tăng Tốc (Professional)')).toBeInTheDocument();
    expect(screen.getByText('4.500.000 đ')).toBeInTheDocument();
    expect(screen.getByText('KHUYÊN DÙNG — TIẾT KIỆM 40%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Chọn Gói Tăng Tốc/i })).toBeInTheDocument();

    // Gói 3: Enterprise
    expect(screen.getByText('Gói Doanh Nghiệp (Enterprise)')).toBeInTheDocument();
    expect(screen.getByText('Liên Hệ Báo Giá')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nhận Báo Giá Tùy Chỉnh/i })).toBeInTheDocument();

    // Gói 4: Add-on
    expect(screen.getByText('Thẻ Tiện Ích Lẻ')).toBeInTheDocument();
    expect(screen.getByText('Từ 500.000 đ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng Ký Tiện Ích Lẻ/i })).toBeInTheDocument();
  });

  it('renders Section 4: Feature Comparison Matrix with all service groups', () => {
    render(<PricingPage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Bảng So Sánh Chi Tiết Quyền Lợi & Tính Năng Giữa Các Gói/i,
      })
    ).toBeInTheDocument();

    // Table Groups
    expect(screen.getByText(/1\. DỊCH VỤ ĐĂNG TIN TUYỂN DỤNG/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. DỊCH VỤ LỌC & MỞ KHÓA HỒ SƠ ỨNG VIÊN/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. TRỢ LÝ PHỎNG VẤN SƠ LOẠI AILA VOICE AI/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. CHÍNH SÁCH HỖ TRỢ & BẢO HÀNH DOANH NGHIỆP/i)).toBeInTheDocument();

    // Specific features
    expect(screen.getByText('Số lượng tin đăng chuyên ngành')).toBeInTheDocument();
    expect(screen.getByText('Số điểm lọc hồ sơ CV bảo đảm')).toBeInTheDocument();
    expect(screen.getByText('Số lượt phỏng vấn AILA Voice AI')).toBeInTheDocument();
    expect(screen.getAllByText('Bảo hành đổi ứng viên thử việc').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Section 5: Enterprise Consultation Form, validates inputs and submits successfully', async () => {
    render(<PricingPage />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Nhận Báo Giá Tùy Chỉnh & Đặt Lịch Demo AILA AI/i,
      })
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Gửi Yêu Cầu Báo Giá & Nhận Tư Vấn/i });

    // Submit empty to verify validations
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Vui lòng nhập họ và tên người liên hệ')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập số điện thoại hoặc Zalo')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập tên công ty hoặc nhà thầu')).toBeInTheDocument();

    // Fill valid data
    const nameInput = screen.getByPlaceholderText(/Nguyễn Văn A/i);
    const phoneInput = screen.getByPlaceholderText(/0912 345 678/i);
    const companyInput = screen.getByPlaceholderText(/Công ty CP Xây dựng/i);

    fireEvent.change(nameInput, { target: { value: 'Lê Hoàng Nam' } });
    fireEvent.change(phoneInput, { target: { value: '0908123456' } });
    fireEvent.change(companyInput, { target: { value: 'Công ty Cổ phần Xây Dựng MEP Vina' } });

    // Submit again
    fireEvent.click(submitBtn);

    // Wait for submission response
    await waitFor(
      () => {
        expect(
          screen.getByText(/Yêu cầu báo giá đã được gửi thành công!/i)
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('renders Section 6: FAQ Accordion with 4 realistic questions and answers', () => {
    render(<PricingPage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Câu Hỏi Thường Gặp Về Dịch Vụ & Bảng Giá Tuyển Dụng/i,
      })
    ).toBeInTheDocument();

    // 4 Questions
    expect(
      screen.getByText('Làm sao để được bảo hành hoàn trả điểm lọc CV khi ứng viên không nghe máy?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Trợ lý AILA Voice AI phỏng vấn những nội dung gì và doanh nghiệp có được tự chỉnh sửa câu hỏi không?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Quy trình thanh toán và xuất hóa đơn giá trị gia tăng (VAT) điện tử diễn ra như thế nào?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Doanh nghiệp mới đăng ký có được hưởng chính sách ưu đãi hoặc dùng thử dịch vụ không?')
    ).toBeInTheDocument();

    // Answer for defaultExpanded accordion 1
    expect(
      screen.getByText(/Trên hệ thống InfoHR, mỗi hồ sơ khi bạn mở khóa đều có nút/i)
    ).toBeInTheDocument();
  });

  it('renders bottom CTA banner with contact information and registration links', () => {
    render(<PricingPage />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Cần Tư Vấn Gói Dịch Vụ Phù Hợp Nhất Cho Dự Án Của Bạn\?/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/Hotline: 028 7108 8688/i)).toBeInTheDocument();
    expect(screen.getByText(/Email: hotline@infohr.vn/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Đăng Ký Tài Khoản Doanh Nghiệp/i })
    ).toBeInTheDocument();
  });
});

describe('PricingPage GSAP Architecture & Standards', () => {
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
    expect(source).toContain('clearProps: \'all\'');
  });
});
