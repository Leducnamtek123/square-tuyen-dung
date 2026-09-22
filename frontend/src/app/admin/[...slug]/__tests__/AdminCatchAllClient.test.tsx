/**
 * @jest-environment jsdom
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AdminCatchAllClient from '../AdminCatchAllClient';
import { useParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key,
  }),
}));

jest.mock('@/views/adminPages/ProfileDetailPage', () => {
  return function MockProfileDetailPage({ id }: { id: string }) {
    return <div data-testid="profile-detail-page">ProfileDetailPage ID: {id}</div>;
  };
});

describe('AdminCatchAllClient', () => {
  it('renders ProfileDetailPage when prefix is profiles and has an id', () => {
    (useParams as jest.Mock).mockReturnValue({ slug: ['profiles', '12345'] });
    render(<AdminCatchAllClient />);
    expect(screen.getByTestId('profile-detail-page')).toHaveTextContent('ProfileDetailPage ID: 12345');
  });

  it('renders ProfileDetailPage when prefix is quan-ly-ho-so-ung-vien and has an id', () => {
    (useParams as jest.Mock).mockReturnValue({ slug: ['quan-ly-ho-so-ung-vien', '888'] });
    render(<AdminCatchAllClient />);
    expect(screen.getByTestId('profile-detail-page')).toHaveTextContent('ProfileDetailPage ID: 888');
  });

  it('renders ProfileDetailPage when prefix is ho-so-ung-vien and has an id', () => {
    (useParams as jest.Mock).mockReturnValue({ slug: ['ho-so-ung-vien', '999'] });
    render(<AdminCatchAllClient />);
    expect(screen.getByTestId('profile-detail-page')).toHaveTextContent('ProfileDetailPage ID: 999');
  });

  it('renders ProfileDetailPage when prefix is ho-so and has an id', () => {
    (useParams as jest.Mock).mockReturnValue({ slug: ['ho-so', '101'] });
    render(<AdminCatchAllClient />);
    expect(screen.getByTestId('profile-detail-page')).toHaveTextContent('ProfileDetailPage ID: 101');
  });

  it('renders 404 when slug is a single numeric ID without valid prefix', () => {
    (useParams as jest.Mock).mockReturnValue({ slug: ['12345'] });
    render(<AdminCatchAllClient />);
    expect(screen.queryByTestId('profile-detail-page')).toBeNull();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Trang quản trị không tồn tại')).toBeInTheDocument();
  });

  it('renders 404 for arbitrary unknown routes', () => {
    (useParams as jest.Mock).mockReturnValue({ slug: ['unknown', 'route'] });
    render(<AdminCatchAllClient />);
    expect(screen.queryByTestId('profile-detail-page')).toBeNull();
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
