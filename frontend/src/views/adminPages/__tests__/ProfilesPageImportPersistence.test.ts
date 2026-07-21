import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(__dirname, '../ProfilesPage/index.tsx'), 'utf8');

describe('ProfilesPage import persistence', () => {
  it('persists the Vieclam24h import job id across reloads', () => {
    expect(source).toContain('vieclam24h-import-job-id');
    expect(source).toContain('localStorage.setItem');
    expect(source).toContain('localStorage.removeItem');
    expect(source).toContain('importJobId');
  });
});
