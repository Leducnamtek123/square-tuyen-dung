import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerShadowImport from "leaflet/dist/images/marker-shadow.png";
import markerIconRetinaImport from "leaflet/dist/images/marker-icon-2x.png";
import * as React from "react";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Box, Typography, Paper } from "@mui/material";
import { ICONS } from "@/configs/constants";

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

// Next.js image imports return objects; extract string src
const toSrc = (img: string | StaticImageData | { default: StaticImageData }): string => 
  typeof img === 'string' ? img : (img as { src?: string; default?: { src?: string } })?.src || (img as { default?: { src?: string } })?.default?.src || '';

const markerShadow = toSrc(markerShadowImport as string | StaticImageData | { default: StaticImageData });
const markerIconRetina = toSrc(markerIconRetinaImport as string | StaticImageData | { default: StaticImageData });

interface Props {
  title?: string;
  subTitle?: string;
  latitude?: number;
  longitude?: number;
}

type LeafletContainer = HTMLDivElement & {
  _leaflet_id?: number;
};

// Fix for default Leaflet icon issues in Webpack/Next.js
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: ICONS.LOCATION_MARKER,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [56, 56],
  iconAnchor: [28, 60],
  popupAnchor: [0, -60],
  shadowSize: [41, 41]
});

const Map = ({ title, subTitle, latitude, longitude }: Props) => {
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
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const popup = document.createElement("div");
    const popupTitle = document.createElement("strong");
    popupTitle.textContent = title || "";
    const popupSubtitle = document.createElement("p");
    popupSubtitle.textContent = subTitle || "";
    popupSubtitle.style.margin = "4px 0 0";
    popup.appendChild(popupTitle);
    popup.appendChild(popupSubtitle);

    L.marker(position).addTo(map).bindPopup(popup);
    mapRef.current = map;

    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
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
          height: '250px', 
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
      elevation={3} 
      sx={{ 
        overflow: "hidden", 
        height: "250px", 
        borderRadius: 2,
      }}
    >
      <Box
        ref={containerRef}
        aria-label={title || "Map"}
        sx={{ height: "100%", width: "100%" }}
      />
    </Paper>
  );
};

export default Map;
