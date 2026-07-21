import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(__dirname, '../ProfilesPage/index.tsx'), 'utf8');

describe('ProfilesPage filters and bulk actions', () => {
  it('renders the full candidate filter set and bulk selection flow', () => {
    expect(source).toContain('TextFieldCustom');
    expect(source).toContain('SingleSelectCustom');
    expect(source).toContain('name="cityId"');
    expect(source).toContain('name="careerId"');
    expect(source).toContain('name="experienceId"');
    expect(source).toContain('name="positionId"');
    expect(source).toContain('name="academicLevelId"');
    expect(source).toContain('name="typeOfWorkplaceId"');
    expect(source).toContain('name="jobTypeId"');
    expect(source).toContain('name="genderId"');
    expect(source).toContain('name="maritalStatusId"');
    expect(source).toContain('enableRowSelection');
    expect(source).toContain('bulkDeleteProfiles');
  });
});
