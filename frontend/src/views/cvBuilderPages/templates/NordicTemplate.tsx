import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { Mail, Phone, MapPin, Globe, Award, Sparkles, Briefcase, GraduationCap } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../components/SocialIcons';
import { CVLanguage, getCVLabels } from './utils/cvDictionary';
import { getThemeStyles, hexToRgba } from './utils/themeStyles';
import { AvatarRenderer } from './components/AvatarRenderer';
import { DateRangeText } from './components/DateRangeText';

interface TemplateProps {
  data: CVData;
  language?: CVLanguage;
}

export const NordicTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#0f172a';
  const { fontFamily, fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);

  return (
    <div
      className={`w-full bg-white text-slate-800 p-8 sm:p-10 ${fontSizeClass} shadow-sm min-h-[1050px] flex flex-col ${sectionGapClass}`}
      style={{ fontFamily }}
    >
      {/* Header: Nordic Asymmetric Clean Layout */}
      <div className="flex flex-row justify-between items-start gap-6 pb-5 border-b border-slate-200 cv-section break-inside-avoid">
        <div className="flex items-center gap-5">
          {theme.showAvatar && (
            <AvatarRenderer
              avatarUrl={personalInfo.avatarUrl}
              fullName={personalInfo.fullName}
              size={84}
              borderRadius={avatarRadius}
              borderColor={primaryColor}
              borderWidth={2}
            />
          )}
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">
              {labels.curriculumVitae}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
              {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
            </h1>
            <p className="text-[14px] font-medium text-slate-600 mt-1 tracking-wide">
              {personalInfo.title || (language === 'vi' ? 'Chuyên viên / Kỹ sư' : 'Professional Title')}
            </p>
          </div>
        </div>

        {/* Contact Info in Clean Minimal Card */}
        <div
          className="flex flex-col gap-1.5 text-[11.5px] text-slate-600 p-3.5 rounded-xl border min-w-[220px]"
          style={{
            backgroundColor: hexToRgba(primaryColor, 0.03),
            borderColor: hexToRgba(primaryColor, 0.12),
          }}
        >
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{personalInfo.phoneNumber}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{personalInfo.address}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <LinkedinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2">
              <GithubIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{personalInfo.github}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary / Bio */}
      {personalInfo.bio && (
        <div
          className="relative pl-4 border-l-2 py-0.5 cv-section break-inside-avoid"
          style={{ borderColor: primaryColor }}
        >
          <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-line">
            {personalInfo.bio}
          </p>
        </div>
      )}

      {/* Main Grid: 2 Columns (8 cols left / 4 cols right) */}
      <div className="grid grid-cols-12 gap-7">
        {/* Left Column: Experience & Projects (8 cols) */}
        <div className="col-span-8 flex flex-col gap-6">
          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <div className="cv-section">
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
                  {labels.workExperience}
                </h2>
              </div>

              <div className={itemGapClass}>
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l border-slate-200 break-inside-avoid cv-item">
                    <div
                      className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="flex flex-row items-baseline justify-between gap-1">
                      <h3 className="font-bold text-slate-900">{exp.position}</h3>
                      <DateRangeText
                        startDate={exp.startDate}
                        endDate={exp.endDate}
                        isCurrent={exp.isCurrent}
                        language={language}
                        className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                      />
                    </div>
                    <div className="text-[12px] font-semibold text-slate-700 mt-0.5 mb-1">
                      {exp.company}
                    </div>
                    {exp.description && (
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="cv-section">
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
                  {labels.projects}
                </h2>
              </div>

              <div className={itemGapClass}>
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl border break-inside-avoid cv-item"
                    style={{
                      backgroundColor: hexToRgba(primaryColor, 0.02),
                      borderColor: hexToRgba(primaryColor, 0.1),
                    }}
                  >
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900">{proj.name}</h3>
                      {proj.role && (
                        <span className="text-[11.5px] text-slate-500 font-medium">{proj.role}</span>
                      )}
                    </div>
                    {proj.technologies && (
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5 mb-1">
                        {labels.technologies}: {proj.technologies}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-slate-600 whitespace-pre-line mt-1">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right / Sidebar Column: Skills, Education, Certs, Languages (4 cols) */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="cv-section break-inside-avoid">
              <div className="flex items-center gap-2 mb-2.5 pb-1 border-b border-slate-200">
                <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-slate-900">
                  {labels.coreSkills}
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {educations && educations.length > 0 && (
            <div className="cv-section">
              <div className="flex items-center gap-2 mb-2.5 pb-1 border-b border-slate-200">
                <GraduationCap className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-slate-900">
                  {labels.education}
                </h2>
              </div>
              <div className="space-y-2.5">
                {educations.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid cv-item">
                    <div className="font-bold text-slate-900">{edu.school}</div>
                    <div className="text-slate-700 text-[11.5px]">{edu.major}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <DateRangeText startDate={edu.startDate} endDate={edu.endDate} language={language} />
                      {edu.gpa ? ` • ${labels.gpa}: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div className="cv-section break-inside-avoid">
              <div className="flex items-center gap-2 mb-2.5 pb-1 border-b border-slate-200">
                <Award className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-slate-900">
                  {labels.certificates}
                </h2>
              </div>
              <div className="space-y-2">
                {certificates.map((cert) => (
                  <div key={cert.id} className="text-[11.5px]">
                    <div className="font-bold text-slate-800">{cert.name}</div>
                    <div className="text-slate-500 text-[10.5px]">
                      {cert.organization} {cert.issueDate ? `(${cert.issueDate})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="cv-section break-inside-avoid">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                <Globe className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-slate-900">
                  {labels.languages}
                </h2>
              </div>
              <div className="space-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-[11.5px]">
                    <span className="font-medium text-slate-800">{lang.name}</span>
                    <span className="text-slate-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
