import axios from 'axios';
import { AUTH_CONFIG } from '../configs/constants';

type AnyRecord = Record<string, unknown>;

const goongService = {
  getPlaces: (input: string): Promise<AnyRecord> => {
    const normalizedInput = typeof input === 'string' ? input.trim() : '';
    if (!normalizedInput || normalizedInput.length < 3) {
      return Promise.resolve({ predictions: [] } as AnyRecord);
    }

    const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${AUTH_CONFIG.GOONGAPI_KEY}&input=${encodeURIComponent(
      normalizedInput
    )}&limit=15`;

    return axios.get(url).then((response) => response.data as AnyRecord);
  },

  getPlaceDetailByPlaceId: (id: string): Promise<AnyRecord | null> => {
    const normalizedId = typeof id === 'string' ? id.trim() : '';
    if (!normalizedId) {
      return Promise.resolve(null);
    }

    const url = `https://rsapi.goong.io/Place/Detail?place_id=${normalizedId}&api_key=${AUTH_CONFIG.GOONGAPI_KEY}`;

    return axios.get(url).then((response) => response.data as AnyRecord);
  },
};

export default goongService;
