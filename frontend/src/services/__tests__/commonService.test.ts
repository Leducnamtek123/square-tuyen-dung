import commonService from '../commonService';
import httpRequest from '../../utils/httpRequest';
import { presignInObject } from '../../utils/presignUrl';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((value) => Promise.resolve(value)),
}));

describe('commonService location options', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (presignInObject as jest.Mock).mockImplementation((value) => Promise.resolve(value));
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

  it('normalizes deeply nested district and ward option responses', async () => {
    const districts = [{ id: 3, name: 'Quan 3' }];
    const wards = [{ id: 30, name: 'Phuong 3' }];
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { count: 1, results: districts } } })
      .mockResolvedValueOnce({ data: { data: { count: 1, results: wards } } });

    await expect(commonService.getDistrictsByCityId(79)).resolves.toEqual({ data: districts });
    await expect(commonService.getWardsByDistrictId(3)).resolves.toEqual({ data: wards });
  });

  it('normalizes deeply nested career list responses', async () => {
    const careers = [{ id: 5, name: 'Architecture' }];
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { data: { count: 1, results: careers } },
    });

    await expect(commonService.getAllCareersSimple()).resolves.toEqual(careers);
  });

  it('unwraps nested common config responses after presign', async () => {
    const config = {
      cityOptions: [{ id: 1, name: 'TP HCM' }],
      careerOptions: [{ id: 5, name: 'IT' }],
      systemSettings: { maintenanceMode: false },
    };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: config } });

    await expect(commonService.getConfigs()).resolves.toEqual(config);
    expect(httpRequest.get).toHaveBeenCalledWith('common/configs/');
    expect(presignInObject).toHaveBeenCalledWith({ data: { data: config } });
  });

  it('unwraps nested upload file responses', async () => {
    const uploadedFile = {
      id: 9,
      url: 'https://cdn.example.com/chat_attachments/image.png',
      name: 'image.png',
    };
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      data: { data: uploadedFile },
    });

    await expect(commonService.uploadFile(file, 'OTHER')).resolves.toEqual(uploadedFile);
    expect(httpRequest.post).toHaveBeenCalledWith(
      'common/upload-file/',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  });
});
