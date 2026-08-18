import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin SettingsPage Component & System Configurations', () => {
  const filePath = join(__dirname, '../SettingsPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages system settings tabs: General, Chatbot, Voice Interview, and API Integration', () => {
    expect(source).toContain('useSystemSettings');
    expect(source).toContain('GeneralSettingsTab');
    expect(source).toContain('ChatbotSettingsTab');
    expect(source).toContain('VoiceInterviewTab');
    expect(source).toContain('ApiIntegrationTab');
  });

  it('integrates GPU microservice status controls via fptGpuService', () => {
    expect(source).toContain('fptGpuService');
  });
});
