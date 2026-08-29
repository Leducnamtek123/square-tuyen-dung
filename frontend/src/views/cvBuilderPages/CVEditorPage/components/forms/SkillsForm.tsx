import React, { useState } from 'react';
import { CVSkillItem, CVLanguageItem, CVCertificateItem, CVProjectItem } from '@/types/cvBuilder';
import { Plus, Trash2, Code2, Languages, Award, FolderKanban } from 'lucide-react';

interface SkillsFormProps {
  skills: CVSkillItem[];
  languages: CVLanguageItem[];
  certificates: CVCertificateItem[];
  projects: CVProjectItem[];
  onUpdateSkills: (items: CVSkillItem[]) => void;
  onUpdateLanguages: (items: CVLanguageItem[]) => void;
  onUpdateCertificates: (items: CVCertificateItem[]) => void;
  onUpdateProjects: (items: CVProjectItem[]) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({
  skills,
  languages,
  certificates,
  projects,
  onUpdateSkills,
  onUpdateLanguages,
  onUpdateCertificates,
  onUpdateProjects,
}) => {
  const [newSkillText, setNewSkillText] = useState('');

  // Skills handlers
  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    onUpdateSkills([
      ...skills,
      {
        id: `sk-${Date.now()}`,
        name: newSkillText.trim(),
        level: 5,
      },
    ]);
    setNewSkillText('');
  };

  const handleDeleteSkill = (id: string) => {
    onUpdateSkills(skills.filter((s) => s.id !== id));
  };

  // Languages handlers
  const handleAddLanguage = () => {
    onUpdateLanguages([
      ...languages,
      {
        id: `lang-${Date.now()}`,
        name: '',
        proficiency: 'Thành thạo',
      },
    ]);
  };

  // Certificates handlers
  const handleAddCert = () => {
    onUpdateCertificates([
      ...certificates,
      {
        id: `cert-${Date.now()}`,
        name: '',
        organization: '',
        issueDate: '',
      },
    ]);
  };

  // Projects handlers
  const handleAddProject = () => {
    onUpdateProjects([
      ...projects,
      {
        id: `proj-${Date.now()}`,
        name: '',
        role: '',
        description: '',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Skills Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
          <Code2 className="w-4 h-4 text-blue-600" />
          <span>Kỹ năng chuyên môn</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillText}
            onChange={(e) => setNewSkillText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            placeholder="Nhập kỹ năng (VD: React, Figma, SEO, Bán hàng...)"
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
          <button
            onClick={handleAddSkill}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Thêm
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <span>{skill.name}</span>
              <button
                onClick={() => handleDeleteSkill(skill.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Languages Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Languages className="w-4 h-4 text-blue-600" />
            <span>Trình độ Ngoại ngữ</span>
          </div>
          <button
            onClick={handleAddLanguage}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            + Thêm ngoại ngữ
          </button>
        </div>

        <div className="space-y-2">
          {languages.map((lang) => (
            <div key={lang.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={lang.name}
                onChange={(e) =>
                  onUpdateLanguages(
                    languages.map((l) => (l.id === lang.id ? { ...l, name: e.target.value } : l))
                  )
                }
                placeholder="Tiếng Anh / Tiếng Nhật..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                value={lang.proficiency}
                onChange={(e) =>
                  onUpdateLanguages(
                    languages.map((l) =>
                      l.id === lang.id ? { ...l, proficiency: e.target.value } : l
                    )
                  )
                }
                placeholder="IELTS 7.0 / Thành thạo..."
                className="w-36 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <button
                onClick={() => onUpdateLanguages(languages.filter((l) => l.id !== lang.id))}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Certificates Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Chứng chỉ & Giải thưởng</span>
          </div>
          <button
            onClick={handleAddCert}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            + Thêm chứng chỉ
          </button>
        </div>

        <div className="space-y-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) =>
                    onUpdateCertificates(
                      certificates.map((c) => (c.id === cert.id ? { ...c, name: e.target.value } : c))
                    )
                  }
                  placeholder="Tên chứng chỉ (VD: AWS Certified Cloud Practitioner)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => onUpdateCertificates(certificates.filter((c) => c.id !== cert.id))}
                  className="text-slate-400 hover:text-red-500 p-1 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={cert.organization}
                  onChange={(e) =>
                    onUpdateCertificates(
                      certificates.map((c) =>
                        c.id === cert.id ? { ...c, organization: e.target.value } : c
                      )
                    )
                  }
                  placeholder="Tổ chức cấp (VD: Amazon Web Services)"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  value={cert.issueDate}
                  onChange={(e) =>
                    onUpdateCertificates(
                      certificates.map((c) =>
                        c.id === cert.id ? { ...c, issueDate: e.target.value } : c
                      )
                    )
                  }
                  placeholder="Năm cấp (VD: 2023)"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            <span>Dự án tiêu biểu</span>
          </div>
          <button
            onClick={handleAddProject}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            + Thêm dự án
          </button>
        </div>

        <div className="space-y-2">
          {projects.map((proj) => (
            <div key={proj.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) =>
                    onUpdateProjects(
                      projects.map((p) => (p.id === proj.id ? { ...p, name: e.target.value } : p))
                    )
                  }
                  placeholder="Tên dự án"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                />
                <button
                  onClick={() => onUpdateProjects(projects.filter((p) => p.id !== proj.id))}
                  className="text-slate-400 hover:text-red-500 p-1 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={proj.role}
                  onChange={(e) =>
                    onUpdateProjects(
                      projects.map((p) => (p.id === proj.id ? { ...p, role: e.target.value } : p))
                    )
                  }
                  placeholder="Vai trò của bạn"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  value={proj.technologies || ''}
                  onChange={(e) =>
                    onUpdateProjects(
                      projects.map((p) =>
                        p.id === proj.id ? { ...p, technologies: e.target.value } : p
                      )
                    )
                  }
                  placeholder="Công nghệ sử dụng"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <textarea
                rows={2}
                value={proj.description}
                onChange={(e) =>
                  onUpdateProjects(
                    projects.map((p) =>
                      p.id === proj.id ? { ...p, description: e.target.value } : p
                    )
                  )
                }
                placeholder="Mô tả kết quả đạt được..."
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
