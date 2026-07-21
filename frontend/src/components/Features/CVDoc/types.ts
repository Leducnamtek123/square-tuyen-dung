import type { Resume, User } from '@/types/models';

type ExtraData = {
  name?: string;
};

export type CVDocExperience = {
  jobName?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type CVDocEducation = {
  degreeName?: string;
  trainingPlaceName?: string;
  major?: string;
  startDate?: string;
  completedDate?: string;
  description?: string;
};

export type CVDocAdvancedSkill = {
  name?: string;
  level?: number;
};

export type CVDocLanguageSkill = {
  language?: string;
  level?: string | number;
};

export type CVDocCertificate = {
  name?: string;
  trainingPlace?: string;
  startDate?: string;
  expirationDate?: string;
};

export type ExtendedResume = Resume & {
  user?: User | null;
  positionChooseData?: ExtraData;
  experienceChooseData?: ExtraData;
  academicLevelChooseData?: ExtraData;
  typeOfWorkplaceChooseData?: ExtraData;
  jobTypeChooseData?: ExtraData;
  salaryMin?: number;
  salaryMax?: number;
  experienceDetails?: CVDocExperience[];
  educationDetails?: CVDocEducation[];
  advancedSkills?: CVDocAdvancedSkill[];
  languageSkills?: CVDocLanguageSkill[];
  certificateDetails?: CVDocCertificate[];
};

export interface CVDocProps {
  resume: ExtendedResume;
  user?: User | null;
  themeColor?: string;
}
