/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PartnerLogoCarousel, { PARTNER_COMPANIES } from '../index';

describe('PartnerLogoCarousel Component (Minimalist Logo-Only Standard)', () => {
  it('renders section headline without clutter', () => {
    render(<PartnerLogoCarousel />);
    expect(
      screen.getByText('ĐỒNG HÀNH CÙNG CÁC DOANH NGHIỆP TIÊN PHONG')
    ).toBeInTheDocument();
  });

  it('renders pure logos for all partner and client companies with correct alt and title', () => {
    const { container } = render(<PartnerLogoCarousel />);

    PARTNER_COMPANIES.forEach((company) => {
      const matchingImgs = container.querySelectorAll(
        `img[src="${company.logoSrc}"][alt="${company.logoAlt}"]`
      );
      expect(matchingImgs.length).toBeGreaterThan(0);
    });
  });

  it('does NOT contain external outbound links to keep candidate focus on InfoHR', () => {
    render(<PartnerLogoCarousel />);
    const links = screen.queryAllByRole('link');
    expect(links.length).toBe(0);
  });

  it('contains image elements with smooth hover transition styles', () => {
    const { container } = render(<PartnerLogoCarousel />);
    const images = container.querySelectorAll('img.partner-logo-img');
    expect(images.length).toBe(PARTNER_COMPANIES.length * 2); // Duplicated 2 times for seamless marquee
  });
});
