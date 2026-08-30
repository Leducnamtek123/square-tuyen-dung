import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { Mail, Phone, MapPin, Globe, Sparkles, HeartHandshake, Briefcase, GraduationCap, Award } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../components/SocialIcons';
import { CVLanguage, getCVLabels } from './utils/cvDictionary';
import { getThemeStyles, hexToRgba, adjustColorBrightness } from './utils/themeStyles';
import { AvatarRenderer } from './components/AvatarRenderer';
import { DateRangeText } from './components/DateRangeText';

interface TemplateProps {
  data: CVData;
  language?: CVLanguage;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#e11d48';
  const { fontFamily, fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);

  const gradientBottom = adjustColorBrightness(primaryColor, -55);

  return (
    <div
      className={`w-full bg-white text-slate-800 ${fontSizeClass} shadow-sm min-h-[1050px] flex flex-row`}
      style={{ fontFamily }}
    >
      {/* Left Colorful Column (36%) */}
      <div
        className="w-[36%] p-7 text-white flex flex-col gap-6 shrink-0"
        style={{
          background: `linear-gradient(180deg, ${primaryColor} 0%, ${gradientBottom} 100%)`,
        }}
      >
        {/* Avatar */}
        {theme.showAvatar && (
          <div className="flex justify-center">
            <AvatarRenderer
              avatarUrl={personalInfo.avatarUrl}
              fullName={personalInfo.fullName}
              size={120}
              borderRadius={avatarRadius}
              borderColor="rgba(255, 255, 255, 0.9)"
              borderWidth={4}
              fallbackBg="rgba(255, 255, 255, 0.2)"
              fallbackTextColor="#ffffff"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2.5 text-[11.5px] text-white/90">
          <div className="text-[13px] font-black uppercase tracking-wider pb-1 border-b border-white/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{labels.contactInfo}</span>
          </div>
          {personalInfo.email && (
            <div className="flex items-center gap-2 break-all">
              <Mail className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.phoneNumber}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.address}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2 break-all">
              <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2 break-all">
              <LinkedinIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2 break-all">
              <GithubIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.github}</span>
            </div>
          )}
        </div>

        {/* Skills Pills */}
        {skills && skills.length > 0 && (
          <div>
            <div className="text-[13px] font-black uppercase tracking-wider pb-1 mb-2.5 border-b border-white/20">
              {labels.coreSkills}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold text-white border border-white/20"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div>
            <div className="text-[13px] font-black uppercase tracking-wider pb-1 mb-2 border-b border-white/20">
              {labels.languages}
            </div>
            <div className="space-y-1.5 text-[11.5px]">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-semibold">{l.name}</span>
                  <span className="text-white/80">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <div>
            <div className="text-[13px] font-black uppercase tracking-wider pb-1 mb-2 border-b border-white/20">
              {labels.education}
            </div>
            <div className="space-y-2 text-[11px]">
              {educations.map((e) => (
                <div key={e.id}>
                  <div className="font-bold text-white">{e.school}</div>
                  <div className="text-white/85">
                    {e.major} (<DateRangeText startDate={e.startDate} endDate={e.endDate} language={language} />)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (64%) */}
      <div className={`w-[64%] p-8 flex flex-col ${sectionGapClass}`}>
        {/* Name Header */}
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
            {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
          </h1>
          <div
            className="text-[13.5px] font-bold uppercase tracking-wider mt-1 inline-block px-3 py-1 rounded text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {personalInfo.title || (language === 'vi' ? 'Vị trí sáng tạo' : 'Creative Specialist')}
          </div>
        </div>

        {/* Bio */}
        {personalInfo.bio && (
          <div
            className="p-4 rounded-xl border cv-section break-inside-avoid"
            style={{
              backgroundColor: hexToRgba(primaryColor, 0.04),
              borderColor: hexToRgba(primaryColor, 0.15),
            }}
          >
            <div className="flex items-center gap-1.5 font-bold uppercase text-[12px] mb-1.5" style={{ color: primaryColor }}>
              <HeartHandshake className="w-4 h-4" />
              <span>{labels.aboutMe}</span>
            </div>
            <p className="text-slate-700 text-[12px] leading-relaxed whitespace-pre-line">
              {personalInfo.bio}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div className="cv-section">
            <h2
              className="text-[13.5px] font-black uppercase tracking-wider pb-1 mb-3.5 border-b-2 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              <Briefcase className="w-4 h-4" />
              <span>{labels.workExperience}</span>
            </h2>
            <div className={itemGapClass}>
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 break-inside-avoid cv-item" style={{ borderColor: primaryColor }}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-[13px]">{exp.position}</h3>
                    <DateRangeText
                      startDate={exp.startDate}
                      endDate={exp.endDate}
                      isCurrent={exp.isCurrent}
                      language={language}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                    />
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700 mb-1">{exp.company}</div>
                  <p className="text-slate-600 text-[11.5px] whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="cv-section">
            <h2
              className="text-[13.5px] font-black uppercase tracking-wider pb-1 mb-3 border-b-2 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{labels.projects}</span>
            </h2>
            <div className={itemGapClass}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl border break-inside-avoid cv-item"
                  style={{
                    backgroundColor: hexToRgba(primaryColor, 0.02),
                    borderColor: hexToRgba(primaryColor, 0.12),
                  }}
                >
                  <div className="font-bold text-slate-900 text-[12.5px]">{proj.name}</div>
                  {proj.role && (
                    <div className="text-[11.5px] text-slate-600 font-medium mt-0.5">
                      {labels.role}: <span className="font-semibold">{proj.role}</span>
                      {proj.technologies && <span> • {labels.technologies}: {proj.technologies}</span>}
                    </div>
                  )}
                  <p className="text-slate-600 text-[11.5px] mt-1 whitespace-pre-line">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates && certificates.length > 0 && (
          <div className="cv-section break-inside-avoid">
            <h2
              className="text-[13.5px] font-black uppercase tracking-wider pb-1 mb-2 border-b-2 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              <Award className="w-4 h-4" />
              <span>{labels.certificates}</span>
            </h2>
            <div className="space-y-1.5 text-[11.5px]">
              {certificates.map((c) => (
                <div key={c.id} className="flex justify-between">
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="text-slate-500">{c.organization} ({c.issueDate})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
