import axios from 'axios';
import { AUTH_CONFIG } from '../configs/constants';

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetail {
  result: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
    name: string;
  };
  status: string;
}

const goongService = {
  getPlaces: (input: string): Promise<{ predictions: PlacePrediction[] }> => {
    const normalizedInput = typeof input === 'string' ? input.trim() : '';
    if (!normalizedInput || normalizedInput.length < 3) {
      return Promise.resolve({ predictions: [] });
    }

    const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${AUTH_CONFIG.GOONGAPI_KEY}&input=${encodeURIComponent(
      normalizedInput
    )}&limit=15`;

    return axios.get(url).then((response) => response.data);
  },

  getPlaceDetailByPlaceId: (id: string): Promise<PlaceDetail | null> => {
    const normalizedId = typeof id === 'string' ? id.trim() : '';
    if (!normalizedId) {
      return Promise.resolve(null);
    }

    const url = `https://rsapi.goong.io/Place/Detail?place_id=${normalizedId}&api_key=${AUTH_CONFIG.GOONGAPI_KEY}`;

    return axios.get(url).then((response) => response.data);
  },
};

export default goongService;
