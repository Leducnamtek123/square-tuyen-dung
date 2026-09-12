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
const PHOTON_BASE_URL = 'https://photon.komoot.io';

const nominatimAxios = axios.create({
  timeout: 3500,
  headers: {
    'Accept-Language': 'vi,en',
  },
});

interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    osm_id?: number | string;
    osm_type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    quarter?: string;
    suburb?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
  };
}

const mapPhotonToNominatim = (feat: PhotonFeature, index: number): NominatimPlace => {
  const p = feat.properties || {};
  const [lon, lat] = feat.geometry?.coordinates || [0, 0];
  const road = p.street || '';
  const houseNumber = p.housenumber || '';
  const district = p.district || p.suburb || p.quarter || '';
  const city = p.city || p.county || p.state || '';
  const state = p.state || '';
  const country = p.country || 'Việt Nam';

  const parts = [
    houseNumber && road ? `${houseNumber} ${road}` : road || p.name,
    p.name && p.name !== road && p.name !== houseNumber ? p.name : undefined,
    district,
    city,
    state && state !== city ? state : undefined,
    country,
  ].filter(Boolean);

  const display_name = parts.join(', ') || p.name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

  return {
    place_id: p.osm_id ? `${p.osm_id}-${index}` : Date.now() + index,
    lat: String(lat),
    lon: String(lon),
    display_name,
    address: {
      house_number: houseNumber,
      road,
      district,
      city,
      state,
      postcode: p.postcode,
      country,
      country_code: p.countrycode,
    },
  };
};

export const nominatimService = {
  /**
   * Search for address suggestions (Forward Geocoding)
   */
  searchLocation: async (query: string, limit = 8): Promise<NominatimPlace[]> => {
    const normalizedInput = typeof query === 'string' ? query.trim() : '';
    if (!normalizedInput || normalizedInput.length < 2) {
      return [];
    }

    // Try Nominatim first
    try {
      const response = await nominatimAxios.get<NominatimPlace[]>(`${NOMINATIM_BASE_URL}/search`, {
        params: {
          format: 'json',
          q: normalizedInput,
          addressdetails: 1,
          limit,
        },
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Nominatim failed or timed out, gracefully fallback to Photon
    }

    // Fallback: Photon API
    try {
      const photonRes = await axios.get<{ features: PhotonFeature[] }>(`${PHOTON_BASE_URL}/api`, {
        params: {
          q: normalizedInput,
          limit,
          lat: 10.7769,
          lon: 106.7009,
        },
        timeout: 4500,
      });

      if (Array.isArray(photonRes.data?.features)) {
        return photonRes.data.features.map(mapPhotonToNominatim);
      }
    } catch (photonErr) {
      console.warn('Photon geocode fallback error:', photonErr);
    }

    return [];
  },

  /**
   * Convert coordinates to detailed address (Reverse Geocoding)
   */
  reverseGeocode: async (lat: number, lng: number): Promise<NominatimPlace | null> => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      return null;
    }

    // Try Nominatim first
    try {
      const response = await nominatimAxios.get<NominatimPlace>(`${NOMINATIM_BASE_URL}/reverse`, {
        params: {
          format: 'json',
          lat,
          lon: lng,
          addressdetails: 1,
        },
      });

      if (response.data) {
        return response.data;
      }
    } catch {
      // Nominatim failed or timed out, gracefully fallback to Photon
    }

    // Fallback: Photon API
    try {
      const photonRes = await axios.get<{ features: PhotonFeature[] }>(`${PHOTON_BASE_URL}/reverse`, {
        params: {
          lat,
          lon: lng,
        },
        timeout: 4500,
      });

      const first = photonRes.data?.features?.[0];
      if (first) {
        return mapPhotonToNominatim(first, 0);
      }
    } catch (photonErr) {
      console.warn('Photon reverseGeocode fallback error:', photonErr);
    }

    return null;
  },
};

export default nominatimService;
