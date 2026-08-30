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

export const MinimalistTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#0f172a';
  const { fontFamily, fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);

  return (
    <div
      className={`w-full bg-white text-slate-800 p-8 sm:p-10 ${fontSizeClass} shadow-sm min-h-[1050px] flex flex-col ${sectionGapClass}`}
      style={{ fontFamily }}
    >
      {/* Header: Centered Minimalist Typography */}
      <div className="text-center pb-4 border-b-2 flex flex-col items-center gap-2.5" style={{ borderColor: primaryColor }}>
        {theme.showAvatar && (
          <AvatarRenderer
            avatarUrl={personalInfo.avatarUrl}
            fullName={personalInfo.fullName}
            size={80}
            borderRadius={avatarRadius}
            borderColor={primaryColor}
            borderWidth={2}
          />
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ color: primaryColor }}>
            {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
          </h1>
          <div className="text-[13px] font-semibold text-slate-600 mt-0.5 uppercase tracking-widest">
            {personalInfo.title || (language === 'vi' ? 'Vị trí ứng tuyển' : 'Job Title')}
          </div>
        </div>

        {/* Contact Strip */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-1 text-[11.5px] text-slate-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phoneNumber && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.phoneNumber}</span>
            </span>
          )}
          {personalInfo.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.address}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <LinkedinIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.linkedin}</span>
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.github}</span>
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.website}</span>
            </span>
          )}
        </div>
      </div>

      {/* Summary / Bio */}
      {personalInfo.bio && (
        <div>
          <h2
            className="text-[13px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#e2e8f0' }}
          >
            {labels.profileSummary}
          </h2>
          <p className="text-slate-600 text-[12px] leading-relaxed whitespace-pre-line">
            {personalInfo.bio}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="cv-section">
          <h2
            className="text-[13px] font-bold uppercase tracking-wider mb-2.5 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#e2e8f0' }}
          >
            {labels.workExperience}
          </h2>
          <div className={itemGapClass}>
            {experiences.map((exp) => (
              <div key={exp.id} className="break-inside-avoid cv-item">
                <div className="flex flex-wrap justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-[13px]">{exp.position}</span>
                  <DateRangeText
                    startDate={exp.startDate}
                    endDate={exp.endDate}
                    isCurrent={exp.isCurrent}
                    language={language}
                    className="text-[11.5px] font-medium text-slate-500"
                  />
                </div>
                <div className="font-semibold text-slate-700 text-[12px] mb-0.5">{exp.company}</div>
                <p className="text-slate-600 text-[11.5px] whitespace-pre-line leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations && educations.length > 0 && (
        <div className="cv-section">
          <h2
            className="text-[13px] font-bold uppercase tracking-wider mb-2 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#e2e8f0' }}
          >
            {labels.education}
          </h2>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id} className="break-inside-avoid cv-item">
                <div className="flex flex-wrap justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-[12.5px]">{edu.school}</span>
                  <DateRangeText startDate={edu.startDate} endDate={edu.endDate} language={language} className="text-[11px] text-slate-500" />
                </div>
                <div className="text-slate-700 text-[11.5px]">
                  <span>{edu.major}</span>
                  {edu.degree && <span> • {edu.degree}</span>}
                  {edu.gpa && <span> • {labels.gpa}: {edu.gpa}</span>}
                </div>
                {edu.description && (
                  <p className="text-slate-500 text-[11px] mt-0.5">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="cv-section">
          <h2
            className="text-[13px] font-bold uppercase tracking-wider mb-2 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: '#e2e8f0' }}
          >
            {labels.projects}
          </h2>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id} className="break-inside-avoid cv-item">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-800 text-[12.5px]">{proj.name}</span>
                  <DateRangeText startDate={proj.startDate} endDate={proj.endDate} language={language} className="text-[11px] text-slate-400" />
                </div>
                <div className="text-[11.5px] text-slate-600">
                  <span className="font-medium">{labels.role}:</span> {proj.role}
                  {proj.technologies && <span> • {labels.technologies}: {proj.technologies}</span>}
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5 whitespace-pre-line">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills, Languages & Certificates in Multi-column Bottom */}
      <div className="grid grid-cols-2 gap-5 pt-1 cv-section break-inside-avoid">
        {skills && skills.length > 0 && (
          <div>
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b"
              style={{ color: primaryColor, borderColor: '#e2e8f0' }}
            >
              {labels.skills}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {(languages?.length > 0 || certificates?.length > 0) && (
          <div className="space-y-3">
            {languages && languages.length > 0 && (
              <div>
                <h2
                  className="text-[12.5px] font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: '#e2e8f0' }}
                >
                  {labels.languages}
                </h2>
                <div className="space-y-1 text-[11.5px]">
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between">
                      <span className="font-medium text-slate-700">{l.name}</span>
                      <span className="text-slate-500">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certificates && certificates.length > 0 && (
              <div>
                <h2
                  className="text-[12.5px] font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: '#e2e8f0' }}
                >
                  {labels.certificates}
                </h2>
                <div className="space-y-1 text-[11px]">
                  {certificates.map((c) => (
                    <div key={c.id}>
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      <span className="text-slate-500"> ({c.organization} - {c.issueDate})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
