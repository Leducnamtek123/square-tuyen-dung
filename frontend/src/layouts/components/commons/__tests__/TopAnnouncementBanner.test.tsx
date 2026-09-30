/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopAnnouncementBanner from '../Header/TopAnnouncementBanner';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: { language: 'vi' },
  }),
}));

describe('TopAnnouncementBanner Portal Visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('does not render when isEmployerPortal prop is true', () => {
    (usePathname as jest.Mock).mockReturnValue('/');

    const { container } = render(<TopAnnouncementBanner isEmployerPortal={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render on employer path (/nha-tuyen-dung) by auto-detection', () => {
    (usePathname as jest.Mock).mockReturnValue('/nha-tuyen-dung');

    const { container } = render(<TopAnnouncementBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render on employer path (/employer/dashboard) by auto-detection', () => {
    (usePathname as jest.Mock).mockReturnValue('/employer/dashboard');

    const { container } = render(<TopAnnouncementBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when isAdminPortal prop is true', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    const { container } = render(<TopAnnouncementBanner isAdminPortal={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render on admin path (/admin/users) by auto-detection', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin/users');

    const { container } = render(<TopAnnouncementBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render on admin path (/quan-tri) by auto-detection', () => {
    (usePathname as jest.Mock).mockReturnValue('/quan-tri');

    const { container } = render(<TopAnnouncementBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders on candidate portal on home page', () => {
    (usePathname as jest.Mock).mockReturnValue('/');

    render(<TopAnnouncementBanner isAdminPortal={false} isEmployerPortal={false} />);
    expect(screen.getByLabelText('Thông báo tính năng mới')).toBeInTheDocument();
    expect(screen.getByText('MỚI')).toBeInTheDocument();
    expect(
      screen.getByText('Luyện phỏng vấn thực chiến cùng công nghệ Voice AI chuẩn doanh nghiệp.')
    ).toBeInTheDocument();
    expect(screen.getByText('Khám phá ngay')).toBeInTheDocument();
  });
});
