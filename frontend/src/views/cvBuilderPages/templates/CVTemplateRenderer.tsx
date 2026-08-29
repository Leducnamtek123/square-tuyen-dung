'use client';

import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { CVLanguage } from './utils/cvDictionary';
import { ModernTemplate } from './ModernTemplate';
import { MinimalistTemplate } from './MinimalistTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { TechTemplate } from './TechTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { NordicTemplate } from './NordicTemplate';
import { CorporateTemplate } from './CorporateTemplate';

export interface CVTemplateRendererProps {
  data: CVData;
  language?: CVLanguage;
}

export const CVTemplateRenderer: React.FC<CVTemplateRendererProps> = ({ data, language = 'vi' }) => {
  switch (data.templateId) {
    case 'minimal-clean':
      return <MinimalistTemplate data={data} language={language} />;
    case 'executive-emerald':
      return <ExecutiveTemplate data={data} language={language} />;
    case 'creative-coral':
      return <CreativeTemplate data={data} language={language} />;
    case 'tech-dark':
      return <TechTemplate data={data} language={language} />;
    case 'classic-editorial':
    case 'classic-serif':
      return <ClassicTemplate data={data} language={language} />;
    case 'nordic-minimal':
      return <NordicTemplate data={data} language={language} />;
    case 'corporate-compact':
      return <CorporateTemplate data={data} language={language} />;
    case 'modern-navy':
    default:
      return <ModernTemplate data={data} language={language} />;
  }
};
