import { readFileSync } from 'fs';
import { join } from 'path';
import { ROLES_NAME } from '@/configs/constants';
import type { AppNotification } from '@/hooks/useNotifications';
import { getNotificationTargetPath } from '../notificationRouting';

const notification = (
  type: string,
  overrides: Partial<AppNotification> = {}
): AppNotification => ({
  key: `notification-${type}`,
  type,
  ...overrides,
});

describe('notification routing', () => {
  it('localizes inferred employer notification routes for Vietnamese', () => {
    expect(
      getNotificationTargetPath(
        notification('APPLY_JOB', {
          APPLY_JOB: { resume_slug: 'nguyen-van-a' },
        }),
        ROLES_NAME.EMPLOYER,
        'vi'
      )
    ).toBe('/nha-tuyen-dung/danh-sach-ung-vien/nguyen-van-a');

    expect(
      getNotificationTargetPath(
        notification('APPLY_JOB'),
        ROLES_NAME.EMPLOYER,
        'vi'
      )
    ).toBe('/nha-tuyen-dung/ho-so-ung-tuyen');

    expect(
      getNotificationTargetPath(
        notification('NEW_MESSAGE'),
        ROLES_NAME.EMPLOYER,
        'vi'
      )
    ).toBe('/nha-tuyen-dung/ket-noi-voi-ung-vien');
  });

  it('localizes inferred job seeker notification routes for Vietnamese', () => {
    expect(
      getNotificationTargetPath(
        notification('APPLY_STATUS'),
        ROLES_NAME.JOB_SEEKER,
        'vi'
      )
    ).toBe('/viec-lam-cua-toi');

    expect(
      getNotificationTargetPath(
        notification('EMPLOYER_VIEWED_RESUME'),
        ROLES_NAME.JOB_SEEKER,
        'vi'
      )
    ).toBe('/cong-ty-cua-toi');

    expect(
      getNotificationTargetPath(
        notification('NEW_MESSAGE'),
        ROLES_NAME.JOB_SEEKER,
        'vi'
      )
    ).toBe('/ket-noi-voi-nha-tuyen-dung');
  });

  it('keeps canonical route paths for English', () => {
    expect(
      getNotificationTargetPath(
        notification('APPLY_JOB', {
          APPLY_JOB: { resume_slug: 'frontend-dev' },
        }),
        ROLES_NAME.EMPLOYER,
        'en'
      )
    ).toBe('/employer/candidates/frontend-dev');
  });

  it('localizes explicit internal links and preserves external links', () => {
    expect(
      getNotificationTargetPath(
        notification('SYSTEM', { link: '/jobs/frontend-dev?from=notification' }),
        ROLES_NAME.JOB_SEEKER,
        'vi'
      )
    ).toBe('/viec-lam/frontend-dev?from=notification');

    expect(
      getNotificationTargetPath(
        notification('SYSTEM', { url: 'https://example.com/jobs/frontend-dev' }),
        ROLES_NAME.JOB_SEEKER,
        'vi'
      )
    ).toBe('https://example.com/jobs/frontend-dev');
  });

  it('notification UI passes current language to notification route helpers', () => {
    const dropdownSource = readFileSync(
      join(__dirname, '../../components/Features/NotificationCard/index.tsx'),
      'utf8'
    );
    const pageSource = readFileSync(
      join(__dirname, '../../views/components/defaults/NotificationCard/index.tsx'),
      'utf8'
    );

    for (const source of [dropdownSource, pageSource]) {
      expect(source).toContain('i18n.language');
      expect(source).toContain('getNotificationTargetPath(item, currentUser?.roleName, i18n.language)');
    }

    expect(dropdownSource).toContain('localizeRoutePath');
    expect(dropdownSource).toContain('localizeRoutePath(`/${ROUTES.EMPLOYER.NOTIFICATION}`, i18n.language)');
    expect(dropdownSource).toContain('localizeRoutePath(`/${ROUTES.JOB_SEEKER.NOTIFICATION}`, i18n.language)');
  });
});
