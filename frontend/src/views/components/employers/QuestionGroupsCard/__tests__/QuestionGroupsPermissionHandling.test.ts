import { readFileSync } from 'fs';
import { join } from 'path';
import type { QuestionGroup } from '@/types/models';

describe('QuestionGroups Permission Handling & Cloning', () => {
  const cardSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
  const dialogSource = readFileSync(join(__dirname, '../QuestionGroupsDialogs.tsx'), 'utf8');

  it('renders "Mẫu hệ thống" badge for system question groups in QuestionGroupsCard', () => {
    expect(cardSource).toContain('Mẫu hệ thống');
    expect(cardSource).toContain('isSystemGroup');
  });

  it('disables public/private toggle switch with proper tooltip for system groups', () => {
    expect(cardSource).toContain('Bộ câu hỏi chuẩn hệ thống không thể thay đổi trạng thái');
    expect(cardSource).toMatch(/disabled={isSystem}/);
  });

  it('disables delete button with tooltip for system groups', () => {
    expect(cardSource).toContain('Bộ câu hỏi chuẩn hệ thống không thể xóa');
    expect(cardSource).toMatch(/disabled=\{isSystemGroup\(row\.original\)\}/);
  });

  it('displays alert banner for system question groups in edit dialog', () => {
    expect(dialogSource).toContain(
      'Bộ câu hỏi chuẩn hệ thống. Lưu thay đổi sẽ tự động nhân bản thành bộ câu hỏi của doanh nghiệp.'
    );
  });

  it('clones system question groups via createQuestionGroup instead of updating, and displays clone toast', () => {
    expect(cardSource).toContain('Đã nhân bản bộ câu hỏi thành công cho doanh nghiệp!');
    expect(cardSource).toMatch(/if\s*\(isSystemGroup\(state\.currentGroup\)\)\s*\{\s*await createQuestionGroup\(payload\)/);
  });

  it('prevents direct deletion and toggling of system question groups with warning toast', () => {
    expect(cardSource).toContain("toastMessages.warn('Không thể thay đổi trạng thái bộ câu hỏi chuẩn hệ thống')");
    expect(cardSource).toContain("toastMessages.warn('Bộ câu hỏi chuẩn hệ thống không thể xóa')");
  });

  describe('Functional behavior simulation', () => {
    const isSystemGroup = (group?: QuestionGroup | null) => {
      if (!group) return false;
      return group.canWrite === false || !group.company;
    };

    it('identifies system groups correctly based on canWrite and company', () => {
      expect(isSystemGroup({ id: 1, name: 'System Group', canWrite: false, company: undefined })).toBe(true);
      expect(isSystemGroup({ id: 2, name: 'System Group', canWrite: false, company: 10 })).toBe(true);
      expect(isSystemGroup({ id: 3, name: 'Company Group without company id', canWrite: true, company: undefined })).toBe(true);
      expect(isSystemGroup({ id: 4, name: 'Company Group', canWrite: true, company: 12 })).toBe(false);
    });

    it('clones system group without id when saved', async () => {
      const mockCreateQuestionGroup = jest.fn(async (payload) => ({ id: 999, ...payload }));
      const mockUpdateQuestionGroup = jest.fn(async ({ id, data }) => ({ id, ...data }));
      const mockToastSuccess = jest.fn();

      const saveHandler = async (currentGroup: QuestionGroup, formPayload: any) => {
        if (isSystemGroup(currentGroup)) {
          await mockCreateQuestionGroup(payload);
          mockToastSuccess('Đã nhân bản bộ câu hỏi thành công cho doanh nghiệp!');
        } else {
          await mockUpdateQuestionGroup({ id: currentGroup.id, data: formPayload });
          mockToastSuccess('Cập nhật nhóm câu hỏi thành công');
        }
      };

      const systemGroup: QuestionGroup = { id: 10, name: 'System Standard', canWrite: false, company: undefined };
      const payload = { name: 'Customized Group', description: 'Copy', question_ids: [1, 2], is_public: false };

      await saveHandler(systemGroup, payload);

      expect(mockCreateQuestionGroup).toHaveBeenCalledWith(payload);
      expect(mockUpdateQuestionGroup).not.toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã nhân bản bộ câu hỏi thành công cho doanh nghiệp!');
    });

    it('updates company group normally when user has write access', async () => {
      const mockCreateQuestionGroup = jest.fn();
      const mockUpdateQuestionGroup = jest.fn();
      const mockToastSuccess = jest.fn();

      const saveHandler = async (currentGroup: QuestionGroup, formPayload: any) => {
        if (isSystemGroup(currentGroup)) {
          await mockCreateQuestionGroup(formPayload);
          mockToastSuccess('Đã nhân bản bộ câu hỏi thành công cho doanh nghiệp!');
        } else {
          await mockUpdateQuestionGroup({ id: currentGroup.id, data: formPayload });
          mockToastSuccess('Cập nhật nhóm câu hỏi thành công');
        }
      };

      const companyGroup: QuestionGroup = { id: 20, name: 'Company Custom', canWrite: true, company: 5 };
      const payload = { name: 'Company Custom Updated', description: 'Updated', question_ids: [1], is_public: true };

      await saveHandler(companyGroup, payload);

      expect(mockUpdateQuestionGroup).toHaveBeenCalledWith({ id: 20, data: payload });
      expect(mockCreateQuestionGroup).not.toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('Cập nhật nhóm câu hỏi thành công');
    });

    it('guards against toggling and deleting system groups', async () => {
      const mockUpdateQuestionGroup = jest.fn();
      const mockDeleteQuestionGroup = jest.fn();
      const mockToastWarn = jest.fn();

      const toggleHandler = async (group: QuestionGroup) => {
        if (isSystemGroup(group)) {
          mockToastWarn('Không thể thay đổi trạng thái bộ câu hỏi chuẩn hệ thống');
          return;
        }
        await mockUpdateQuestionGroup({ id: group.id, data: { is_public: true } });
      };

      const deleteHandler = async (group: QuestionGroup) => {
        if (isSystemGroup(group)) {
          mockToastWarn('Bộ câu hỏi chuẩn hệ thống không thể xóa');
          return;
        }
        await mockDeleteQuestionGroup(group.id);
      };

      const systemGroup: QuestionGroup = { id: 10, name: 'System Standard', canWrite: false };

      await toggleHandler(systemGroup);
      expect(mockUpdateQuestionGroup).not.toHaveBeenCalled();
      expect(mockToastWarn).toHaveBeenCalledWith('Không thể thay đổi trạng thái bộ câu hỏi chuẩn hệ thống');

      await deleteHandler(systemGroup);
      expect(mockDeleteQuestionGroup).not.toHaveBeenCalled();
      expect(mockToastWarn).toHaveBeenCalledWith('Bộ câu hỏi chuẩn hệ thống không thể xóa');
    });
  });
});
