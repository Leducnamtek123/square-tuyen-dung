'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { isEmployerPortalPath } from '@/configs/portalRouting';
import CandidateFooter from './CandidateFooter';
import EmployerFooter from './EmployerFooter';

export { CandidateFooter, EmployerFooter };

export interface FooterProps {
  portal?: 'jobseeker' | 'employer' | 'candidate' | 'auto';
  variant?: 'candidate' | 'employer' | 'auto';
  showAppBanner?: boolean;
  showHotlines?: boolean;
  showHotline?: boolean;
}

/**
 * Universal Footer Dispatcher
 *
 * Automatically renders distinct, customized Footers:
 * - Candidate / Public: Dark Slate Navy rich footer with Square/InfoHR addresses & badges
 * - Employer Portal: Light enterprise footer with trust badges & Square/InfoHR addresses
 */
export const Footer: React.FC<FooterProps> = ({
  portal = 'auto',
  variant = 'auto',
}) => {
  const pathname = usePathname() || '';
  const { i18n } = useTranslation('common');

  const isEmployer =
    portal === 'employer' ||
    variant === 'employer' ||
    (portal === 'auto' && variant === 'auto' && isEmployerPortalPath(pathname));

  if (isEmployer) {
    return <EmployerFooter />;
  }

  return <CandidateFooter />;
};

export default Footer;
