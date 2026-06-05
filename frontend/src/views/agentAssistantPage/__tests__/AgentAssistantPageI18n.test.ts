import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const fixedKeys = [
  'agentAssistant.title',
  'agentAssistant.recents',
  'agentAssistant.newChat',
  'agentAssistant.ready',
  'agentAssistant.empty',
  'agentAssistant.placeholder',
  'agentAssistant.send',
  'agentAssistant.deleteHistory',
  'agentAssistant.deleteCurrentHistory',
  'agentAssistant.deleteError',
  'agentAssistant.loadError',
  'agentAssistant.sendError',
  'agentAssistant.thinking',
  'agentAssistant.threadGroups.today',
  'agentAssistant.threadGroups.yesterday',
  'agentAssistant.threadGroups.thisWeek',
  'agentAssistant.threadGroups.earlier',
  'agentAssistant.status.pending',
  'agentAssistant.status.running',
  'agentAssistant.status.succeeded',
  'agentAssistant.status.failed',
  'agentAssistant.tools.create_manual_candidate',
  'agentAssistant.tools.search_candidates',
  'agentAssistant.tools.update_application_status',
  'agentAssistant.tools.list_job_posts',
  'agentAssistant.tools.list_applications',
  'agentAssistant.tools.list_companies',
  'agentAssistant.tools.review_job_post',
  'agentAssistant.rows.candidate',
  'agentAssistant.rows.phone',
  'agentAssistant.rows.jobPost',
  'agentAssistant.rows.status',
  'agentAssistant.results.title',
  'agentAssistant.results.fallback',
  'agentAssistant.results.more',
  'agentAssistant.results.openRecord',
];

describe('AgentAssistantPage i18n', () => {
  it('does not hard-code fixed UI copy in the page source', () => {
    [
      'Chờ chạy',
      'Đang chạy',
      'Hoàn tất',
      'Lỗi',
      'Hôm nay',
      'Hôm qua',
      'Tuần này',
      'Trước đó',
      'Tạo hồ sơ ứng viên',
      'Tìm ứng viên',
      'Cập nhật trạng thái hồ sơ',
      'Liệt kê tin tuyển dụng',
      'Liệt kê hồ sơ ứng tuyển',
      'Liệt kê công ty',
      'Duyệt tin tuyển dụng',
      'Ứng viên',
      'Số điện thoại',
      'Tin tuyển dụng',
      'Trạng thái',
      'Kết quả',
      'Mở bản ghi',
      'Xóa lịch sử',
      'Không thể xóa lịch sử chat này. Vui lòng thử lại.',
      'Không thể tải Agent Assistants. Vui lòng thử lại.',
      'Agent đang suy nghĩ...',
      'Agent chưa chạy được yêu cầu này. Vui lòng kiểm tra nội dung và thử lại.',
      'Recents',
      'New chat',
      'Ready',
      'Agent đang sẵn sàng',
      'Nhắn cho agent...',
      'Gửi',
    ].forEach((text) => {
      expect(source).not.toContain(text);
    });
  });

  it('uses common locale keys for fixed UI copy', () => {
    fixedKeys.forEach((key) => {
      expect(source).toContain(`'common:${key}'`);
    });
  });

  it('has Vietnamese and English locale entries for fixed UI copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/common.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      const path = key.replace('agentAssistant.', '').split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale.agentAssistant,
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
