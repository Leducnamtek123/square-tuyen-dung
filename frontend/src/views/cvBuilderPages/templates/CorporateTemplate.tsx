import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../components/SocialIcons';
import { CVLanguage, getCVLabels } from './utils/cvDictionary';
import { getThemeStyles, hexToRgba } from './utils/themeStyles';
import { AvatarRenderer } from './components/AvatarRenderer';
import { DateRangeText } from './components/DateRangeText';

interface TemplateProps {
  data: CVData;
  language?: CVLanguage;
}

export const CorporateTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#1e293b';
  const { fontFamily, fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);

  return (
    <div
      className={`w-full bg-white text-slate-900 p-8 sm:p-10 ${fontSizeClass} shadow-sm min-h-[1050px] flex flex-col ${sectionGapClass}`}
      style={{ fontFamily }}
    >
      {/* Header: Centered Corporate Header with Horizontal Divider */}
      <div className="text-center pb-3 border-b-2 flex flex-col items-center gap-2 cv-section break-inside-avoid" style={{ borderColor: primaryColor }}>
        {theme.showAvatar && (
          <AvatarRenderer
            avatarUrl={personalInfo.avatarUrl}
            fullName={personalInfo.fullName}
            size={76}
            borderRadius={avatarRadius}
            borderColor={primaryColor}
            borderWidth={2}
          />
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider" style={{ color: primaryColor }}>
            {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
          </h1>
          <div className="text-[12.5px] font-bold text-slate-700 mt-0.5 uppercase tracking-widest">
            {personalInfo.title || (language === 'vi' ? 'Vị trí chuyên môn' : 'Professional Title')}
          </div>
        </div>

        {/* Contact Line */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-600 font-medium">
          {personalInfo.phoneNumber && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{personalInfo.phoneNumber}</span>
            </span>
          )}
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 font-semibold">{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{personalInfo.address}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <LinkedinIcon className="w-3 h-3 text-slate-400" />
              <span>{personalInfo.linkedin}</span>
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <GithubIcon className="w-3 h-3 text-slate-400" />
              <span>{personalInfo.github}</span>
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{personalInfo.website}</span>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.bio && (
        <div className="cv-section break-inside-avoid">
          <div
            className="text-[12px] font-black uppercase tracking-wider mb-1 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.profileSummary}
          </div>
          <p className="text-[12px] text-slate-700 text-justify leading-relaxed">
            {personalInfo.bio}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="cv-section">
          <div
            className="text-[12px] font-black uppercase tracking-wider mb-2 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.workExperience}
          </div>
          <div className={itemGapClass}>
            {experiences.map((exp) => (
              <div key={exp.id} className="break-inside-avoid cv-item">
                <div className="flex justify-between items-baseline">
                  <span className="font-extrabold text-[12.5px] text-slate-900">
                    {exp.company}
                  </span>
                  <DateRangeText
                    startDate={exp.startDate}
                    endDate={exp.endDate}
                    isCurrent={exp.isCurrent}
                    language={language}
                    className="text-[11px] font-semibold text-slate-600"
                  />
                </div>
                <div className="font-bold text-[12px] text-slate-700 italic mb-0.5">
                  {exp.position}
                </div>
                {exp.description && (
                  <p className="text-[11.5px] text-slate-700 whitespace-pre-line leading-relaxed pl-2 border-l-2 border-slate-200">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations && educations.length > 0 && (
        <div className="cv-section">
          <div
            className="text-[12px] font-black uppercase tracking-wider mb-2 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.education}
          </div>
          <div className="space-y-1.5">
            {educations.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline break-inside-avoid cv-item">
                <div>
                  <span className="font-bold text-[12px] text-slate-900">{edu.school}</span>
                  <span className="text-slate-600 text-[11.5px]"> — {edu.major}</span>
                  {edu.gpa && <span className="text-slate-500 text-[11px]"> ({labels.gpa}: {edu.gpa})</span>}
                </div>
                <DateRangeText startDate={edu.startDate} endDate={edu.endDate} language={language} className="text-[11px] font-medium text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Certifications: Compact 2 Column Grid */}
      <div className="grid grid-cols-2 gap-4 cv-section break-inside-avoid">
        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <div
              className="text-[12px] font-black uppercase tracking-wider mb-1.5 pb-0.5 border-b"
              style={{ color: primaryColor, borderColor: '#cbd5e1' }}
            >
              {labels.skills}
            </div>
            <div className="text-[11.5px] text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">{labels.skills}: </span>
              {skills.map((s) => s.name).join(' • ')}
            </div>
          </div>
        )}

        {/* Certifications & Languages */}
        {((certificates && certificates.length > 0) || (languages && languages.length > 0)) && (
          <div>
            <div
              className="text-[12px] font-black uppercase tracking-wider mb-1.5 pb-0.5 border-b"
              style={{ color: primaryColor, borderColor: '#cbd5e1' }}
            >
              {labels.certificates} & {labels.languages}
            </div>
            <div className="text-[11.5px] text-slate-700 space-y-0.5">
              {certificates && certificates.map((c) => (
                <div key={c.id}>
                  <span className="font-bold">{c.name}</span>
                  <span className="text-slate-500"> ({c.organization} {c.issueDate})</span>
                </div>
              ))}
              {languages && languages.length > 0 && (
                <div>
                  <span className="font-bold">{labels.languages}: </span>
                  {languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Projects (if available) */}
      {projects && projects.length > 0 && (
        <div className="cv-section">
          <div
            className="text-[12px] font-black uppercase tracking-wider mb-1.5 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.projects}
          </div>
          <div className="space-y-1.5">
            {projects.map((p) => (
              <div key={p.id} className="text-[11.5px] text-slate-700 break-inside-avoid cv-item">
                <span className="font-bold text-slate-900">{p.name}</span>
                {p.role && <span className="text-slate-600"> ({p.role})</span>}
                {p.description && <span className="text-slate-600">: {p.description}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
