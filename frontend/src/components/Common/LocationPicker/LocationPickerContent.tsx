'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';

import nominatimService, { NominatimPlace } from '@/services/nominatimService';
import useDebounce from '@/hooks/useDebounce';

// Leaflet marker icon fix for Next.js
import markerShadowImport from 'leaflet/dist/images/marker-shadow.png';
import markerIconRetinaImport from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconImport from 'leaflet/dist/images/marker-icon.png';

const toSrc = (img: unknown): string => {
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object') {
    if ('src' in img && typeof (img as { src: string }).src === 'string') {
      return (img as { src: string }).src;
    }
    if ('default' in img && (img as { default: { src?: string } }).default?.src) {
      return (img as { default: { src: string } }).default.src;
    }
  }
  return '';
};

const defaultMarkerIcon = new L.Icon({
  iconUrl: toSrc(markerIconImport),
  iconRetinaUrl: toSrc(markerIconRetinaImport),
  shadowUrl: toSrc(markerShadowImport),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface LocationValue {
  address?: string;
  lat?: number | string | null;
  lng?: number | string | null;
  city?: string | number | null;
  district?: string | number | null;
  ward?: string | number | null;
}

export interface LocationPickerProps {
  value?: LocationValue;
  onChange?: (location: LocationValue) => void;
  height?: string | number;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  showSearch?: boolean;
  showGps?: boolean;
  defaultCenter?: [number, number];
}

// Default center: Ha Noi, Vietnam [21.0285, 105.8542] or Ho Chi Minh City [10.8231, 106.6297]
const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009];

const isValidLatLng = (lat: unknown, lng: unknown): boolean => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return (
    typeof lat !== 'undefined' &&
    typeof lng !== 'undefined' &&
    lat !== null &&
    lng !== null &&
    !isNaN(nLat) &&
    !isNaN(nLng) &&
    isFinite(nLat) &&
    isFinite(nLng) &&
    nLat >= -90 &&
    nLat <= 90 &&
    nLng >= -180 &&
    nLng <= 180
  );
};

function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (err) {
        console.warn('Map invalidateSize error:', err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Component to dynamically adjust map center when coordinates change
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      isValidLatLng(center[0], center[1])
    ) {
      try {
        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          map.flyTo(center, Math.max(map.getZoom() || 15, 15), { animate: true, duration: 1 });
        }
      } catch (err) {
        console.warn('MapRecenter flyTo error:', err);
      }
    }
  }, [center, map]);
  return null;
}

// Component to handle map clicks & marker dragging
function InteractiveMapEvents({
  position,
  setPosition,
  onPositionChange,
  disabled,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onPositionChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useMapEvents({
    click(e) {
      if (disabled) return;
      if (e?.latlng && isValidLatLng(e.latlng.lat, e.latlng.lng)) {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onPositionChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          if (latLng && isValidLatLng(latLng.lat, latLng.lng)) {
            const newPos: [number, number] = [latLng.lat, latLng.lng];
            setPosition(newPos);
            onPositionChange(latLng.lat, latLng.lng);
          }
        }
      },
    }),
    [onPositionChange, setPosition]
  );

  const safePosition: [number, number] = isValidLatLng(position?.[0], position?.[1])
    ? position
    : DEFAULT_CENTER;

  return (
    <Marker
      draggable={!disabled}
      eventHandlers={eventHandlers}
      position={safePosition}
      ref={markerRef}
      icon={defaultMarkerIcon}
    >
      <Popup>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Vị trí đã chọn trên bản đồ
        </Typography>
      </Popup>
    </Marker>
  );
}

export default function LocationPickerContent({
  value,
  onChange,
  height = '360px',
  disabled = false,
  label = 'Vị trí trên bản đồ',
  placeholder = 'Nhập tên đường, quận/huyện, tỉnh thành để tìm kiếm...',
  showSearch = true,
  showGps = true,
  defaultCenter = DEFAULT_CENTER,
}: LocationPickerProps) {
  const { t } = useTranslation('common');
  // Parsed initial coordinates
  const initialLat = isValidLatLng(value?.lat, value?.lng) ? Number(value?.lat) : null;
  const initialLng = isValidLatLng(value?.lat, value?.lng) ? Number(value?.lng) : null;

  const [position, setPosition] = useState<[number, number]>(() => {
    if (initialLat !== null && initialLng !== null && isValidLatLng(initialLat, initialLng)) {
      return [initialLat, initialLng];
    }
    return isValidLatLng(defaultCenter?.[0], defaultCenter?.[1]) ? defaultCenter : DEFAULT_CENTER;
  });

  const [address, setAddress] = useState<string>(value?.address || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 450);

  const [searchResults, setSearchResults] = useState<NominatimPlace[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Sync external value changes
  useEffect(() => {
    if (value?.address !== undefined && value.address !== address) {
      setAddress(value.address);
    }
    if (isValidLatLng(value?.lat, value?.lng)) {
      const numLat = Number(value!.lat);
      const numLng = Number(value!.lng);
      if (numLat !== position[0] || numLng !== position[1]) {
        setPosition([numLat, numLng]);
      }
    }
  }, [value]);

  // Handle Nominatim search autocomplete
  useEffect(() => {
    let active = true;
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const fetchSearch = async () => {
      setIsSearching(true);
      try {
        const results = await nominatimService.searchLocation(debouncedSearchQuery);
        if (active) {
          setSearchResults(results);
        }
      } catch (err) {
        if (active) setSearchResults([]);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    void fetchSearch();

    return () => {
      active = false;
    };
  }, [debouncedSearchQuery]);

  // Process location updates & notify parent
  const handleLocationSelected = useCallback(
    (newLat: number, newLng: number, placeData?: NominatimPlace | null) => {
      const newPos: [number, number] = [newLat, newLng];
      setPosition(newPos);

      if (placeData) {
        const fullAddress = placeData.display_name;
        const addrObj = placeData.address || {};
        const city = addrObj.city || addrObj.state || addrObj.county || '';
        const district = addrObj.district || addrObj.city_district || addrObj.suburb || '';
        const ward = addrObj.quarter || addrObj.neighbourhood || addrObj.road || '';

        setAddress(fullAddress);
        onChange?.({
          address: fullAddress,
          lat: newLat,
          lng: newLng,
          city,
          district,
          ward,
        });
      } else {
        setIsGeocoding(true);
        nominatimService
          .reverseGeocode(newLat, newLng)
          .then((res) => {
            if (res) {
              const fullAddress = res.display_name;
              const addrObj = res.address || {};
              const city = addrObj.city || addrObj.state || addrObj.county || '';
              const district = addrObj.district || addrObj.city_district || addrObj.suburb || '';
              const ward = addrObj.quarter || addrObj.neighbourhood || addrObj.road || '';

              setAddress(fullAddress);
              onChange?.({
                address: fullAddress,
                lat: newLat,
                lng: newLng,
                city,
                district,
                ward,
              });
            } else {
              onChange?.({
                address,
                lat: newLat,
                lng: newLng,
              });
            }
          })
          .finally(() => setIsGeocoding(false));
      }
    },
    [address, onChange]
  );

  // GPS Device Geolocation
  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setGpsError(null);
    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleLocationSelected(lat, lng);
      },
      (err) => {
        setIsGpsLoading(false);
        console.warn('Geolocation error:', err);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setGpsError('Quyền truy cập vị trí đã bị từ chối hoặc bị chặn bởi trình duyệt. Vui lòng cho phép quyền vị trí trong cài đặt trình duyệt để sử dụng tính năng này.');
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setGpsError('Không thể xác định vị trí hiện tại của thiết bị. Vui lòng kiểm tra lại kết nối GPS hoặc thử lại sau.');
        } else if (err.code === 3) {
          // TIMEOUT
          setGpsError('Yêu cầu định vị đã hết thời gian chờ (timeout). Vui lòng thử lại.');
        } else {
          setGpsError('Không thể lấy vị trí thiết bị. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
          {label}
        </Typography>
      )}

      {/* Control Bar: Search & GPS Button */}
      {(showSearch || showGps) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
          {showSearch && (
            <Autocomplete
              fullWidth
              freeSolo
              options={searchResults}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.display_name)}
              filterOptions={(x) => x}
              loading={isSearching}
              disabled={disabled}
              noOptionsText={t('common:noOptions')}
              loadingText={t('common:loading')}
              openText={t('common:autocomplete.open')}
              closeText={t('common:autocomplete.close')}
              clearText={t('common:autocomplete.clear')}
              onInputChange={(_e, newInputValue) => setSearchQuery(newInputValue)}
              onChange={(_e, selectedOption) => {
                if (selectedOption && typeof selectedOption === 'object') {
                  const place = selectedOption as NominatimPlace;
                  const lat = parseFloat(place.lat);
                  const lng = parseFloat(place.lon);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    handleLocationSelected(lat, lng, place);
                  }
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={placeholder}
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    endAdornment: (
                      <>
                        {isSearching ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };
                return (
                  <Box component="li" key={key || option.place_id} {...optionProps} sx={{ py: 1, px: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <LocationOnIcon color="primary" sx={{ fontSize: 20, mt: 0.2 }} />
                      <Typography variant="body2" sx={{ color: 'text.primary', wordBreak: 'break-word' }}>
                        {option.display_name}
                      </Typography>
                    </Stack>
                  </Box>
                );
              }}
            />
          )}

          {showGps && (
            <Tooltip title="Xác định vị trí hiện tại của thiết bị qua GPS">
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGetCurrentLocation}
                disabled={disabled || isGpsLoading}
                startIcon={isGpsLoading ? <CircularProgress size={18} color="inherit" /> : <MyLocationIcon />}
                sx={{
                  whiteSpace: 'nowrap',
                  borderRadius: 1.5,
                  height: 40,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Vị trí của tôi
              </Button>
            </Tooltip>
          )}
        </Stack>
      )}

      {gpsError && (
        <Alert severity="warning" onClose={() => setGpsError(null)} sx={{ mb: 1.5, borderRadius: 1.5 }}>
          {gpsError}
        </Alert>
      )}

      {/* Leaflet Map Card */}
      <Paper
        elevation={2}
        sx={{
          position: 'relative',
          height,
          width: '100%',
          borderRadius: 2.5,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapAutoResize />
          <MapRecenter center={position} />
          <InteractiveMapEvents
            disabled={disabled}
            onPositionChange={(lat, lng) => handleLocationSelected(lat, lng)}
            position={position}
            setPosition={setPosition}
          />
        </MapContainer>

        {/* Loading Overlay when Reverse Geocoding */}
        {isGeocoding && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1000,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              px: 2,
              py: 0.75,
              borderRadius: 2,
              boxShadow: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CircularProgress size={16} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Đang xác định địa chỉ...
            </Typography>
          </Box>
        )}

        {/* Map Helper Badge */}
        {!disabled && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              bgcolor: 'rgba(15, 23, 42, 0.82)',
              color: '#ffffff',
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              fontSize: '0.75rem',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 14, color: '#60A5FA' }} />
            Nhấp vào bản đồ hoặc kéo ghim để cập nhật vị trí
          </Box>
        )}
      </Paper>

      {/* Location Details Footer Info */}
      {address && (
        <Paper
          variant="outlined"
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'action.hover',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Địa chỉ đã chọn:
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', pl: 3.2 }}>
              {address}
            </Typography>
            {position[0] && position[1] && (
              <Stack direction="row" spacing={1} sx={{ pl: 3.2 }}>
                <Chip
                  size="small"
                  label={`Vĩ độ: ${position[0].toFixed(6)}`}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
                <Chip
                  size="small"
                  label={`Kinh độ: ${position[1].toFixed(6)}`}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              </Stack>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
