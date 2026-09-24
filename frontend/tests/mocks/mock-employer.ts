import type { Page } from '@playwright/test';
import { setupEmployerApiMocks, MOCK_JOBS } from '../helpers/mockApi';

export const MOCK_COMPANY_VERIFICATION = {
  id: 1,
  company: 10,
  companyName: 'InfoHR Tech Corp',
  taxCode: '0109876543',
  businessLicense: 'https://s3.infohr.vn/documents/gpkd-sample.pdf',
  representative: 'Nguyễn Văn Tuyển',
  phone: '0901234567',
  email: 'employer.e2e@infohr.vn',
  website: 'https://infohr.vn',
  status: 'approved' as const,
  companyDict: {
    id: 10,
    companyName: 'InfoHR Tech Corp',
    isVerified: true,
  },
};

export const MOCK_INTERVIEW_DETAIL_COMPLETED = {
  id: 777,
  sessionId: 777,
  candidate: 1,
  candidateName: 'Nguyen Van Ung Vien',
  candidateEmail: 'candidate.e2e@infohr.vn',
  candidatePhone: '0901234567',
  jobPost: 101,
  jobName: 'Senior Fullstack Engineer',
  status: 'completed' as const,
  interviewFormat: 'ai',
  interviewerName: 'Trợ lý AI AILA',
  scheduledAt: '2026-09-25T10:00:00Z',
  startTime: '2026-09-25T10:00:00Z',
  endTime: '2026-09-25T10:25:00Z',
  duration: 1500,
  recordingUrl: 'http://localhost:9000/square/interviews/777/recording.mp4',
  recording_url: 'http://localhost:9000/square/interviews/777/recording.mp4',
  aiOverallScore: 88,
  ai_overall_score: 88,
  aiTechnicalScore: 90,
  ai_technical_score: 90,
  aiCommunicationScore: 85,
  ai_communication_score: 85,
  aiSummary: 'Ứng viên thể hiện năng lực chuyên môn xuất sắc trong hệ sinh thái React và Django.',
  aiStrengths: 'Kiến thức vững chắc về Next.js SSR, tối ưu MySQL, chủ động giao tiếp.',
  aiWeaknesses: 'Cần trau dồi thêm Kubernetes production.',
  aiDetailedFeedback: {
    soft_skills: {
      confidence: 8.8,
      clarity: 8.5,
    },
  },
  proctoringViolationCount: 1,
  proctoring_violation_count: 1,
  proctoringEvents: [
    {
      id: 1,
      eventType: 'tab_switch',
      event_type: 'tab_switch',
      severity: 'medium',
      timestamp: '2026-09-25T10:12:30Z',
      durationSeconds: 4,
      details: 'Rời màn hình phỏng vấn sang tab khác',
    },
  ],
  transcripts: [
    {
      id: 1,
      speakerRole: 'ai_agent',
      speaker_role: 'ai_agent',
      content: 'Chào bạn, hãy giới thiệu đôi nét về bản thân và kinh nghiệm với React & Django.',
      text: 'Chào bạn, hãy giới thiệu đôi nét về bản thân và kinh nghiệm với React & Django.',
      createAt: '2026-09-25T10:01:00Z',
    },
    {
      id: 2,
      speakerRole: 'candidate',
      speaker_role: 'candidate',
      content: 'Em có hơn 4 năm làm việc với React, Next.js và backend Django REST Framework.',
      text: 'Em có hơn 4 năm làm việc với React, Next.js và backend Django REST Framework.',
      createAt: '2026-09-25T10:01:45Z',
    },
    {
      id: 3,
      speakerRole: 'ai_agent',
      speaker_role: 'ai_agent',
      content: 'Bạn xử lý bài toán tối ưu truy vấn N+1 trong Django ORM như thế nào?',
      text: 'Bạn xử lý bài toán tối ưu truy vấn N+1 trong Django ORM như thế nào?',
      createAt: '2026-09-25T10:05:00Z',
    },
    {
      id: 4,
      speakerRole: 'candidate',
      speaker_role: 'candidate',
      content: 'Em dùng select_related cho ForeignKey/OneToOne và prefetch_related cho ManyToMany hoặc reverse ForeignKey.',
      text: 'Em dùng select_related cho ForeignKey/OneToOne và prefetch_related cho ManyToMany hoặc reverse ForeignKey.',
      createAt: '2026-09-25T10:06:10Z',
    },
  ],
  questions: [
    {
      id: 1,
      questionText: 'Giới thiệu bản thân và kinh nghiệm với React & Django',
      question_text: 'Giới thiệu bản thân và kinh nghiệm với React & Django',
      category: 'technical',
      order: 1,
    },
    {
      id: 2,
      questionText: 'Xử lý bài toán tối ưu truy vấn N+1 trong Django ORM',
      question_text: 'Xử lý bài toán tối ưu truy vấn N+1 trong Django ORM',
      category: 'technical',
      order: 2,
    },
  ],
};

/**
 * Đăng ký các mock endpoints phục vụ luồng Employer & ATS
 */
export async function setupDomainEmployerMocks(page: Page) {
  await setupEmployerApiMocks(page);

  // Mock company verification (GET / PUT)
  await page.route(/\/info\/web\/company-verification\/?(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_COMPANY_VERIFICATION),
      });
      return;
    }
    if (method === 'PUT' || method === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_COMPANY_VERIFICATION,
          ...data,
          status: 'pending',
        }),
      });
      return;
    }
    await route.fallback();
  });

  // Mock interview session detail
  await page.route(/\/interview\/web\/sessions\/(\d+|detail)\/?(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_INTERVIEW_DETAIL_COMPLETED),
      });
      return;
    }
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 888,
          inviteToken: 'invite-token-888',
          status: 'scheduled',
          ...data,
        }),
      });
      return;
    }
    await route.fallback();
  });

  // Mock đóng / mở lại tin tuyển dụng
  await page.route(/\/api\/v1\/employer\/job-posts\/\d+\/(close|reopen)\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Cập nhật trạng thái tin tuyển dụng thành công.' }),
    });
  });

  // Mock gửi yêu cầu xác thực doanh nghiệp (legacy path fallback)
  await page.route(/\/api\/v1\/employer\/company\/verification\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, status: 'pending', message: 'Hồ sơ xác thực đã được gửi.' }),
      });
      return;
    }
    await route.fallback();
  });
}

