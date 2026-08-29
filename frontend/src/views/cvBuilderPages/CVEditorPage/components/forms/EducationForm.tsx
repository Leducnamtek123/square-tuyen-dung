import React from 'react';
import { CVEducationItem } from '@/types/cvBuilder';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

interface EducationFormProps {
  items: CVEducationItem[];
  onChange: (items: CVEducationItem[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({ items, onChange }) => {
  const handleAddItem = () => {
    const newItem: CVEducationItem = {
      id: `edu-${Date.now()}`,
      school: '',
      major: '',
      degree: 'Cử nhân',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof CVEducationItem, value: any) => {
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
          Thông tin học vấn, bằng cấp và các khóa đào tạo chính quy.
        </span>
        <button
          onClick={handleAddItem}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm học vấn</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Chưa có thông tin học vấn</p>
          <button
            onClick={handleAddItem}
            className="mt-2 text-xs text-blue-600 font-bold hover:underline"
          >
            + Thêm trường đại học / cao đẳng
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
                  #{index + 1} {item.school || 'Trường đào tạo'}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                  title="Xóa mục này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Trường học / Viện đào tạo</label>
                  <input
                    type="text"
                    value={item.school}
                    onChange={(e) => handleUpdateItem(item.id, 'school', e.target.value)}
                    placeholder="Đại học Bách Khoa / Kinh Tế..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Chuyên ngành đào tạo</label>
                  <input
                    type="text"
                    value={item.major}
                    onChange={(e) => handleUpdateItem(item.id, 'major', e.target.value)}
                    placeholder="Khoa học máy tính / Quản trị KD..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Bằng cấp / Xếp loại</label>
                  <input
                    type="text"
                    value={item.degree || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'degree', e.target.value)}
                    placeholder="Cử nhân Giỏi / Kỹ sư..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Bắt đầu</label>
                  <input
                    type="text"
                    value={item.startDate}
                    onChange={(e) => handleUpdateItem(item.id, 'startDate', e.target.value)}
                    placeholder="2018"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tốt nghiệp</label>
                  <input
                    type="text"
                    value={item.endDate}
                    onChange={(e) => handleUpdateItem(item.id, 'endDate', e.target.value)}
                    placeholder="2022"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mô tả bổ sung / GPA (nếu có)</label>
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  placeholder="GPA 3.6/4.0 - Học bổng xuất sắc..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
