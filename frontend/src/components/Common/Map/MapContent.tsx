import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerShadowImport from "leaflet/dist/images/marker-shadow.png";
import markerIconRetinaImport from "leaflet/dist/images/marker-icon-2x.png";
import markerIconImport from "leaflet/dist/images/marker-icon.png";
import * as React from "react";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Box, Typography, Paper } from "@mui/material";

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

// Next.js image imports return objects; extract string src
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

const mapMarkerIcon = new L.Icon({
  iconUrl: toSrc(markerIconImport),
  iconRetinaUrl: toSrc(markerIconRetinaImport),
  shadowUrl: toSrc(markerShadowImport),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  title?: string;
  subTitle?: string;
  latitude?: number;
  longitude?: number;
  height?: string | number;
}

type LeafletContainer = HTMLDivElement & {
  _leaflet_id?: number;
};

const Map = ({ title, subTitle, latitude, longitude, height = '260px' }: Props) => {
  const mapRef = React.useRef<L.Map | null>(null);
  const containerRef = React.useRef<LeafletContainer | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !latitude || !longitude) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    delete container._leaflet_id;

    const position: L.LatLngExpression = [latitude, longitude];
    const map = L.map(container, {
      center: position,
      zoom: 15,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    const FALLBACK_TILE_DATA_URI =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">' +
        '<rect width="256" height="256" fill="#f8fafc"/>' +
        '<path d="M0 64 H256 M0 128 H256 M0 192 H256 M64 0 V256 M128 0 V256 M192 0 V256" stroke="#e2e8f0" stroke-width="1"/>' +
        '<path d="M0 100 Q128 140 256 110" stroke="#cbd5e1" stroke-width="4" fill="none"/>' +
        '<path d="M80 0 Q110 128 100 256" stroke="#cbd5e1" stroke-width="3" fill="none"/>' +
        '<circle cx="128" cy="128" r="6" fill="#94a3b8" opacity="0.4"/>' +
        '</svg>'
      );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 19,
      attribution: "",
      errorTileUrl: FALLBACK_TILE_DATA_URI,
    }).addTo(map);

    const popup = document.createElement("div");
    const popupTitle = document.createElement("strong");
    popupTitle.textContent = title || "";
    const popupSubtitle = document.createElement("p");
    popupSubtitle.textContent = subTitle || "";
    popupSubtitle.style.margin = "4px 0 0";
    popup.appendChild(popupTitle);
    popup.appendChild(popupSubtitle);

    L.marker(position, { icon: mapMarkerIcon }).addTo(map).bindPopup(popup);
    mapRef.current = map;

    const timers = [
      window.setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      }, 50),
      window.setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      }, 200),
      window.setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      }, 600),
      window.setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      }, 1200),
    ];

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      });
      ro.observe(container);
    }

    return () => {
      timers.forEach(clearTimeout);
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
      delete container._leaflet_id;
    };
  }, [latitude, longitude, title, subTitle]);

  if (!latitude || !longitude) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 2,
          border: '1px dashed #ced4da'
        }}
      >
        <Typography 
          sx={{ 
            color: '#9e9e9e', 
            fontStyle: 'italic', 
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <LocationOnIcon fontSize="small" />
          Chưa thể xác định vị trí trên bản đồ
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        overflow: "hidden", 
        height, 
        width: "100%",
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      <Box
        ref={containerRef}
        aria-label={title || "Map"}
        sx={{ height: "100%", width: "100%", bgcolor: '#f8fafc' }}
      />
      <Box
        component="a"
        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(4px)',
          px: 1.25,
          py: 0.5,
          borderRadius: 1.5,
          border: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#2563eb',
          textDecoration: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          '&:hover': {
            bgcolor: '#ffffff',
            color: '#1d4ed8',
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
          },
        }}
      >
        <LocationOnIcon sx={{ fontSize: 14 }} />
        Mở Google Maps
      </Box>
    </Paper>
  );
};

export default Map;
