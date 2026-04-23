import React from 'react';
import i18next from 'i18next';
import { Document, Font, Page } from '@react-pdf/renderer';
import { ExtendedResume, CVDocProps } from './types';
import { createCVDocStyles, DEFAULT_THEME_COLOR } from './styles';
import CVDocHeader from './CVDocHeader';
import CVDocInfoSection from './CVDocInfoSection';
import CVDocExperienceSection from './CVDocExperienceSection';
import CVDocEducationSection from './CVDocEducationSection';
import CVDocSkillsSection from './CVDocSkillsSection';
import CVDocLanguagesSection from './CVDocLanguagesSection';
import CVDocCertificatesSection from './CVDocCertificatesSection';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/roboto/Roboto-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/roboto/Roboto-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/roboto/Roboto-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/roboto/Roboto-Black.ttf', fontWeight: 900 },
    { src: '/fonts/roboto/Roboto-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
  ],
});

const CVDoc = ({ resume, user, themeColor }: CVDocProps) => {
  const currentThemeColor = themeColor || DEFAULT_THEME_COLOR;
  const styles = createCVDocStyles(currentThemeColor);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CVDocHeader resume={resume} user={user} styles={styles} />

        <PageBody resume={resume} styles={styles} />
      </Page>
    </Document>
  );
};

type PageBodyProps = {
  resume: ExtendedResume;
  styles: ReturnType<typeof createCVDocStyles>;
};

const PageBody = ({ resume, styles }: PageBodyProps) => (
  <React.Fragment>
    <CVDocInfoSection
      resume={resume}
      styles={styles}
    />
    <CVDocExperienceSection
      title={i18next.t('common:cvDoc.sections.workExperience')}
      items={resume?.experienceDetails}
      styles={styles}
    />
    <CVDocEducationSection
      title={i18next.t('common:cvDoc.sections.education')}
      items={resume?.educationDetails}
      styles={styles}
    />
    <CVDocSkillsSection
      title={i18next.t('common:cvDoc.sections.skills')}
      items={resume?.advancedSkills}
      styles={styles}
    />
    <CVDocLanguagesSection
      title={i18next.t('common:cvDoc.sections.languages')}
      items={resume?.languageSkills}
      styles={styles}
    />
    <CVDocCertificatesSection
      title={i18next.t('common:cvDoc.sections.certificates')}
      items={resume?.certificateDetails}
      styles={styles}
    />
  </React.Fragment>
);

export default CVDoc;
export type { ExtendedResume } from './types';
export type { CVDocExperience, CVDocEducation, CVDocAdvancedSkill, CVDocLanguageSkill, CVDocCertificate } from './types';
