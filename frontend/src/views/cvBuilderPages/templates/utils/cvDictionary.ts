export type CVLanguage = 'vi' | 'en';

export interface CVTranslationLabels {
  curriculumVitae: string;
  contactInfo: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  website: string;
  linkedin: string;
  github: string;
  profileSummary: string;
  aboutMe: string;
  workExperience: string;
  education: string;
  skills: string;
  coreSkills: string;
  technicalSkills: string;
  projects: string;
  keyProjects: string;
  certificates: string;
  languages: string;
  present: string;
  role: string;
  technologies: string;
  techStack: string;
  gpa: string;
  degree: string;
  level: string;
  developerPrompt: string;
}

export const CV_DICTIONARY: Record<CVLanguage, CVTranslationLabels> = {
  vi: {
    curriculumVitae: 'Hồ Sơ Năng Lực',
    contactInfo: 'Thông tin liên hệ',
    email: 'Email',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    birthday: 'Ngày sinh',
    website: 'Website',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    profileSummary: 'Tóm tắt chuyên môn',
    aboutMe: 'Giới thiệu bản thân',
    workExperience: 'Kinh nghiệm làm việc',
    education: 'Trình độ học vấn',
    skills: 'Kỹ năng chuyên môn',
    coreSkills: 'Kỹ năng cốt lõi',
    technicalSkills: 'Kỹ năng kỹ thuật & Công nghệ',
    projects: 'Dự án tiêu biểu',
    keyProjects: 'Dự án & Thành tựu trọng điểm',
    certificates: 'Chứng chỉ chuyên môn',
    languages: 'Trình độ ngoại ngữ',
    present: 'Hiện tại',
    role: 'Vai trò',
    technologies: 'Công nghệ',
    techStack: 'Tech Stack',
    gpa: 'GPA',
    degree: 'Bằng cấp',
    level: 'Cấp độ',
    developerPrompt: 'developer@infohr:~$ whoami',
  },
  en: {
    curriculumVitae: 'Curriculum Vitae',
    contactInfo: 'Contact Information',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    birthday: 'Date of Birth',
    website: 'Website',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    profileSummary: 'Professional Summary',
    aboutMe: 'About Me',
    workExperience: 'Work Experience',
    education: 'Education',
    skills: 'Professional Skills',
    coreSkills: 'Core Competencies',
    technicalSkills: 'Technical Skills & Tools',
    projects: 'Featured Projects',
    keyProjects: 'Key Projects & Achievements',
    certificates: 'Certifications',
    languages: 'Languages',
    present: 'Present',
    role: 'Role',
    technologies: 'Technologies',
    techStack: 'Tech Stack',
    gpa: 'GPA',
    degree: 'Degree',
    level: 'Level',
    developerPrompt: 'developer@infohr:~$ whoami',
  },
};

export function getCVLabels(lang?: CVLanguage): CVTranslationLabels {
  const selectedLang = lang === 'en' ? 'en' : 'vi';
  return CV_DICTIONARY[selectedLang];
}
