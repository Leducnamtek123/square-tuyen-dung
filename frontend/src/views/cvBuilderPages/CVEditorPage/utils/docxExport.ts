import { CVData } from '@/types/cvBuilder';
import { CVLanguage, getCVLabels } from '@/views/cvBuilderPages/templates/utils/cvDictionary';

/**
 * Generates and downloads a clean, formatted Microsoft Word (.doc / .docx compatible)
 * document from structured CVData with bilingual support (VI / EN).
 */
export const exportCVToDocx = (data: CVData, fileName?: string, language: CVLanguage = 'vi') => {
  const { personalInfo, experiences, educations, skills, languages, certificates, projects, title } = data;
  const labels = getCVLabels(language);
  const safeName = (fileName || personalInfo.fullName || title || 'Curriculum-Vitae').replace(/[/\\?%*:|"<>]/g, '-');

  const content = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${personalInfo.fullName || 'CV'}</title>
  <style>
    body {
      font-family: Arial, Calibri, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1e293b;
      margin: 1.5cm;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      color: #0f172a;
      margin: 0 0 4pt 0;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 13pt;
      font-weight: bold;
      color: #2563eb;
      margin: 0 0 8pt 0;
      text-transform: uppercase;
    }
    .contact-info {
      font-size: 10pt;
      color: #475569;
      margin-bottom: 16pt;
      border-bottom: 1.5pt solid #cbd5e1;
      padding-bottom: 8pt;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      border-bottom: 1pt solid #2563eb;
      padding-bottom: 3pt;
      margin-top: 14pt;
      margin-bottom: 8pt;
    }
    .item-header {
      font-size: 11pt;
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 2pt;
    }
    .item-sub {
      font-size: 10pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 4pt;
    }
    .item-date {
      float: right;
      font-size: 9.5pt;
      color: #64748b;
      font-weight: normal;
    }
    p {
      margin: 0 0 6pt 0;
    }
    ul {
      margin: 0 0 8pt 16pt;
      padding: 0;
    }
    li {
      margin-bottom: 3pt;
    }
    .skills-grid {
      margin: 4pt 0;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <h1>${personalInfo.fullName || (language === 'vi' ? 'HỌ VÀ TÊN' : 'FULL NAME')}</h1>
  <div class="subtitle">${personalInfo.title || (language === 'vi' ? 'VỊ TRÍ CHUYÊN MÔN' : 'PROFESSIONAL TITLE')}</div>
  <div class="contact-info">
    ${personalInfo.phoneNumber ? `<span>${labels.phone}: <b>${personalInfo.phoneNumber}</b></span> &nbsp;|&nbsp; ` : ''}
    ${personalInfo.email ? `<span>${labels.email}: <b>${personalInfo.email}</b></span> &nbsp;|&nbsp; ` : ''}
    ${personalInfo.address ? `<span>${labels.address}: ${personalInfo.address}</span>` : ''}
    ${personalInfo.linkedin ? `<br><span>LinkedIn: ${personalInfo.linkedin}</span>` : ''}
    ${personalInfo.github ? ` &nbsp;|&nbsp; <span>GitHub: ${personalInfo.github}</span>` : ''}
    ${personalInfo.website ? ` &nbsp;|&nbsp; <span>Website: ${personalInfo.website}</span>` : ''}
  </div>

  <!-- Bio / Summary -->
  ${
    personalInfo.bio
      ? `
    <div class="section-title">${labels.profileSummary.toUpperCase()}</div>
    <p>${personalInfo.bio.replace(/\n/g, '<br>')}</p>
  `
      : ''
  }

  <!-- Experience -->
  ${
    experiences && experiences.length > 0
      ? `
    <div class="section-title">${labels.workExperience.toUpperCase()}</div>
    ${experiences
      .map(
        (exp) => `
      <div style="margin-bottom: 10pt;">
        <div class="item-header">
          ${exp.position}
          <span class="item-date">${exp.startDate} - ${exp.isCurrent ? labels.present : exp.endDate || ''}</span>
        </div>
        <div class="item-sub">${exp.company}</div>
        <p>${exp.description ? exp.description.replace(/\n/g, '<br>') : ''}</p>
      </div>
    `
      )
      .join('')}
  `
      : ''
  }

  <!-- Education -->
  ${
    educations && educations.length > 0
      ? `
    <div class="section-title">${labels.education.toUpperCase()}</div>
    ${educations
      .map(
        (edu) => `
      <div style="margin-bottom: 8pt;">
        <div class="item-header">
          ${edu.school}
          <span class="item-date">${edu.startDate} - ${edu.endDate || ''}</span>
        </div>
        <div class="item-sub">${edu.major} ${edu.degree ? `(${edu.degree})` : ''} ${edu.gpa ? ` - ${labels.gpa}: ${edu.gpa}` : ''}</div>
        ${edu.description ? `<p>${edu.description}</p>` : ''}
      </div>
    `
      )
      .join('')}
  `
      : ''
  }

  <!-- Skills -->
  ${
    skills && skills.length > 0
      ? `
    <div class="section-title">${labels.technicalSkills.toUpperCase()}</div>
    <p class="skills-grid">
      <b>${labels.skills}:</b> ${skills.map((s) => s.name).join(' • ')}
    </p>
  `
      : ''
  }

  <!-- Projects -->
  ${
    projects && projects.length > 0
      ? `
    <div class="section-title">${labels.projects.toUpperCase()}</div>
    ${projects
      .map(
        (p) => `
      <div style="margin-bottom: 8pt;">
        <div class="item-header">${p.name} ${p.role ? `<span style="font-weight: normal; color: #475569;">(${p.role})</span>` : ''}</div>
        ${p.technologies ? `<div class="item-sub">${labels.techStack}: ${p.technologies}</div>` : ''}
        ${p.description ? `<p>${p.description.replace(/\n/g, '<br>')}</p>` : ''}
      </div>
    `
      )
      .join('')}
  `
      : ''
  }

  <!-- Certificates & Languages -->
  ${
    (certificates && certificates.length > 0) || (languages && languages.length > 0)
      ? `
    <div class="section-title">${labels.certificates.toUpperCase()} & ${labels.languages.toUpperCase()}</div>
    ${
      certificates && certificates.length > 0
        ? `
      <div style="margin-bottom: 6pt;">
        <b>${labels.certificates}:</b>
        <ul>
          ${certificates.map((c) => `<li>${c.name} - ${c.organization} (${c.issueDate})</li>`).join('')}
        </ul>
      </div>
    `
        : ''
    }
    ${
      languages && languages.length > 0
        ? `
      <div>
        <b>${labels.languages}:</b> ${languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}
      </div>
    `
        : ''
    }
  `
      : ''
  }
</body>
</html>
  `.trim();

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Exports CVData as a JSON backup file.
 */
export const exportCVToJSON = (data: CVData, fileName?: string) => {
  const safeName = (fileName || data.personalInfo.fullName || data.title || 'cv-backup').replace(/[/\\?%*:|"<>]/g, '-');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
