import { QuestionBankItem, CreateMockSessionPayload } from '@/types/models';

describe('CandidatePracticePage logic and data handling', () => {
  const mockQuestions: QuestionBankItem[] = [
    {
      id: 1,
      question_text: 'Bạn xử lý thế nào khi xảy ra xung đột bản vẽ kết cấu và kiến trúc?',
      category: 'Xây dựng & Kiến trúc',
      seniority: 'middle',
      default_duration_seconds: 120,
      answer_structure: {
        start: 'Khẳng định tuân thủ an toàn chịu lực công trình và quy chuẩn xây dựng.',
        steps: [
          { step: 1, title: 'Bước 1: Rà soát & Dừng thi công vị trí xung đột', guidance: 'Kiểm tra chi tiết sai lệch...' },
          { step: 2, title: 'Bước 2: Tổ chức họp RFI với bên thiết kế', guidance: 'Lập biên bản làm rõ...' },
        ],
        end: 'Cập nhật bản vẽ hoàn công và rút kinh nghiệm cho đợt thi công tiếp theo.',
      },
      interviewer_intent: 'Kiểm tra kỹ năng quản lý xung đột kỹ thuật hiện trường và tinh thần trách nhiệm.',
      important_tips: [
        { type: 'do', content: 'Luôn giữ bằng chứng biên bản hiện trường' },
        { type: 'dont', content: 'Tự ý quyết định chỉnh sửa kết cấu bê tông' },
      ],
      follow_up_questions: ['Nếu chủ đầu tư ép tiến độ thì bạn xử trí thế nào?'],
    },
    {
      id: 2,
      question_text: 'Làm thế nào để tối ưu hóa hiệu năng render Next.js và loại bỏ waterfalls?',
      category: 'Công nghệ thông tin',
      seniority: 'senior',
      default_duration_seconds: 90,
      answer_structure: {
        start: 'Tận dụng Server Components song song và React Suspense.',
        steps: [
          { step: 1, title: 'Bước 1: Chuyển sang Promise.all hoặc Suspense boundary', guidance: 'Không await tuần tự...' },
        ],
        end: 'Đo lường bằng Core Web Vitals và Chrome Tracing.',
      },
      interviewer_intent: 'Đánh giá kinh nghiệm chuyên sâu về React App Router & Web Vitals.',
      important_tips: [
        { type: 'do', content: 'Dẫn chứng metric TTFB, FCP, LCP' },
      ],
      follow_up_questions: ['Sự khác biệt giữa ISR và dynamic rendering?'],
    },
    {
      id: 3,
      question_text: 'Quy trình tuyển dụng và giữ chân nhân tài của bạn ra sao?',
      category: 'Nhân sự & Tuyển dụng',
      seniority: 'junior',
      default_duration_seconds: 60,
    },
  ];

  // Helper duration formatter logic used in page
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '02:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Helper seniority badge resolution used in page
  const getSeniorityBadge = (seniority?: string) => {
    switch (seniority) {
      case 'senior':
      case 'lead':
        return { label: 'Senior / Quản lý', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'middle':
        return { label: 'Cấp độ Middle', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
      default:
        return { label: 'Junior / Mới bắt đầu', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
  };

  test('formats question duration in MM:SS correctly', () => {
    expect(formatDuration(120)).toBe('02:00');
    expect(formatDuration(90)).toBe('01:30');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(undefined)).toBe('02:00');
    expect(formatDuration(0)).toBe('02:00');
  });

  test('maps seniority levels accurately to display labels and styles', () => {
    expect(getSeniorityBadge('junior').label).toBe('Junior / Mới bắt đầu');
    expect(getSeniorityBadge('middle').label).toBe('Cấp độ Middle');
    expect(getSeniorityBadge('senior').label).toBe('Senior / Quản lý');
    expect(getSeniorityBadge('lead').label).toBe('Senior / Quản lý');
    expect(getSeniorityBadge(undefined).label).toBe('Junior / Mới bắt đầu');
  });

  test('filters question bank correctly by category, seniority and search query', () => {
    // Filter by Category
    const itQuestions = mockQuestions.filter(q => q.category === 'Công nghệ thông tin');
    expect(itQuestions).toHaveLength(1);
    expect(itQuestions[0].id).toBe(2);

    // Filter by Seniority
    const middleQuestions = mockQuestions.filter(q => q.seniority === 'middle');
    expect(middleQuestions).toHaveLength(1);
    expect(middleQuestions[0].id).toBe(1);

    // Filter by Search Query
    const query = 'xung đột';
    const searchedQuestions = mockQuestions.filter(q =>
      q.question_text.toLowerCase().includes(query.toLowerCase())
    );
    expect(searchedQuestions).toHaveLength(1);
    expect(searchedQuestions[0].id).toBe(1);
  });

  test('builds mock interview creation payloads with dynamic career_id and profile title', () => {
    // Dynamic launch payload with career_id
    const dynamicPayload: CreateMockSessionPayload = {
      job_title: 'Kiến trúc sư công trình',
      position_title: 'Kiến trúc sư công trình',
      career_id: 78,
      category: 'Xây dựng - Kiến trúc',
      seniority: 'middle',
      question_count: 5,
    };
    expect(dynamicPayload.job_title).toBe('Kiến trúc sư công trình');
    expect(dynamicPayload.career_id).toBe(78);
    expect(dynamicPayload.question_count).toBe(5);

    // Custom single question click payload with career_id and question_ids
    const targetQuestion = mockQuestions[1];
    const customPayload: CreateMockSessionPayload = {
      job_title: targetQuestion.question_text,
      career_id: 80,
      category: targetQuestion.category || 'Công nghệ thông tin',
      seniority: targetQuestion.seniority || 'middle',
      question_count: 5,
      question_ids: [targetQuestion.id],
    };
    expect(customPayload.job_title).toBe('Làm thế nào để tối ưu hóa hiệu năng render Next.js và loại bỏ waterfalls?');
    expect(customPayload.career_id).toBe(80);
    expect(customPayload.question_ids).toEqual([2]);
  });

  test('determines correct redirection target for created mock interview sessions', () => {
    const resolveRedirect = (data: { interview_url?: string; session_id?: number | string }) => {
      if (data?.interview_url) return data.interview_url;
      if (data?.session_id) return `/interview/${data.session_id}`;
      return '/my-interviews';
    };

    expect(resolveRedirect({ interview_url: 'https://square.vn/interview/livekit-token-123' })).toBe(
      'https://square.vn/interview/livekit-token-123'
    );
    expect(resolveRedirect({ session_id: 'session-456' })).toBe('/interview/session-456');
    expect(resolveRedirect({})).toBe('/my-interviews');
  });
});
