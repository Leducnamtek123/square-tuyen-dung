import { readFileSync } from 'fs';
import { join } from 'path';

const headerSource = readFileSync(join(__dirname, '../../../layouts/components/employers/Header/index.tsx'), 'utf8');
const commonVi = require('../../../i18n/locales/vi/common.json');
const commonEn = require('../../../i18n/locales/en/common.json');

describe('admin breadcrumb aria i18n', () => {
  it('does not hard-code breadcrumb aria labels or hide missing locale keys', () => {
    expect(headerSource).not.toContain('aria-label="breadcrumb"');
    expect(headerSource).not.toContain("defaultValue: 'Breadcrumb'");
    expect(headerSource).toContain("t('breadcrumbs.label')");
    expect(commonVi.breadcrumbs.label).toBeTruthy();
    expect(commonEn.breadcrumbs.label).toBeTruthy();
  });
});
