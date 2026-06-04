import { readFileSync } from 'fs';
import { join } from 'path';

describe('PersonalProfileFormFields', () => {
  it('uses job seeker i18n keys for visible labels and placeholders', () => {
    const fieldsSource = readFileSync(join(__dirname, '../PersonalProfileFormFields.tsx'), 'utf8');

    expect(fieldsSource).not.toContain('title="Phone Number"');
    expect(fieldsSource).not.toContain('placeholder="Enter phone number"');
    expect(fieldsSource).not.toContain('title="Date of Birth"');
    expect(fieldsSource).not.toContain('title="Gender"');
    expect(fieldsSource).not.toContain('placeholder="Select gender"');
    expect(fieldsSource).not.toContain('title="Marital Status"');
    expect(fieldsSource).not.toContain('placeholder="Select marital status"');
    expect(fieldsSource).not.toContain('title="City/Province"');
    expect(fieldsSource).not.toContain('placeholder="Select city/province"');
    expect(fieldsSource).not.toContain('title="District"');
    expect(fieldsSource).not.toContain('placeholder="Select district"');
    expect(fieldsSource).not.toContain('title="Address"');
    expect(fieldsSource).not.toContain('placeholder="Enter address"');
  });
});
