import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../components/SocialIcons';
import { CVLanguage, getCVLabels } from './utils/cvDictionary';
import { getThemeStyles, hexToRgba } from './utils/themeStyles';
import { AvatarRenderer } from './components/AvatarRenderer';
import { DateRangeText } from './components/DateRangeText';

interface TemplateProps {
  data: CVData;
  language?: CVLanguage;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#065f46';
  const { fontFamily, fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);

  return (
    <div
      className={`w-full bg-white text-slate-800 ${fontSizeClass} leading-relaxed shadow-sm min-h-[1050px]`}
      style={{ fontFamily }}
    >
      {/* Top Banner Header with Primary Color */}
      <div
        className="p-8 text-white relative overflow-hidden flex flex-col sm:flex-row items-center gap-6"
        style={{ backgroundColor: primaryColor }}
      >
        {theme.showAvatar && (
          <AvatarRenderer
            avatarUrl={personalInfo.avatarUrl}
            fullName={personalInfo.fullName}
            size={96}
            borderRadius={avatarRadius}
            borderColor="rgba(255, 255, 255, 0.85)"
            borderWidth={3}
            fallbackBg="rgba(255, 255, 255, 0.2)"
            fallbackTextColor="#ffffff"
          />
        )}

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
          </h1>
          <div className="text-[13px] font-semibold text-white/90 uppercase tracking-widest mt-1">
            {personalInfo.title || (language === 'vi' ? 'Vị trí quản lý / Chuyên gia' : 'Executive / Leadership')}
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-2.5 text-[11.5px] text-white/85">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 opacity-80" />
                <span>{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 opacity-80" />
                <span>{personalInfo.phoneNumber}</span>
              </span>
            )}
            {personalInfo.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 opacity-80" />
                <span>{personalInfo.address}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <LinkedinIcon className="w-3.5 h-3.5 opacity-80" />
                <span>{personalInfo.linkedin}</span>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1">
                <GithubIcon className="w-3.5 h-3.5 opacity-80" />
                <span>{personalInfo.github}</span>
              </span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 opacity-80" />
                <span>{personalInfo.website}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Content */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className={`md:col-span-2 flex flex-col ${sectionGapClass}`}>
          {/* Executive Summary */}
          {personalInfo.bio && (
            <div>
              <div
                className="text-[13px] font-bold uppercase tracking-wider pb-1 mb-2 border-b-2 flex items-center gap-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{labels.profileSummary}</span>
              </div>
              <p className="text-slate-600 text-[12px] leading-relaxed whitespace-pre-line">
                {personalInfo.bio}
              </p>
            </div>
          )}

          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <div>
              <div
                className="text-[13px] font-bold uppercase tracking-wider pb-1 mb-3 border-b-2 flex items-center gap-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                <Briefcase className="w-4 h-4" />
                <span>{labels.workExperience}</span>
              </div>
              <div className={itemGapClass}>
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 pl-3.5" style={{ borderColor: primaryColor }}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-[13px]">{exp.position}</h3>
                      <DateRangeText
                        startDate={exp.startDate}
                        endDate={exp.endDate}
                        isCurrent={exp.isCurrent}
                        language={language}
                        className="text-[11px] font-semibold text-slate-500"
                      />
                    </div>
                    <div className="text-[12px] font-semibold text-slate-700 mb-0.5">{exp.company}</div>
                    <p className="text-slate-600 text-[11.5px] whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Projects */}
          {projects && projects.length > 0 && (
            <div>
              <div
                className="text-[13px] font-bold uppercase tracking-wider pb-1 mb-3 border-b-2 flex items-center gap-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                <Award className="w-4 h-4" />
                <span>{labels.keyProjects}</span>
              </div>
              <div className={itemGapClass}>
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded border"
                    style={{
                      backgroundColor: hexToRgba(primaryColor, 0.03),
                      borderColor: hexToRgba(primaryColor, 0.15),
                    }}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-[12px]">{proj.name}</span>
                      <DateRangeText startDate={proj.startDate} endDate={proj.endDate} language={language} className="text-[10.5px] text-slate-500" />
                    </div>
                    <div className="text-[11.5px] text-slate-600 font-medium mt-0.5">
                      {labels.role}: <span className="font-semibold text-slate-800">{proj.role}</span>
                      {proj.technologies && <span> • {labels.technologies}: {proj.technologies}</span>}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1 whitespace-pre-line">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (1 col) */}
        <div className={`flex flex-col ${sectionGapClass}`}>
          {/* Education */}
          {educations && educations.length > 0 && (
            <div>
              <div
                className="text-[13px] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b-2 flex items-center gap-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{labels.education}</span>
              </div>
              <div className="space-y-2.5">
                {educations.map((edu) => (
                  <div key={edu.id} className="text-[11.5px]">
                    <div className="font-bold text-slate-900">{edu.school}</div>
                    <div className="text-slate-700 font-medium">{edu.major}</div>
                    <div className="text-slate-500 text-[10.5px]">
                      {edu.degree} (<DateRangeText startDate={edu.startDate} endDate={edu.endDate} language={language} />)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Competencies */}
          {skills && skills.length > 0 && (
            <div>
              <div
                className="text-[13px] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                {labels.coreSkills}
              </div>
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <div key={s.id} className="flex justify-between items-center text-[11.5px]">
                    <span className="font-medium text-slate-700">{s.name}</span>
                    {s.level ? (
                      <span
                        className="font-bold text-[10.5px] px-2 py-0.5 rounded border"
                        style={{
                          color: primaryColor,
                          backgroundColor: hexToRgba(primaryColor, 0.06),
                          borderColor: hexToRgba(primaryColor, 0.2),
                        }}
                      >
                        {labels.level} {s.level}/5
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <div
                className="text-[13px] font-bold uppercase tracking-wider pb-1 mb-2 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                {labels.languages}
              </div>
              <div className="space-y-1.5 text-[11.5px]">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-semibold text-slate-800">{l.name}</span>
                    <span className="text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div>
              <div
                className="text-[13px] font-bold uppercase tracking-wider pb-1 mb-2 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                {labels.certificates}
              </div>
              <div className="space-y-1.5 text-[11px]">
                {certificates.map((c) => (
                  <div key={c.id} className="border-b border-slate-100 pb-1">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-slate-500 text-[10.5px]">{c.organization} ({c.issueDate})</div>
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
