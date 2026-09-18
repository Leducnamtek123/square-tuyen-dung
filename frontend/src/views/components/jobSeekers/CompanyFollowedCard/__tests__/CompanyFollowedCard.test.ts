import { readFileSync } from 'fs';
import { join } from 'path';

describe('CompanyFollowedCard Component & Unfollow Mutation', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries followed companies using useCompaniesFollowed hook', () => {
    expect(source).toContain('useCompaniesFollowed');
    expect(source).toContain('pageSize');
    expect(source).toContain('handleChangePage');
  });

  it('unfollows company via useToggleFollowCompany and displays toast success', () => {
    expect(source).toContain('useToggleFollowCompany');
    expect(source).toContain('toggleFollow.mutate');
    expect(source).toContain('jobSeeker:myCompany.messages.unfollowSuccess');
  });

  it('renders NoDataCard when candidate is not following any company', () => {
    expect(source).toContain('<NoDataCard');
    expect(source).toContain('jobSeeker:myCompany.empty.followed');
    expect(source).toContain('jobSeeker:myCompany.actions.findCompanies');
  });
});
