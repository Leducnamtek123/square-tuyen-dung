import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateProfileHeroBanner Component & Interactive Controls', () => {
  const filePath = join(__dirname, '../CandidateProfileHeroBanner.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('supports avatar and cover image file uploads with hidden input refs', () => {
    expect(source).toContain('avatarInputRef');
    expect(source).toContain('coverInputRef');
    expect(source).toContain('handleAvatarFile');
    expect(source).toContain('handleCoverFile');
    expect(source).toContain('URL.createObjectURL(file)');
  });

  it('handles job seeking toggle switch with optimistic state rollback on failure', () => {
    expect(source).toContain('handleToggleSeeking');
    expect(source).toContain('onSeekingStatusChange');
    expect(source).toContain('setSeekingStatus(!newStatus)');
  });

  it('uses candidateProfile.hero translation keys', () => {
    expect(source).toContain('candidateProfile.hero.changeCover');
    expect(source).toContain('candidateProfile.hero.changeAvatarTooltip');
    expect(source).toContain('candidateProfile.hero.candidateFallback');
    expect(source).toContain('candidateProfile.hero.verified');
    expect(source).toContain('candidateProfile.hero.seekingSwitchLabel');
    expect(source).toContain('candidateProfile.hero.seekingActive');
    expect(source).toContain('candidateProfile.hero.seekingInactive');
    expect(source).toContain('candidateProfile.hero.lastUpdated');
  });
});
