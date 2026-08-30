import React from 'react';
import { CVData } from '@/types/cvBuilder';
import { Mail, Phone, MapPin, Globe, Calendar, Award, Briefcase, GraduationCap, Code2, Languages } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../components/SocialIcons';
import { CVLanguage, getCVLabels } from './utils/cvDictionary';
import { getThemeStyles, hexToRgba } from './utils/themeStyles';
import { AvatarRenderer } from './components/AvatarRenderer';
import { DateRangeText } from './components/DateRangeText';

interface TemplateProps {
  data: CVData;
  language?: CVLanguage;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data, language = 'vi' }) => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, theme } = data;
  const labels = getCVLabels(language);
  const primaryColor = theme.primaryColor || '#1e40af';
  const { fontFamily, fontSizeClass, sectionGapClass, itemGapClass, avatarRadius } = getThemeStyles(theme);

  return (
    <div
      className={`w-full bg-white text-slate-800 ${fontSizeClass} leading-relaxed flex flex-row shadow-sm min-h-[1050px]`}
      style={{ fontFamily }}
    >
      {/* Left Column (Sidebar: 34%) */}
      <div className="w-[34%] bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-6 shrink-0">
        {/* Avatar */}
        {theme.showAvatar && (
          <div className="flex justify-center">
            <AvatarRenderer
              avatarUrl={personalInfo.avatarUrl}
              fullName={personalInfo.fullName}
              size={110}
              borderRadius={avatarRadius}
              borderColor={primaryColor}
              borderWidth={3}
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2.5 text-[11.5px] text-slate-600">
          <div
            className="text-[13px] font-bold tracking-wider uppercase pb-1 mb-2 border-b-2"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            {labels.contactInfo}
          </div>
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="break-all">{personalInfo.email}</span>
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
              <span>{personalInfo.address}</span>
            </div>
          )}
          {personalInfo.dob && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{personalInfo.dob}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="break-all">{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <LinkedinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="break-all">{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2">
              <GithubIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="break-all">{personalInfo.github}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <div
              className="text-[13px] font-bold tracking-wider uppercase pb-1 mb-3 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              {labels.skills}
            </div>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between text-[11.5px] font-medium text-slate-700 mb-1">
                    <span>{skill.name}</span>
                  </div>
                  {skill.level ? (
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(skill.level / 5) * 100}%`,
                          backgroundColor: primaryColor,
                        }}
                      />
                    </div>
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
              className="text-[13px] font-bold tracking-wider uppercase pb-1 mb-2.5 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              {labels.languages}
            </div>
            <div className="space-y-1.5">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between text-[11.5px]">
                  <span className="font-semibold text-slate-700">{lang.name}</span>
                  <span className="text-slate-500">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates && certificates.length > 0 && (
          <div>
            <div
              className="text-[13px] font-bold tracking-wider uppercase pb-1 mb-2.5 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              {labels.certificates}
            </div>
            <div className="space-y-2 text-[11.5px]">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-white p-2 rounded border border-slate-200">
                  <div className="font-semibold text-slate-800">{cert.name}</div>
                  <div className="text-slate-500 text-[10.5px]">
                    {cert.organization} {cert.issueDate ? `• ${cert.issueDate}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (Main Content: 66%) */}
      <div className={`w-[66%] p-7 flex flex-col ${sectionGapClass}`}>
        {/* Header Name & Title */}
        <div className="border-b border-slate-200 pb-3.5">
          <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: primaryColor }}>
            {personalInfo.fullName || (language === 'vi' ? 'Họ và Tên' : 'Full Name')}
          </h1>
          <div className="text-[14px] font-semibold text-slate-600 tracking-wide uppercase mt-1">
            {personalInfo.title || (language === 'vi' ? 'Vị trí ứng tuyển' : 'Job Title')}
          </div>
        </div>

        {/* Bio / Summary */}
        {personalInfo.bio && (
          <div>
            <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider mb-1.5" style={{ color: primaryColor }}>
              <Award className="w-4 h-4" />
              <span>{labels.profileSummary}</span>
            </div>
            <p className="text-slate-600 text-[12px] leading-relaxed whitespace-pre-line">
              {personalInfo.bio}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div className="cv-section">
            <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>
              <Briefcase className="w-4 h-4" />
              <span>{labels.workExperience}</span>
            </div>
            <div className={itemGapClass}>
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-slate-200 break-inside-avoid cv-item">
                  <div
                    className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex flex-wrap justify-between items-baseline gap-1">
                    <h3 className="font-bold text-slate-900 text-[13px]">{exp.position}</h3>
                    <DateRangeText
                      startDate={exp.startDate}
                      endDate={exp.endDate}
                      isCurrent={exp.isCurrent}
                      language={language}
                      className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
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

        {/* Education */}
        {educations && educations.length > 0 && (
          <div className="cv-section">
            <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>
              <GraduationCap className="w-4 h-4" />
              <span>{labels.education}</span>
            </div>
            <div className="space-y-2.5">
              {educations.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2 border-slate-200 break-inside-avoid cv-item">
                  <div
                    className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex flex-wrap justify-between items-baseline gap-1">
                    <h3 className="font-bold text-slate-900 text-[12.5px]">{edu.school}</h3>
                    <DateRangeText startDate={edu.startDate} endDate={edu.endDate} language={language} className="text-[11px] font-semibold text-slate-500" />
                  </div>
                  <div className="text-[11.5px] text-slate-700">
                    <span className="font-semibold">{edu.major}</span>
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
            <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider mb-2.5" style={{ color: primaryColor }}>
              <Code2 className="w-4 h-4" />
              <span>{labels.projects}</span>
            </div>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 break-inside-avoid cv-item">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-slate-800 text-[12px]">{proj.name}</h4>
                    <DateRangeText startDate={proj.startDate} endDate={proj.endDate} language={language} className="text-[10.5px] text-slate-400" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                    {labels.role}: <span className="font-semibold">{proj.role}</span>
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
      </div>
    </div>
  );
};
