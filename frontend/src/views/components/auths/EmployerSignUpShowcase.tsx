'use client';

import React from 'react';
import AuthShowcasePanel from './AuthShowcasePanel';

/**
 * Dedicated visual showcase panel for Employer Registration.
 * Displays the 3D AI Recruitment banner artwork, replacing the previous text-based card.
 */
const EmployerSignUpShowcase: React.FC = () => {
  return <AuthShowcasePanel variant="employer" />;
};

export default EmployerSignUpShowcase;
