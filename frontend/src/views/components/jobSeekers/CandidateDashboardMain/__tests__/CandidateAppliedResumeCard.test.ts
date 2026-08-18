import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateAppliedResumeCard Component & Resume Items Management', () => {
  const filePath = join(__dirname, '../CandidateAppliedResumeCard.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('transforms resume list or single resume into standardized ResumeItemData shape', () => {
    expect(source).toContain('resumesList.map');
    expect(source).toContain('isSearchable');
    expect(source).toContain('updatedDate');
  });

  it('provides edit title, delete confirmation, and resume preview modal dialogs', () => {
    expect(source).toContain('CandidateResumePreviewModal');
    expect(source).toContain('handleOpenPreview');
    expect(source).toContain('handleOpenEdit');
    expect(source).toContain('handleOpenDelete');
  });

  it('supports file input change for uploading fresh CV attachments', () => {
    expect(source).toContain('fileInputRef');
    expect(source).toContain('accept=".pdf,.doc,.docx"');
    expect(source).toContain('handleFileUpload');
  });
});
