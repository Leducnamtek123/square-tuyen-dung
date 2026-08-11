import axios from 'axios';

export interface NominatimPlace {
  place_id: number | string;
  licence?: string;
  osm_type?: string;
  osm_id?: number | string;
  boundingbox?: string[];
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  importance?: number;
  icon?: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    quarter?: string;
    neighbourhood?: string;
    city_district?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

const nominatimAxios = axios.create({
  headers: {
    'Accept-Language': 'vi,en',
  },
});

export const nominatimService = {
  /**
   * Search for address suggestions (Forward Geocoding)
   */
  searchLocation: async (query: string, limit = 8): Promise<NominatimPlace[]> => {
    const normalizedInput = typeof query === 'string' ? query.trim() : '';
    if (!normalizedInput || normalizedInput.length < 2) {
      return [];
    }

    try {
      const response = await nominatimAxios.get<NominatimPlace[]>(`${NOMINATIM_BASE_URL}/search`, {
        params: {
          format: 'json',
          q: normalizedInput,
          addressdetails: 1,
          limit,
        },
      });

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Nominatim searchLocation error:', error);
      return [];
    }
  },

  /**
   * Convert coordinates to detailed address (Reverse Geocoding)
   */
  reverseGeocode: async (lat: number, lng: number): Promise<NominatimPlace | null> => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      return null;
    }

    try {
      const response = await nominatimAxios.get<NominatimPlace>(`${NOMINATIM_BASE_URL}/reverse`, {
        params: {
          format: 'json',
          lat,
          lon: lng,
          addressdetails: 1,
        },
      });

      return response.data || null;
    } catch (error) {
      console.error('Nominatim reverseGeocode error:', error);
      return null;
    }
  },
};

export default nominatimService;
