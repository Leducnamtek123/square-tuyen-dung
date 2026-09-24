/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrustReportDialog from '../index';
import trustReportService from '@/services/trustReportService';

jest.mock('@/services/trustReportService', () => ({
  __esModule: true,
  default: {
    createTrustReport: jest.fn().mockResolvedValue({ id: 1 }),
  },
}));

jest.mock('@/utils/toastMessages', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'public:jobDetail.reportCaption': 'Tin cậy & An toàn',
        'public:jobDetail.reportJobTitle': 'Báo cáo tin tuyển dụng',
        'public:jobDetail.reportTargetCompany': 'Công ty được báo cáo',
        'public:jobDetail.reportTargetJob': 'Tin tuyển dụng được báo cáo',
        'public:companyDetail.reportCompanyTitle': 'Báo cáo công ty',
        'public:jobDetail.reportReasonLabel': 'Lý do',
        'public:jobDetail.reportMessageLabel': 'Chi tiết bổ sung',
        'public:jobDetail.reportOptional': 'Tùy chọn',
        'public:jobDetail.reportMessagePlaceholder': 'Hãy cho chúng tôi biết nội dung nào không đúng hoặc gây hiểu lầm.',
        'public:jobDetail.reportPrivacyNotice': 'Báo cáo của bạn được gửi ẩn danh và bảo mật tuyệt đối tới Ban kiểm duyệt InfoHR.',
        'public:jobDetail.reportSuccess': 'Gửi báo cáo thành công.',
        'public:jobDetail.reportReasons.scam': 'Lừa đảo hoặc gian lận',
        'public:jobDetail.reportReasons.wrongInfo': 'Thông tin sai hoặc gây hiểu lầm',
        'public:jobDetail.reportReasons.spam': 'Spam',
        'public:jobDetail.reportReasons.duplicate': 'Tin trùng lặp',
        'public:jobDetail.reportReasons.other': 'Khác',
        'common:actions.cancel': 'Hủy',
        'common:actions.submit': 'Gửi',
      };
      return dict[key] || key;
    },
    i18n: { language: 'vi' },
  }),
}));

describe('TrustReportDialog Component', () => {
  it('does not render when openPopup is false', () => {
    const { container } = render(
      <TrustReportDialog
        openPopup={false}
        setOpenPopup={jest.fn()}
        targetType="company"
        companyId={1}
        targetName="Test Company"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when openPopup is true with target name', () => {
    render(
      <TrustReportDialog
        openPopup={true}
        setOpenPopup={jest.fn()}
        targetType="company"
        companyId={10}
        targetName="InfoHR Enterprise Solutions"
      />
    );

    expect(screen.getByText('Tin cậy & An toàn')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo công ty')).toBeInTheDocument();
    expect(screen.getByText('InfoHR Enterprise Solutions')).toBeInTheDocument();
    expect(screen.getByText('Lừa đảo hoặc gian lận')).toBeInTheDocument();
    expect(screen.getByText('Thông tin sai hoặc gây hiểu lầm')).toBeInTheDocument();
    expect(screen.getByText('Spam')).toBeInTheDocument();
    expect(screen.getByText('Tin trùng lặp')).toBeInTheDocument();
    expect(screen.getByText('Khác')).toBeInTheDocument();
  });

  it('handles cancel button click to close dialog', () => {
    const setOpenPopup = jest.fn();
    render(
      <TrustReportDialog
        openPopup={true}
        setOpenPopup={setOpenPopup}
        targetType="job"
        jobPostId={5}
        targetName="Senior Software Engineer"
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Hủy' });
    fireEvent.click(cancelBtn);
    expect(setOpenPopup).toHaveBeenCalledWith(false);
  });

  it('submits trust report and resets dialog', async () => {
    const setOpenPopup = jest.fn();
    render(
      <TrustReportDialog
        openPopup={true}
        setOpenPopup={setOpenPopup}
        targetType="company"
        companyId={12}
        targetName="InfoHR Corporation"
      />
    );

    const spamOption = screen.getByText('Spam');
    fireEvent.click(spamOption);

    const textarea = screen.getByPlaceholderText(
      'Hãy cho chúng tôi biết nội dung nào không đúng hoặc gây hiểu lầm.'
    );
    fireEvent.change(textarea, { target: { value: 'Đây là tài khoản spam' } });

    const submitBtn = screen.getByRole('button', { name: 'Gửi' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(trustReportService.createTrustReport).toHaveBeenCalledWith({
        targetType: 'company',
        reason: 'spam',
        message: 'Đây là tài khoản spam',
        jobPost: null,
        company: 12,
      });
      expect(setOpenPopup).toHaveBeenCalledWith(false);
    });
  });
});
