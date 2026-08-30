import { readFileSync } from 'fs';
import { join } from 'path';

const JOB_DETAIL_PATH = join(__dirname, '../index.tsx');
const CHATBOT_CSS_PATH = join(__dirname, '../../../../components/Features/ChatBot/chatbot.css');

describe('JobDetailPage Mobile Responsive Layout', () => {
  const jobDetailSource = readFileSync(JOB_DETAIL_PATH, 'utf8');
  const chatbotCssSource = readFileSync(CHATBOT_CSS_PATH, 'utf8');

  it('marks mobile sticky apply bar with coordination class and data attribute', () => {
    expect(jobDetailSource).toContain('job-detail-sticky-bar');
    expect(jobDetailSource).toContain('data-sticky-bottom="true"');
  });

  it('provides safe bottom clearance for content above the mobile sticky bar', () => {
    expect(jobDetailSource).toContain('pb-[calc(96px+env(safe-area-inset-bottom,1.25rem))]');
  });

  it('elevates chatbot floating launcher above mobile sticky bottom bars', () => {
    expect(chatbotCssSource).toContain('body:has(.job-detail-sticky-bar) .sq-chatbot');
    expect(chatbotCssSource).toContain('body:has([data-sticky-bottom="true"]) .sq-chatbot');
    expect(chatbotCssSource).toContain('bottom: calc(84px + env(safe-area-inset-bottom, 16px))');
  });
});
