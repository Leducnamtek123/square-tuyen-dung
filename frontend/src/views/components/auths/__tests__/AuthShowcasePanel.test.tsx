/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthShowcasePanel from '../AuthShowcasePanel';

// Mock next/image to render an img tag with all received props
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, fetchPriority, placeholder, blurDataURL, ...props }: any) => {
    return (
      <img
        {...props}
        data-fill={fill ? 'true' : undefined}
        data-priority={priority ? 'true' : undefined}
        data-fetchpriority={fetchPriority}
        data-placeholder={placeholder}
        data-blurdataurl={blurDataURL ? 'present' : 'none'}
      />
    );
  },
}));

describe('AuthShowcasePanel (Senior Static Image Optimization)', () => {
  it('renders img with class "banner-image" for candidate variant with high performance attributes', () => {
    render(<AuthShowcasePanel variant="candidate" />);

    const img = document.querySelector('img.banner-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'InfoHR - Ứng tuyển 1 chạm mọi lúc mọi nơi');
    expect(img).toHaveAttribute('data-priority', 'true');
    expect(img).toHaveAttribute('data-fetchpriority', 'high');
    expect(img).toHaveAttribute('data-placeholder', 'blur');
    expect(img).toHaveAttribute('data-blurdataurl', 'present');
    expect(img).toHaveAttribute('sizes', '(max-width: 900px) 1px, 540px');
  });

  it('renders img with class "banner-image" for employer variant', () => {
    render(<AuthShowcasePanel variant="employer" />);

    const img = document.querySelector('img.banner-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'InfoHR - Tuyển dụng nhân tài đột phá cùng AI');
    expect(img).toHaveAttribute('data-priority', 'true');
    expect(img).toHaveAttribute('data-placeholder', 'blur');
    expect(img).toHaveAttribute('data-blurdataurl', 'present');
  });

  it('transitions opacity from 0 to 1 when image finishes decoding (onLoad)', () => {
    render(<AuthShowcasePanel variant="candidate" />);

    const img = document.querySelector('img.banner-image') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.style.opacity).toBe('0');

    // Simulate image decoded and loaded
    fireEvent.load(img);

    expect(img.style.opacity).toBe('1');
  });
});
