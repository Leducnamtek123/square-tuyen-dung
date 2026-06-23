import fs from 'fs';
import path from 'path';

const readAdminSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

const readRepoSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, '../../../../../', relativePath), 'utf8');

describe('admin table ordering contract', () => {
  it('keeps audit log sortable column ids aligned with backend ordering fields', () => {
    const pageSource = readAdminSource('AuditLogsPage/index.tsx');
    const backendSource = readRepoSource('api/common/views.py');

    expect(backendSource).toContain('ordering_fields = ["id", "create_at", "action", "resource_type"]');
    expect(pageSource).not.toContain("accessorKey: 'createAt'");
    expect(pageSource).toContain("id: 'create_at'");
    expect(pageSource).toContain('accessorFn: (row) => row.createAt');
  });

  it('keeps admin job sortable column ids aligned with backend ordering fields', () => {
    const pageSource = readAdminSource('JobsPage/index.tsx');
    const backendSource = readRepoSource('api/apps/jobs/views/web_job_posts.py');
    const orderingFields = backendSource.match(/class AdminJobPostViewSet[\s\S]*?ordering_fields = \[(.*?)\]/)?.[1] ?? '';

    expect(pageSource).toContain("accessorKey: 'id'");
    expect(pageSource).toContain("accessorKey: 'jobName'");
    expect(orderingFields).toContain("'id'");
    expect(orderingFields).toContain("('jobName', 'job_name')");
  });

  it('keeps admin interview sortable column ids aligned with backend ordering fields', () => {
    const pageSource = readAdminSource('InterviewsPage/index.tsx');
    const backendSource = readRepoSource('api/apps/interviews/views.py');
    const orderingFields = backendSource.match(/class AdminInterviewSessionReadOnlyViewSet[\s\S]*?ordering_fields = \[(.*?)\]/)?.[1] ?? '';

    expect(orderingFields).toContain("'id'");
    expect(orderingFields).toContain("'scheduled_at'");
    expect(pageSource).not.toContain("accessorKey: 'scheduledAt'");
    expect(pageSource).toContain("id: 'scheduled_at'");
    expect(pageSource).toContain('accessorFn: (row) => row.scheduledAt');
  });

  it('keeps admin user sortable column ids aligned with backend ordering mapping', () => {
    const pageSource = readAdminSource('UsersPage/components/UserTable.tsx');
    const backendSource = readRepoSource('api/apps/accounts/views_users.py');
    const userViewSetSource = backendSource.match(/class UserViewSet[\s\S]*?def update\(/)?.[0] ?? '';

    expect(pageSource).toContain("accessorKey: 'fullName'");
    expect(pageSource).toContain("accessorKey: 'roleName'");
    expect(pageSource).toContain("accessorKey: 'isActive'");
    expect(userViewSetSource).toContain('"id": "id"');
    expect(userViewSetSource).toContain('"fullName": "full_name"');
    expect(userViewSetSource).toContain('"roleName": "role_name"');
    expect(userViewSetSource).toContain('"isActive": "is_active"');
  });

  it('keeps admin banner sortable column ids aligned with backend ordering mapping', () => {
    const pageSource = readAdminSource('BannersPage/useBannersPageColumns.tsx');
    const backendSource = readRepoSource('api/apps/content/views.py');
    const bannerViewSetSource = backendSource.match(/class AdminBannerViewSet[\s\S]*?def create\(/)?.[0] ?? '';

    expect(pageSource).toContain("accessorKey: 'id'");
    expect(pageSource).toContain("accessorKey: 'description'");
    expect(pageSource).toContain("accessorKey: 'platform'");
    expect(pageSource).toContain("accessorKey: 'type'");
    expect(bannerViewSetSource).toContain('"id": "id"');
    expect(bannerViewSetSource).toContain('"description": "description"');
    expect(bannerViewSetSource).toContain('"platform": "platform"');
    expect(bannerViewSetSource).toContain('"type": "type"');
  });

  it('keeps admin feedback sortable column ids aligned with backend ordering mapping', () => {
    const pageSource = readAdminSource('FeedbacksPage/index.tsx');
    const backendSource = readRepoSource('api/apps/content/views.py');
    const feedbackViewSetSource = backendSource.match(/class AdminFeedbackViewSet[\s\S]*?class AdminBannerTypeViewSet/)?.[0] ?? '';

    expect(pageSource).toContain("accessorKey: 'id'");
    expect(pageSource).toContain("accessorKey: 'userDict.fullName'");
    expect(pageSource).toContain("accessorKey: 'rating'");
    expect(pageSource).toContain("id: 'create_at'");
    expect(feedbackViewSetSource).toContain('"id": "id"');
    expect(feedbackViewSetSource).toContain('"userDict.fullName": "user__full_name"');
    expect(feedbackViewSetSource).toContain('"rating": "rating"');
    expect(feedbackViewSetSource).toContain('"create_at": "create_at"');
  });

  it('upgrades admin feedback list to server pagination with moderation filters', () => {
    const pageSource = readAdminSource('FeedbacksPage/index.tsx');

    expect(pageSource).toContain('paginationMode="visible"');
    expect(pageSource).toContain('pagination={pagination}');
    expect(pageSource).toContain('onPaginationChange={onPaginationChange}');
    expect(pageSource).toContain('FilterBar');
    expect(pageSource).toContain('hasEvidence');
    expect(pageSource).toContain('searchTerm');
  });

  it('upgrades admin trust report list to server pagination with moderation filters', () => {
    const pageSource = readAdminSource('TrustReportsPage/index.tsx');

    expect(pageSource).toContain('DataTable');
    expect(pageSource).toContain('paginationMode="visible"');
    expect(pageSource).toContain('pagination={pagination}');
    expect(pageSource).toContain('FilterBar');
    expect(pageSource).toContain('targetType');
    expect(pageSource).toContain('reporter');
  });
});
