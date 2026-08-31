import type { Resume, User } from '@/types/models';

type ExtraData = {
  name?: string;
};

export type CVDocExperience = {
  id?: number | string;
  jobName?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type CVDocEducation = {
  id?: number | string;
  degreeName?: string;
  trainingPlaceName?: string;
  major?: string;
  startDate?: string;
  completedDate?: string;
  description?: string;
};

export type CVDocAdvancedSkill = {
  id?: number | string;
  name?: string;
  level?: number;
};

export type CVDocLanguageSkill = {
  id?: number | string;
  language?: string;
  level?: string | number;
};

export type CVDocCertificate = {
  id?: number | string;
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
  locationChooseData?: ExtraData;
  salaryMin?: number;
  salaryMax?: number;
  salary?: string;
  expectedSalary?: number | null;
  careerObjective?: string;
  isSearchable?: boolean;
  fileUrl?: string | null;
  file?: {
    id?: number;
    name?: string;
    url?: string;
    fileUrl?: string;
  } | null;
  experienceDetails?: CVDocExperience[];
  educationDetails?: CVDocEducation[];
  advancedSkills?: CVDocAdvancedSkill[];
  languageSkills?: CVDocLanguageSkill[];
  certificates?: CVDocCertificate[];
};

export interface CVDocProps {
  resume: ExtendedResume;
  user?: User | null;
  themeColor?: string;
}
