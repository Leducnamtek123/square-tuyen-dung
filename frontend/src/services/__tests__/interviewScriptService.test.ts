import interviewScriptService, { SYSTEM_PRESET_SCRIPTS } from '../interviewScriptService';
import type { InterviewScriptInput } from '@/types/interviewScript';

describe('interviewScriptService', () => {
  let storage: Record<string, string> = {};

  beforeAll(() => {
    const mockStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
    Object.defineProperty(global, 'window', {
      value: { localStorage: mockStorage },
      writable: true,
    });
  });

  beforeEach(() => {
    storage = {};
  });

  it('should return system presets and initial company scripts', async () => {
    const scripts = await interviewScriptService.getScripts();
    expect(scripts.length).toBeGreaterThanOrEqual(SYSTEM_PRESET_SCRIPTS.length);

    // Verify 5 presets exist
    const presetTechnical = scripts.find((s) => s.scenario_type === 'technical' && s.is_system_preset);
    const presetBehavioral = scripts.find((s) => s.scenario_type === 'behavioral' && s.is_system_preset);
    const presetSales = scripts.find((s) => s.scenario_type === 'sales' && s.is_system_preset);
    const presetFresher = scripts.find((s) => s.scenario_type === 'fresher' && s.is_system_preset);
    const presetLeadership = scripts.find((s) => s.scenario_type === 'leadership' && s.is_system_preset);

    expect(presetTechnical).toBeDefined();
    expect(presetBehavioral).toBeDefined();
    expect(presetSales).toBeDefined();
    expect(presetFresher).toBeDefined();
    expect(presetLeadership).toBeDefined();
  });

  it('should filter scripts by tab', async () => {
    const systemScripts = await interviewScriptService.getScripts({ tab: 'system' });
    expect(systemScripts.every((s) => s.is_system_preset)).toBe(true);

    const companyScripts = await interviewScriptService.getScripts({ tab: 'company' });
    expect(companyScripts.every((s) => !s.is_system_preset)).toBe(true);
  });

  it('should filter scripts by scenario_type', async () => {
    const technicalScripts = await interviewScriptService.getScripts({ scenario_type: 'technical' });
    expect(technicalScripts.every((s) => s.scenario_type === 'technical')).toBe(true);
  });

  it('should retrieve script detail by ID', async () => {
    const script = await interviewScriptService.getScriptDetail(1);
    expect(script.id).toBe(1);
    expect(script.is_system_preset).toBe(true);
    expect(script.scenario_type).toBe('technical');
  });

  it('should create, update, and delete a company script', async () => {
    const input: InterviewScriptInput = {
      name: 'Kịch bản Test Đơn vị',
      description: 'Mô tả kịch bản test',
      scenario_type: 'technical',
      hr_persona: 'challenger',
      system_prompt: 'Bạn là chuyên gia kỹ thuật AI.',
      greeting_message: 'Xin chào ứng viên!',
      closing_message: 'Tạm biệt!',
      time_limit_per_question: 120,
      allow_ai_followup: true,
      max_followup_questions: 2,
    };

    const created = await interviewScriptService.createScript(input);
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Kịch bản Test Đơn vị');
    expect(created.canWrite).toBe(true);
    expect(created.is_system_preset).toBe(false);

    // Update
    const updated = await interviewScriptService.updateScript(created.id, {
      name: 'Kịch bản Test Đơn vị (Đã sửa)',
      time_limit_per_question: 150,
    });
    expect(updated.name).toBe('Kịch bản Test Đơn vị (Đã sửa)');
    expect(updated.time_limit_per_question).toBe(150);

    // Delete
    await interviewScriptService.deleteScript(created.id);
    const scriptsAfterDelete = await interviewScriptService.getScripts();
    expect(scriptsAfterDelete.some((s) => s.id === created.id)).toBe(false);
  });

  it('should clone a preset into a new company script with canWrite=true', async () => {
    const cloned = await interviewScriptService.cloneScript(1);
    expect(cloned.id).not.toBe(1);
    expect(cloned.name).toContain('(Bản sao)');
    expect(cloned.is_system_preset).toBe(false);
    expect(cloned.canWrite).toBe(true);
  });
});
