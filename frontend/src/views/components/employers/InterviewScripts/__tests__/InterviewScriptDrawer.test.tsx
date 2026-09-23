/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterviewScriptDrawer from '../InterviewScriptDrawer';
import questionGroupService from '@/services/questionGroupService';
import questionService from '@/services/questionService';
import type { InterviewScript } from '@/types/interviewScript';

// Mock services
jest.mock('@/services/questionGroupService', () => ({
  __esModule: true,
  default: {
    getQuestionGroups: jest.fn(),
    getQuestionGroupDetail: jest.fn(),
  },
}));

jest.mock('@/services/questionService', () => ({
  __esModule: true,
  default: {
    getQuestions: jest.fn(),
  },
}));

jest.mock('@/utils/toastMessages', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockQuestionGroups = [
  {
    id: 10,
    name: 'Bộ câu hỏi Backend Python',
    questions_count: 3,
    questions: [
      { id: 101, text: 'Giải thích Django ORM prefetch_related' },
      { id: 102, text: 'Cách xử lý race condition trong MySQL' },
      { id: 103, text: 'Nguyên lý Event Loop trong asyncio' },
    ],
  },
  {
    id: 20,
    name: 'Bộ câu hỏi Frontend React',
    questions_count: 2,
    questions: [
      { id: 201, text: 'React Server Components là gì?' },
      { id: 202, text: 'Tối ưu re-render trong React 19' },
    ],
  },
];

const mockQuestions = [
  { id: 101, text: 'Giải thích Django ORM prefetch_related', category: 'Backend', difficulty: 2 },
  { id: 102, text: 'Cách xử lý race condition trong MySQL', category: 'Backend', difficulty: 3 },
  { id: 103, text: 'Nguyên lý Event Loop trong asyncio', category: 'Backend', difficulty: 2 },
  { id: 201, text: 'React Server Components là gì?', category: 'Frontend', difficulty: 2 },
  { id: 202, text: 'Tối ưu re-render trong React 19', category: 'Frontend', difficulty: 3 },
  { id: 301, text: 'Kể về một lần bạn giải quyết xung đột nhóm', category: 'STAR', difficulty: 1 },
];

describe('InterviewScriptDrawer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (questionGroupService.getQuestionGroups as jest.Mock).mockResolvedValue({
      results: mockQuestionGroups,
    });
    (questionService.getQuestions as jest.Mock).mockResolvedValue({
      results: mockQuestions,
    });
  });

  it('1. Tự động tính toán tổng rubric và nút ⚡ Tự động chia đều 100%', async () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn();

    render(
      <InterviewScriptDrawer
        open={true}
        script={null}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    // Initial rubric (40 + 35 + 25 = 100%)
    expect(screen.getByText('Đạt chuẩn 100%')).toBeInTheDocument();

    // Click "Thêm tiêu chí" (adds 10%, making total 110%)
    const addBtn = screen.getByRole('button', { name: /Thêm tiêu chí/i });
    fireEvent.click(addBtn);

    // Total should now be 110%, showing "Thừa 10%"
    expect(screen.getByText('Thừa 10%')).toBeInTheDocument();

    // Click "⚡ Tự động chia đều 100%"
    const autoBalanceBtn = screen.getByRole('button', { name: /⚡ Tự động chia đều 100%/i });
    fireEvent.click(autoBalanceBtn);

    // Now 4 criteria should be balanced to 25% each, total 100%
    expect(screen.getByText('Đạt chuẩn 100%')).toBeInTheDocument();

    // Remove one criterion (3 left, each was 25% => total 75%)
    const deleteButtons = screen.getAllByTestId('DeleteOutlineIcon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    // Should show "Thiếu 25%"
    expect(screen.getByText('Thiếu 25%')).toBeInTheDocument();

    // Click "⚡ Tự động chia đều 100%" again (3 items: 34%, 33%, 33%)
    fireEvent.click(autoBalanceBtn);

    // Should return to "Đạt chuẩn 100%"
    expect(screen.getByText('Đạt chuẩn 100%')).toBeInTheDocument();
  });

  it('2. Đổi trạng thái switch kế thừa nhận diện công ty', async () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn();

    render(
      <InterviewScriptDrawer
        open={true}
        script={null}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const switchLabel = 'Kế thừa Giọng nói & Nhân vật từ Doanh nghiệp';
    const switchControl = screen.getByRole('checkbox', { name: switchLabel });
    expect(switchControl).toBeChecked();

    // Banner should be visible when switch is ON
    expect(
      screen.getByText(
        'Kịch bản sẽ tự động áp dụng Giọng đọc, Tốc độ và Nhân vật AI được thiết lập trong trang Cài đặt AI của Doanh nghiệp'
      )
    ).toBeInTheDocument();

    // Character selector should NOT be visible when inherited
    expect(screen.queryByLabelText('Nhân vật AI')).not.toBeInTheDocument();

    // Toggle switch to OFF
    fireEvent.click(switchControl);
    expect(switchControl).not.toBeChecked();

    // Notice banner should disappear and selectors should now appear
    expect(
      screen.queryByText(
        'Kịch bản sẽ tự động áp dụng Giọng đọc, Tốc độ và Nhân vật AI được thiết lập trong trang Cài đặt AI của Doanh nghiệp'
      )
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText('Nhân vật AI')).toBeInTheDocument();
    expect(screen.getByLabelText('Giọng đọc')).toBeInTheDocument();
    expect(screen.getByLabelText('Tốc độ phát âm')).toBeInTheDocument();

    // Toggle back to ON
    fireEvent.click(switchControl);
    expect(switchControl).toBeChecked();
    expect(screen.queryByLabelText('Nhân vật AI')).not.toBeInTheDocument();
  });

  it('3. Tính toán thời lượng dự kiến theo số lượng câu hỏi và time limit', async () => {
    const mockScriptWithQuestions: InterviewScript = {
      id: 99,
      name: 'Kịch bản Kỹ thuật',
      slug: 'kich-ban-ky-thuat',
      description: 'Mô tả kịch bản',
      scenario_type: 'technical',
      hr_persona: 'professional',
      system_prompt: 'Hướng dẫn AI...',
      greeting_message: 'Xin chào!',
      closing_message: 'Tạm biệt!',
      time_limit_per_question: 120,
      allow_ai_followup: true,
      max_followup_questions: 2,
      character_id: 'ng_c_linh',
      voice_name: 'Trúc Ly',
      voice_speed: 1.0,
      is_system_preset: false,
      is_active: true,
      question_ids: [101, 102, 103], // 3 questions
      questions_count: 3,
    };

    render(
      <InterviewScriptDrawer
        open={true}
        script={mockScriptWithQuestions}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    // 3 questions × 120s = 360s = 6 minutes
    expect(
      screen.getByText('Thời lượng ước tính: 3 câu × 120s = ~6 phút')
    ).toBeInTheDocument();
  });

  it('4. Submit đúng payload bao gồm question_group, question_ids, và evaluation_rubric', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    const handleClose = jest.fn();

    const mockScriptToEdit: InterviewScript = {
      id: 55,
      name: 'Kịch bản React Senior',
      slug: 'kich-ban-react-senior',
      description: 'Phỏng vấn chuyên sâu',
      scenario_type: 'technical',
      hr_persona: 'professional',
      system_prompt: 'Chỉ dẫn hệ thống cho AI phỏng vấn',
      greeting_message: 'Chào bạn',
      closing_message: 'Cảm ơn bạn',
      time_limit_per_question: 90,
      allow_ai_followup: true,
      max_followup_questions: 2,
      question_group: 20,
      question_ids: [201, 202],
      inherit_company_identity: true,
      character_id: 'ng_c_linh',
      voice_name: 'Trúc Ly',
      voice_speed: 1.0,
      evaluation_rubric: [
        { criterion: 'React 19 & Architecture', weight: 60, description: 'Kiến thức chuyên sâu' },
        { criterion: 'Văn hóa & Kỹ năng mềm', weight: 40, description: 'Giao tiếp tốt' },
      ],
      is_system_preset: false,
      is_active: true,
    };

    render(
      <InterviewScriptDrawer
        open={true}
        script={mockScriptToEdit}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    // Wait for question groups to load
    await waitFor(() => {
      expect(questionGroupService.getQuestionGroups).toHaveBeenCalled();
    });

    // Check duration preview: 2 questions × 90s = 180s = 3 minutes
    expect(
      screen.getByText('Thời lượng ước tính: 2 câu × 90s = ~3 phút')
    ).toBeInTheDocument();

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Cập nhật kịch bản/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    const submittedData = handleSubmit.mock.calls[0][0];

    expect(submittedData.name).toBe('Kịch bản React Senior');
    expect(submittedData.question_group).toBe(20);
    expect(submittedData.question_ids).toEqual([201, 202]);
    expect(submittedData.inherit_company_identity).toBe(true);
    expect(submittedData.time_limit_per_question).toBe(90);
    expect(submittedData.evaluation_rubric).toEqual([
      { criterion: 'React 19 & Architecture', weight: 60, description: 'Kiến thức chuyên sâu' },
      { criterion: 'Văn hóa & Kỹ năng mềm', weight: 40, description: 'Giao tiếp tốt' },
    ]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
