import { readFileSync } from 'fs';
import { join } from 'path';

const readFeature = (relativePath: string) => readFileSync(join(__dirname, '..', relativePath), 'utf8');

const routeGuards = [
  {
    path: 'Chats/SidebarHeader/index.tsx',
    forbidden: ['push(`/${ROUTES.EMPLOYER.DASHBOARD}`)', 'push(`/${ROUTES.JOB_SEEKER.HOME}`)'],
  },
  {
    path: 'ChatCard/index.tsx',
    forbidden: ['push(`/${ROUTES.EMPLOYER.CHAT}`)', 'push(`/${ROUTES.JOB_SEEKER.CHAT}`)'],
  },
];

describe('chat route shortcuts', () => {
  it.each(routeGuards)('$path uses localized route targets', ({ path, forbidden }) => {
    const source = readFeature(path);

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    forbidden.forEach((pattern) => {
      expect(source).not.toContain(pattern);
    });
  });
});
