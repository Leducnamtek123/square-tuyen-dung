import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { Mail, Phone, MapPin, Globe, Terminal, GitBranch, Cpu, Code2, Star, Award, GraduationCap } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../components/SocialIcons';
import { CVLanguage, getCVLabels } from './utils/cvDictionary';
import { getThemeStyles, hexToRgba } from './utils/themeStyles';
import { AvatarRenderer } from './components/AvatarRenderer';
import { DateRangeText } from './components/DateRangeText';

interface TemplateProps {
  data: CVData;
  language?: CVLanguage;
}

export const TechTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#0ea5e9';
  const { fontFamily, fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);

  return (
    <div
      className={`w-full bg-[#0b0f19] text-slate-200 p-8 sm:p-10 ${fontSizeClass} shadow-sm min-h-[1050px] flex flex-col ${sectionGapClass}`}
      style={{ fontFamily }}
    >
      {/* Header with Developer Terminal Aesthetic */}
      <div
        className="p-6 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5"
        style={{
          backgroundColor: '#111827',
          borderColor: hexToRgba(primaryColor, 0.25),
          boxShadow: `0 4px 20px ${hexToRgba(primaryColor, 0.08)}`,
        }}
      >
        <div className="flex items-center gap-4">
          {theme.showAvatar && (
            <AvatarRenderer
              avatarUrl={personalInfo.avatarUrl}
              fullName={personalInfo.fullName}
              size={80}
              borderRadius={avatarRadius}
              borderColor={primaryColor}
              borderWidth={2}
              fallbackBg="#1f2937"
              fallbackTextColor="#94a3b8"
            />
          )}
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] mb-1" style={{ color: primaryColor }}>
              <Terminal className="w-3.5 h-3.5" />
              <span>{labels.developerPrompt}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
            </h1>
            <div className="text-[13.5px] font-mono font-bold mt-0.5" style={{ color: primaryColor }}>
              {`> `}
              {personalInfo.title || (language === 'vi' ? 'Kỹ Sư Phần Mềm / IT Specialist' : 'Software Engineer / IT')}
            </div>
          </div>
        </div>

        {/* Links & Contacts */}
        <div className="flex flex-col gap-1.5 text-[11.5px] text-slate-300 font-mono">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span className="truncate">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{personalInfo.phoneNumber}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2">
              <GithubIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span className="truncate">{personalInfo.github}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <LinkedinIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span className="truncate">{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span className="truncate">{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span className="truncate">{personalInfo.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Summary */}
      {personalInfo.bio && (
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: '#111827',
            borderColor: '#1f2937',
          }}
        >
          <div className="flex items-center gap-2 font-bold uppercase text-[12px] mb-1.5 font-mono text-white">
            <Cpu className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{labels.profileSummary}</span>
          </div>
          <p className="text-slate-300 text-[12px] leading-relaxed whitespace-pre-line">
            {personalInfo.bio}
          </p>
        </div>
      )}

      {/* Tech Stack / Skills Badges */}
      {skills && skills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 font-bold uppercase text-[12.5px] mb-2.5 pb-1 border-b border-slate-800 text-white font-mono">
            <Code2 className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{labels.technicalSkills}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <div
                key={s.id}
                className="px-2.5 py-1 font-mono text-[11px] rounded-md border flex items-center gap-1.5"
                style={{
                  backgroundColor: '#111827',
                  borderColor: hexToRgba(primaryColor, 0.3),
                  color: '#e2e8f0',
                }}
              >
                <span className="font-semibold">{s.name}</span>
                {s.level ? (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded flex items-center gap-0.5"
                    style={{ backgroundColor: '#1f2937', color: primaryColor }}
                  >
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>{s.level}/5</span>
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {experiences && experiences.length > 0 && (
        <div>
          <div className="flex items-center gap-2 font-bold uppercase text-[12.5px] mb-3 pb-1 border-b border-slate-800 text-white font-mono">
            <GitBranch className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{labels.workExperience}</span>
          </div>
          <div className={itemGapClass}>
            {experiences.map((exp) => (
              <div key={exp.id} className="relative pl-4 border-l-2 border-slate-800">
                <div
                  className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="font-bold text-white text-[13px]">{exp.position}</h3>
                  <DateRangeText
                    startDate={exp.startDate}
                    endDate={exp.endDate}
                    isCurrent={exp.isCurrent}
                    language={language}
                    className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                  />
                </div>
                <div className="text-[12px] font-mono font-semibold mt-0.5 mb-1" style={{ color: primaryColor }}>
                  {exp.company}
                </div>
                <p className="text-slate-300 text-[12px] whitespace-pre-line leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Projects & Open Source */}
      {projects && projects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 font-bold uppercase text-[12.5px] mb-3 pb-1 border-b border-slate-800 text-white font-mono">
            <Terminal className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{labels.projects}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: '#111827',
                  borderColor: '#1f2937',
                }}
              >
                <div className="font-bold text-white text-[12.5px]">{proj.name}</div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: primaryColor }}>
                  {proj.role} {proj.technologies && `• [${proj.technologies}]`}
                </div>
                <p className="text-slate-300 text-[11.5px] mt-1 whitespace-pre-line">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education, Languages & Certs in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {educations && educations.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-bold uppercase text-[12px] mb-2 pb-1 border-b border-slate-800 text-white font-mono">
              <GraduationCap className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{labels.education}</span>
            </div>
            <div className="space-y-2">
              {educations.map((e) => (
                <div key={e.id} className="text-[11.5px]">
                  <div className="font-bold text-slate-200">{e.school}</div>
                  <div className="text-slate-400">
                    {e.major} (<DateRangeText startDate={e.startDate} endDate={e.endDate} language={language} />)
                  </div>
                  {e.gpa && <div className="text-slate-500 text-[10.5px] font-mono">GPA: {e.gpa}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-bold uppercase text-[12px] mb-2 pb-1 border-b border-slate-800 text-white font-mono">
              <Globe className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{labels.languages}</span>
            </div>
            <div className="space-y-1 text-[11.5px]">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between text-slate-300 font-mono">
                  <span className="font-medium text-slate-200">{l.name}</span>
                  <span className="text-slate-400">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificates && certificates.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-bold uppercase text-[12px] mb-2 pb-1 border-b border-slate-800 text-white font-mono">
              <Award className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{labels.certificates}</span>
            </div>
            <div className="space-y-1.5 text-[11.5px]">
              {certificates.map((c) => (
                <div key={c.id} className="text-slate-300">
                  <span className="font-medium text-slate-200">{c.name}</span>
                  {c.organization && <div className="text-slate-500 text-[10.5px]">{c.organization} {c.issueDate ? `(${c.issueDate})` : ''}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
