import { extractPersonalProfileDistrictOptions, resolvePersonalProfileDistrictOptions } from '../usePersonalProfileDistrictOptions';

describe('extractPersonalProfileDistrictOptions', () => {
  it('uses the normalized commonService data envelope', () => {
    const districts = [{ id: 1, name: 'Quan 1' }];

    expect(extractPersonalProfileDistrictOptions({ data: districts })).toEqual(districts);
  });

  it('keeps compatibility with raw arrays and paginated results', () => {
    const rawDistricts = [{ id: 2, name: 'Quan 2' }];
    const paginatedDistricts = [{ id: 3, name: 'Quan 3' }];

    expect(extractPersonalProfileDistrictOptions(rawDistricts)).toEqual(rawDistricts);
    expect(extractPersonalProfileDistrictOptions({ results: paginatedDistricts })).toEqual(paginatedDistricts);
  });
});

describe('resolvePersonalProfileDistrictOptions', () => {
  it('clears stale district options when city is empty', () => {
    expect(resolvePersonalProfileDistrictOptions('', { data: [{ id: 1, name: 'Quan 1' }] })).toEqual([]);
    expect(resolvePersonalProfileDistrictOptions(null, { data: [{ id: 2, name: 'Quan 2' }] })).toEqual([]);
  });

  it('extracts options when city is selected', () => {
    expect(resolvePersonalProfileDistrictOptions(79, { data: [{ id: 1, name: 'Quan 1' }] })).toEqual([{ id: 1, name: 'Quan 1' }]);
  });
});
