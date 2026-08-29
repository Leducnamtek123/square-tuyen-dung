import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { Mail, Phone, MapPin, Globe, BookOpen, Award, Sparkles, Briefcase, GraduationCap } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../components/SocialIcons';
import { CVLanguage, getCVLabels } from './utils/cvDictionary';
import { getThemeStyles, hexToRgba } from './utils/themeStyles';
import { AvatarRenderer } from './components/AvatarRenderer';
import { DateRangeText } from './components/DateRangeText';

interface TemplateProps {
  data: CVData;
  language?: CVLanguage;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#334155';
  const { fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);
  const fontFamily = theme.fontFamily || 'Playfair Display, Georgia, serif';

  return (
    <div
      className={`w-full bg-white text-slate-800 p-8 sm:p-10 ${fontSizeClass} shadow-sm min-h-[1050px] flex flex-col ${sectionGapClass}`}
      style={{ fontFamily }}
    >
      {/* Editorial Header */}
      <div className="border-b-4 border-double pb-4" style={{ borderColor: primaryColor }}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-4">
            {theme.showAvatar && (
              <AvatarRenderer
                avatarUrl={personalInfo.avatarUrl}
                fullName={personalInfo.fullName}
                size={82}
                borderRadius={avatarRadius}
                borderColor={primaryColor}
                borderWidth={2}
              />
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
              </h1>
              <div className="text-[13.5px] font-semibold text-slate-600 italic mt-0.5 font-sans">
                {personalInfo.title || (language === 'vi' ? 'Chuyên viên / Học giả' : 'Professional Specialist')}
              </div>
            </div>
          </div>

          <div className="text-[11.5px] text-slate-600 space-y-1 font-sans text-center sm:text-right">
            {personalInfo.email && <div className="flex items-center justify-center sm:justify-end gap-1.5"><Mail className="w-3 h-3 text-slate-400" /><span>{personalInfo.email}</span></div>}
            {personalInfo.phoneNumber && <div className="flex items-center justify-center sm:justify-end gap-1.5"><Phone className="w-3 h-3 text-slate-400" /><span>{personalInfo.phoneNumber}</span></div>}
            {personalInfo.address && <div className="flex items-center justify-center sm:justify-end gap-1.5"><MapPin className="w-3 h-3 text-slate-400" /><span>{personalInfo.address}</span></div>}
            {personalInfo.linkedin && <div className="flex items-center justify-center sm:justify-end gap-1.5"><LinkedinIcon className="w-3 h-3 text-slate-400" /><span>{personalInfo.linkedin}</span></div>}
            {personalInfo.github && <div className="flex items-center justify-center sm:justify-end gap-1.5"><GithubIcon className="w-3 h-3 text-slate-400" /><span>{personalInfo.github}</span></div>}
            {personalInfo.website && <div className="flex items-center justify-center sm:justify-end gap-1.5"><Globe className="w-3 h-3 text-slate-400" /><span>{personalInfo.website}</span></div>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personalInfo.bio && (
        <div>
          <h2
            className="text-[13.5px] font-bold uppercase tracking-widest mb-1.5 pb-1 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.profileSummary}
          </h2>
          <p className="text-slate-700 leading-relaxed italic whitespace-pre-line font-sans text-[12px]">
            {personalInfo.bio}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div>
          <h2
            className="text-[13.5px] font-bold uppercase tracking-widest mb-3 pb-1 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.workExperience}
          </h2>
          <div className={itemGapClass}>
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-[13px]">{exp.position}</span>
                  <DateRangeText
                    startDate={exp.startDate}
                    endDate={exp.endDate}
                    isCurrent={exp.isCurrent}
                    language={language}
                    className="text-[11.5px] text-slate-500 font-sans"
                  />
                </div>
                <div className="text-slate-700 italic text-[12px] mb-0.5">{exp.company}</div>
                <p className="text-slate-600 text-[11.5px] font-sans whitespace-pre-line leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects (Previously Missing!) */}
      {projects && projects.length > 0 && (
        <div>
          <h2
            className="text-[13.5px] font-bold uppercase tracking-widest mb-2.5 pb-1 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.projects}
          </h2>
          <div className={itemGapClass}>
            {projects.map((proj) => (
              <div key={proj.id} className="font-sans">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-[12.5px]">{proj.name}</span>
                  <DateRangeText startDate={proj.startDate} endDate={proj.endDate} language={language} className="text-[11px] text-slate-500" />
                </div>
                {proj.role && (
                  <div className="text-[11.5px] text-slate-600 italic">
                    {labels.role}: {proj.role} {proj.technologies && `• ${labels.technologies}: ${proj.technologies}`}
                  </div>
                )}
                <p className="text-slate-600 text-[11.5px] mt-0.5 whitespace-pre-line">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations && educations.length > 0 && (
        <div>
          <h2
            className="text-[13.5px] font-bold uppercase tracking-widest mb-2.5 pb-1 border-b"
            style={{ color: primaryColor, borderColor: '#cbd5e1' }}
          >
            {labels.education}
          </h2>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-[12.5px]">{edu.school}</span>
                  <DateRangeText startDate={edu.startDate} endDate={edu.endDate} language={language} className="text-[11px] text-slate-500 font-sans" />
                </div>
                <div className="text-slate-700 text-[11.5px] font-sans">
                  <span>{edu.major}</span>
                  {edu.degree && <span> — {edu.degree}</span>}
                  {edu.gpa && <span> ({labels.gpa}: {edu.gpa})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Grid: Skills, Languages & Certificates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1 font-sans">
        {skills && skills.length > 0 && (
          <div>
            <h2
              className="text-[12.5px] font-bold uppercase tracking-widest mb-2 pb-1 border-b"
              style={{ color: primaryColor, borderColor: '#cbd5e1' }}
            >
              {labels.skills}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded border border-slate-200"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div>
            <h2
              className="text-[12.5px] font-bold uppercase tracking-widest mb-2 pb-1 border-b"
              style={{ color: primaryColor, borderColor: '#cbd5e1' }}
            >
              {labels.languages}
            </h2>
            <div className="space-y-1 text-[11.5px]">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-medium text-slate-800">{l.name}</span>
                  <span className="text-slate-500">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificates && certificates.length > 0 && (
          <div>
            <h2
              className="text-[12.5px] font-bold uppercase tracking-widest mb-2 pb-1 border-b"
              style={{ color: primaryColor, borderColor: '#cbd5e1' }}
            >
              {labels.certificates}
            </h2>
            <div className="space-y-1 text-[11px]">
              {certificates.map((c) => (
                <div key={c.id}>
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="text-slate-500"> ({c.organization} {c.issueDate})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
