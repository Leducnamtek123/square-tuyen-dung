import fs from 'fs';
import path from 'path';

import {
  createEmptyJobNotificationFormData,
  getJobNotificationFormValidationErrors,
} from '../types';

describe('getJobNotificationFormValidationErrors', () => {
  const validFormData = {
    ...createEmptyJobNotificationFormData(),
    jobName: 'Frontend Developer',
    salary: 12000000,
    position: 1,
    experience: 2,
    career: 10,
    city: 20,
  };

  it('accepts values that match the backend serializer contract', () => {
    expect(getJobNotificationFormValidationErrors(validFormData)).toEqual({});
  });

  it('rejects an empty or too long job name before submitting', () => {
    expect(
      getJobNotificationFormValidationErrors({
        ...validFormData,
        jobName: '   ',
      }),
    ).toEqual({ jobName: 'jobNameRequired' });

    expect(
      getJobNotificationFormValidationErrors({
        ...validFormData,
        jobName: 'a'.repeat(256),
      }),
    ).toEqual({ jobName: 'jobNameMax' });
  });

  it('rejects negative salary and choice values outside backend choices', () => {
    expect(
      getJobNotificationFormValidationErrors({
        ...validFormData,
        salary: -1,
        frequency: 7,
        position: 999,
        experience: 999,
      }),
    ).toEqual({
      salary: 'salaryMin',
      frequency: 'frequencyInvalid',
      position: 'choiceInvalid',
      experience: 'choiceInvalid',
    });
  });

  it('rejects non-integer salary and invalid optional relation ids', () => {
    expect(
      getJobNotificationFormValidationErrors({
        ...validFormData,
        salary: 1.5,
        career: 0,
        city: -2,
      }),
    ).toEqual({
      salary: 'numberInteger',
      career: 'idInvalid',
      city: 'idInvalid',
    });
  });

  it('wires validation errors into the admin dialog fields', () => {
    const dialogSource = fs.readFileSync(
      path.join(__dirname, '../JobNotificationFormDialog.tsx'),
      'utf8',
    );

    expect(dialogSource).toContain('getJobNotificationFormValidationErrors');
    expect(dialogSource).toContain('helperText');
    expect(dialogSource).toContain('hasValidationErrors');
    expect(dialogSource).toContain("getValidationText('career')");
    expect(dialogSource).toContain("getValidationText('city')");
  });
});
