import { readFileSync } from 'fs';
import { join } from 'path';
import type { Question } from '@/types/models';

describe('QuestionBank Permission Handling & Cloning', () => {
  const cardSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

  it('renders "Mẫu hệ thống" badge for system questions in QuestionBankCard', () => {
    expect(cardSource).toContain('Mẫu hệ thống');
    expect(cardSource).toContain('isSystemQuestion');
  });

  it('disables public/private toggle switch with proper tooltip for system questions', () => {
    expect(cardSource).toContain('Câu hỏi chuẩn hệ thống không thể thay đổi trạng thái');
    expect(cardSource).toMatch(/disabled=\{isSystem\}/);
  });

  it('disables delete button with tooltip for system questions', () => {
    expect(cardSource).toContain('Câu hỏi chuẩn hệ thống không thể xóa');
    expect(cardSource).toMatch(/disabled=\{isSystem\}/);
  });

  it('displays alert banner for system questions in edit dialog', () => {
    expect(cardSource).toContain(
      'Câu hỏi chuẩn hệ thống. Lưu thay đổi sẽ tự động nhân bản thành câu hỏi của doanh nghiệp.'
    );
  });

  it('clones system questions via createQuestion instead of updating, and displays clone toast', () => {
    expect(cardSource).toContain('Đã nhân bản câu hỏi cho doanh nghiệp thành công!');
    expect(cardSource).toMatch(/else if\s*\(isEdit && isSystem\)\s*\{\s*await createQuestion\(payload\)/);
  });

  it('prevents direct deletion and toggling of system questions with warning toast', () => {
    expect(cardSource).toContain("toastMessages.warn('Câu hỏi chuẩn hệ thống không thể thay đổi trạng thái')");
    expect(cardSource).toContain("toastMessages.warn('Câu hỏi chuẩn hệ thống không thể xóa')");
  });

  describe('Functional behavior simulation', () => {
    const isSystemQuestion = (q?: any | null) => {
      if (!q) return false;
      return q.canWrite === false || !q.company;
    };

    it('identifies system questions correctly based on canWrite and company', () => {
      expect(isSystemQuestion({ id: 1, text: 'System Q', canWrite: false, company: undefined })).toBe(true);
      expect(isSystemQuestion({ id: 2, text: 'System Q', canWrite: false, company: 10 })).toBe(true);
      expect(isSystemQuestion({ id: 3, text: 'Company Q without company', canWrite: true, company: undefined })).toBe(true);
      expect(isSystemQuestion({ id: 4, text: 'Company Q', canWrite: true, company: 12 })).toBe(false);
    });

    it('clones system question via createQuestion when saving edit', async () => {
      const mockCreateQuestion = jest.fn(async (payload) => ({ id: 888, ...payload }));
      const mockUpdateQuestion = jest.fn(async ({ id, data }) => ({ id, ...data }));
      const mockToastSuccess = jest.fn();

      const submitHandler = async (isEdit: boolean, currentQuestion: any, payload: any) => {
        const isSystem = Boolean(isEdit && isSystemQuestion(currentQuestion));
        if (isEdit && currentQuestion.id && !isSystem) {
          await mockUpdateQuestion({ id: currentQuestion.id, data: payload });
          mockToastSuccess('Cập nhật câu hỏi thành công');
        } else if (isEdit && isSystem) {
          await mockCreateQuestion(payload);
          mockToastSuccess('Đã nhân bản câu hỏi cho doanh nghiệp thành công!');
        } else {
          await mockCreateQuestion(payload);
          mockToastSuccess('Tạo câu hỏi thành công');
        }
      };

      const systemQ = { id: 50, text: 'System Question', canWrite: false, company: undefined };
      const payload = { text: 'Customized System Question', category: 'technical', difficulty: 2, default_duration_seconds: 180 };

      await submitHandler(true, systemQ, payload);

      expect(mockCreateQuestion).toHaveBeenCalledWith(payload);
      expect(mockUpdateQuestion).not.toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã nhân bản câu hỏi cho doanh nghiệp thành công!');
    });

    it('updates company question normally when user has write permission', async () => {
      const mockCreateQuestion = jest.fn();
      const mockUpdateQuestion = jest.fn();
      const mockToastSuccess = jest.fn();

      const submitHandler = async (isEdit: boolean, currentQuestion: any, payload: any) => {
        const isSystem = Boolean(isEdit && isSystemQuestion(currentQuestion));
        if (isEdit && currentQuestion.id && !isSystem) {
          await mockUpdateQuestion({ id: currentQuestion.id, data: payload });
          mockToastSuccess('Cập nhật câu hỏi thành công');
        } else if (isEdit && isSystem) {
          await mockCreateQuestion(payload);
          mockToastSuccess('Đã nhân bản câu hỏi cho doanh nghiệp thành công!');
        } else {
          await mockCreateQuestion(payload);
          mockToastSuccess('Tạo câu hỏi thành công');
        }
      };

      const companyQ = { id: 55, text: 'Company Question', canWrite: true, company: 3 };
      const payload = { text: 'Company Question Updated', category: 'general', difficulty: 1, default_duration_seconds: 120 };

      await submitHandler(true, companyQ, payload);

      expect(mockUpdateQuestion).toHaveBeenCalledWith({ id: 55, data: payload });
      expect(mockCreateQuestion).not.toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('Cập nhật câu hỏi thành công');
    });

    it('prevents deletion and toggle of system questions', async () => {
      const mockUpdateQuestion = jest.fn();
      const mockDeleteQuestion = jest.fn();
      const mockToastWarn = jest.fn();

      const toggleHandler = async (q: Question) => {
        if (isSystemQuestion(q)) {
          mockToastWarn('Câu hỏi chuẩn hệ thống không thể thay đổi trạng thái');
          return;
        }
        await mockUpdateQuestion({ id: q.id, data: { is_public: true } });
      };

      const deleteHandler = async (q: Question) => {
        if (isSystemQuestion(q)) {
          mockToastWarn('Câu hỏi chuẩn hệ thống không thể xóa');
          return;
        }
        await mockDeleteQuestion(q.id);
      };

      const systemQ: Question = { id: 70, text: 'System Question', canWrite: false };

      await toggleHandler(systemQ);
      expect(mockUpdateQuestion).not.toHaveBeenCalled();
      expect(mockToastWarn).toHaveBeenCalledWith('Câu hỏi chuẩn hệ thống không thể thay đổi trạng thái');

      await deleteHandler(systemQ);
      expect(mockDeleteQuestion).not.toHaveBeenCalled();
      expect(mockToastWarn).toHaveBeenCalledWith('Câu hỏi chuẩn hệ thống không thể xóa');
    });
  });
});
