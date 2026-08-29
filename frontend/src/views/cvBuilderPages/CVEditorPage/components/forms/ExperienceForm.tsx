import React from 'react';
import { CVExperienceItem } from '@/types/cvBuilder';
import { Plus, Trash2, GripVertical, Briefcase, Calendar } from 'lucide-react';

interface ExperienceFormProps {
  items: CVExperienceItem[];
  onChange: (items: CVExperienceItem[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ items, onChange }) => {
  const handleAddItem = () => {
    const newItem: CVExperienceItem = {
      id: `exp-${Date.now()}`,
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof CVExperienceItem, value: any) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          Liệt kê các kinh nghiệm làm việc theo thứ tự từ gần nhất đến xa nhất.
        </span>
        <button
          onClick={handleAddItem}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm kinh nghiệm</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Chưa có thông tin kinh nghiệm làm việc</p>
          <button
            onClick={handleAddItem}
            className="mt-2 text-xs text-blue-600 font-bold hover:underline"
          >
            + Thêm kinh nghiệm đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-xs font-bold text-slate-700">
                  #{index + 1} {item.position || 'Vị trí công việc'}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                  title="Xóa kinh nghiệm này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Vị trí / Chức danh</label>
                  <input
                    type="text"
                    value={item.position}
                    onChange={(e) => handleUpdateItem(item.id, 'position', e.target.value)}
                    placeholder="VD: Senior Frontend Developer"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Công ty / Doanh nghiệp</label>
                  <input
                    type="text"
                    value={item.company}
                    onChange={(e) => handleUpdateItem(item.id, 'company', e.target.value)}
                    placeholder="VD: Công ty TNHH Square Studio"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Bắt đầu</label>
                  <input
                    type="text"
                    value={item.startDate}
                    onChange={(e) => handleUpdateItem(item.id, 'startDate', e.target.value)}
                    placeholder="MM/YYYY (VD: 03/2022)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kết thúc</label>
                  <input
                    type="text"
                    value={item.endDate}
                    onChange={(e) => handleUpdateItem(item.id, 'endDate', e.target.value)}
                    placeholder="MM/YYYY hoặc 'Hiện tại'"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mô tả công việc & Thành tựu đạt được</label>
                <textarea
                  rows={3}
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  placeholder="• Chịu trách nhiệm phát triển...&#10;• Đạt mốc tăng trưởng..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
