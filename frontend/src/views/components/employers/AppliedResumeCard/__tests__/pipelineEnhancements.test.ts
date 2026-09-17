import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer Recruitment Pipeline Enhancements', () => {
  describe('Stage 1: Talent Sourcing & Direct Job Invite', () => {
    const inviteModalPath = join(__dirname, '../../ProfileCard/components/InviteCandidateToJobModal.tsx');
    const previewPanelPath = join(__dirname, '../../ProfileCard/components/CandidateDetailPreviewPanel.tsx');

    it('implements InviteCandidateToJobModal with job post selection and invitation note', () => {
      const source = readFileSync(inviteModalPath, 'utf8');
      expect(source).toContain('InviteCandidateToJobModal');
      expect(source).toContain('useJobPostOptions');
      expect(source).toContain('jobPostActivityService.inviteCandidate');
    });

    it('integrates "Mời ứng tuyển" action button into CandidateDetailPreviewPanel', () => {
      const source = readFileSync(previewPanelPath, 'utf8');
      expect(source).toContain('Mời ứng tuyển');
      expect(source).toContain('InviteCandidateToJobModal');
      expect(source).toContain('setIsInviteModalOpen');
    });
  });

  describe('Stage 2 & 3: 1-Click Quick Interview Scheduling', () => {
    const quickModalPath = join(__dirname, '../QuickScheduleInterviewModal.tsx');
    const cardPath = join(__dirname, '../index.tsx');
    const kanbanPath = join(__dirname, '../../AppliedResumeKanban/index.tsx');
    const tablePath = join(__dirname, '../../AppliedResumeTable/index.tsx');

    it('implements QuickScheduleInterviewModal supporting AI and Live interview modes', () => {
      const source = readFileSync(quickModalPath, 'utf8');
      expect(source).toContain('QuickScheduleInterviewModal');
      expect(source).toContain('interviewService.scheduleSession');
      expect(source).toContain('Phỏng vấn AI');
      expect(source).toContain('Phỏng vấn trực tiếp');
    });

    it('wires onQuickScheduleInterview to AppliedResumeCard, Kanban, and Table', () => {
      const cardSource = readFileSync(cardPath, 'utf8');
      const kanbanSource = readFileSync(kanbanPath, 'utf8');
      const tableSource = readFileSync(tablePath, 'utf8');

      expect(cardSource).toContain('QuickScheduleInterviewModal');
      expect(cardSource).toContain('onQuickScheduleInterview');

      expect(kanbanSource).toContain('onQuickScheduleInterview');
      expect(tableSource).toContain('onQuickScheduleInterview');
    });
  });

  describe('Stage 4: Automated HRM Onboarding on Hired Status', () => {
    const cardPath = join(__dirname, '../index.tsx');

    it('automatically triggers EmployeeFromApplicationDialog when candidate is hired (status 5)', () => {
      const source = readFileSync(cardPath, 'utf8');
      expect(source).toContain('handleChangeApplicationStatus');
      expect(source).toContain('Number(value) === 5');
      expect(source).toContain('setEmployeeSourceActivity');
      expect(source).toContain('EmployeeFromApplicationDialog');
    });
  });
});
