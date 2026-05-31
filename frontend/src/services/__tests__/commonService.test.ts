import commonService from '../commonService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((value) => Promise.resolve(value)),
}));

describe('commonService location options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes districts returned as a raw option array', async () => {
    const districts = [{ id: 1, name: 'Quan 1' }];
    (httpRequest.get as jest.Mock).mockResolvedValueOnce(districts);

    const res = await commonService.getDistrictsByCityId(79);

    expect(httpRequest.get).toHaveBeenCalledWith('common/districts/?cityId=79');
    expect(res).toEqual({ data: districts });
  });

  it('normalizes districts returned in a data envelope', async () => {
    const districts = [{ id: 2, name: 'Quan 2' }];
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: districts });

    const res = await commonService.getDistrictsByCityId({ id: 79 });

    expect(httpRequest.get).toHaveBeenCalledWith('common/districts/?cityId=79');
    expect(res).toEqual({ data: districts });
  });

  it('skips district request when city is empty', async () => {
    const res = await commonService.getDistrictsByCityId('');

    expect(httpRequest.get).not.toHaveBeenCalled();
    expect(res).toEqual({ data: [] });
  });

  it('normalizes wards returned as a raw option array', async () => {
    const wards = [{ id: 10, name: 'Phuong 1' }];
    (httpRequest.get as jest.Mock).mockResolvedValueOnce(wards);

    const res = await commonService.getWardsByDistrictId(1);

    expect(httpRequest.get).toHaveBeenCalledWith('common/wards/?districtId=1');
    expect(res).toEqual({ data: wards });
  });
});
