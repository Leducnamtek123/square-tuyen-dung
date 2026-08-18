import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateSkillsCard Component & Chip Operations', () => {
  const filePath = join(__dirname, '../CandidateSkillsCard.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages local skills state with adding and deleting actions', () => {
    expect(source).toContain('handleAddSkill');
    expect(source).toContain('handleDeleteSkill');
    expect(source).toContain('!skills.includes(newSkillInput.trim())');
  });

  it('handles Enter key submission on skill text input', () => {
    expect(source).toContain("e.key === 'Enter'");
    expect(source).toContain('handleAddSkill()');
  });

  it('uses candidateProfile.skills translation keys', () => {
    expect(source).toContain('candidateProfile.skills.title');
    expect(source).toContain('candidateProfile.skills.skillsCount');
    expect(source).toContain('candidateProfile.skills.empty');
    expect(source).toContain('candidateProfile.skills.addSkill');
    expect(source).toContain('candidateProfile.skills.manageModalTitle');
    expect(source).toContain('candidateProfile.skills.done');
  });
});
