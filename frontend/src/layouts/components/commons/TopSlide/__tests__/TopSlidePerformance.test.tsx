/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import TopSlide from '../index';

// Mock gsap
jest.mock('gsap', () => ({
  matchMedia: () => ({
    add: jest.fn(),
  }),
  timeline: () => ({
    fromTo: jest.fn().mockReturnThis(),
  }),
  set: jest.fn(),
  registerPlugin: jest.fn(),
}));

jest.mock('@gsap/react', () => ({
  useGSAP: (cb: () => void) => cb(),
}));

// Mock swiper
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => <div className="swiper-container">{children}</div>,
  SwiperSlide: ({ children }: any) => <div className="swiper-slide swiper-slide-active">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Autoplay: {},
}));

jest.mock('@/views/components/defaults/HomeSearch', () => () => <div data-testid="home-search" />);

const mockBanner = {
  id: 1,
  imageUrl: '/hero.webp',
  imageMobileUrl: '/hero-m.webp',
  description: 'Hero Banner',
} as any;

describe('TopSlide Hero Image Performance (Senior Grade)', () => {
  it('renders ambient placeholder without flashing default image during initial loading', () => {
    const { container } = render(<TopSlide />);

    const img = container.querySelector('picture img');
    expect(img).toBeNull();
    const swiper = container.querySelector('.swiper-container');
    expect(swiper).toBeNull();
  });

  it('renders hero banner image with high priority and async decoding when banner data is present', () => {
    const { container } = render(<TopSlide initialBanners={[mockBanner]} />);

    const img = container.querySelector(
      'div.swiper-slide.swiper-slide-active picture img'
    ) as HTMLImageElement;

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('provides responsive picture element with mobile source tag', () => {
    const { container } = render(<TopSlide initialBanners={[mockBanner]} />);

    const picture = container.querySelector('div.swiper-slide.swiper-slide-active picture');
    expect(picture).toBeInTheDocument();

    const mobileSource = picture?.querySelector('source[media="(max-width: 599px)"]');
    expect(mobileSource).toBeInTheDocument();
  });
});
