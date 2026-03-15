import { AUTH_CONFIG } from '../configs/constants';
import axios from 'axios';

const goongService = {

  getPlaces: (input) => {
    const normalizedInput = typeof input === 'string' ? input.trim() : '';
    if (!normalizedInput || normalizedInput.length < 3) {
      return Promise.resolve({ predictions: [] });
    }

    const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${AUTH_CONFIG.GOONGAPI_KEY}&input=${encodeURIComponent(
      normalizedInput
    )}&limit=15`;

    return axios.get(url).then((response) => response.data);

  },

  getPlaceDetailByPlaceId: (id) => {
    const normalizedId = typeof id === 'string' ? id.trim() : '';
    if (!normalizedId) {
      return Promise.resolve(null);
    }

    const url = `https://rsapi.goong.io/Place/Detail?place_id=${normalizedId}&api_key=${AUTH_CONFIG.GOONGAPI_KEY}`;

    return axios.get(url).then((response) => response.data);

  },

};

export default goongService;
