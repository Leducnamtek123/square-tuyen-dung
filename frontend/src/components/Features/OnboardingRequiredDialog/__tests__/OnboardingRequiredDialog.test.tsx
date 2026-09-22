/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingRequiredDialog from '../index';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal || key,
  }),
}));

describe('OnboardingRequiredDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders candidate onboarding prompt correctly when open', () => {
    const handleClose = jest.fn();
    render(
      <OnboardingRequiredDialog
        open={true}
        onClose={handleClose}
        role="candidate"
        returnUrl="/viec-lam/senior-frontend"
      />
    );

    expect(screen.getByText('Cần hoàn tất hồ sơ để ứng tuyển')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bạn cần hoàn thiện thông tin hồ sơ cơ bản (chức danh, kỹ năng, số điện thoại) để nhà tuyển dụng có thể đánh giá và liên hệ phỏng vấn.'
      )
    ).toBeInTheDocument();

    const ctaButton = screen.getByRole('button', { name: /Hoàn tất hồ sơ ngay/i });
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      '/onboarding/candidate?redirect=%2Fviec-lam%2Fsenior-frontend'
    );
  });

  it('renders employer onboarding prompt when role is employer', () => {
    const handleClose = jest.fn();
    render(
      <OnboardingRequiredDialog
        open={true}
        onClose={handleClose}
        role="employer"
      />
    );

    expect(screen.getByText('Cần hoàn tất hồ sơ doanh nghiệp')).toBeInTheDocument();
    const ctaButton = screen.getByRole('button', { name: /Hoàn tất hồ sơ ngay/i });
    fireEvent.click(ctaButton);
    expect(mockPush).toHaveBeenCalledWith('/onboarding/employer');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <OnboardingRequiredDialog
        open={true}
        onClose={handleClose}
        role="candidate"
      />
    );

    const closeButton = screen.getByRole('button', { name: /Để sau/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
