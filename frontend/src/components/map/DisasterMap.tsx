import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Disaster, Shelter } from '../../types';

// Custom Leaflet Icons using SVG Data URIs
const createCustomIcon = (color: string, label: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="6" fill="#ffffff" opacity="0.9"/>
    <text x="12" y="15" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">${label}</text>
  </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  });
};

const disasterIconCritical = createCustomIcon('#ef4444', 'D');
const disasterIconHigh = createCustomIcon('#f97316', 'D');
const disasterIconMedium = createCustomIcon('#eab308', 'D');
const disasterIconLow = createCustomIcon('#10b981', 'D');

const shelterIconOpen = createCustomIcon('#3b82f6', 'S');
const shelterIconFull = createCustomIcon('#64748b', 'S');

interface DisasterMapProps {
  disasters?: Disaster[];
  shelters?: Shelter[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Sub-component to re-center map dynamically
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

export const DisasterMap: React.FC<DisasterMapProps> = ({
  disasters = [],
  shelters = [],
  center = [37.7749, -122.4194],
  zoom = 12,
  height = '450px',
}) => {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl relative" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <RecenterMap center={center} />
        {/* OpenStreetMap Dark CartoDB Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Disaster Markers */}
        {disasters.map((d) => {
          let icon = disasterIconMedium;
          if (d.severity === 'Critical') icon = disasterIconCritical;
          else if (d.severity === 'High') icon = disasterIconHigh;
          else if (d.severity === 'Low') icon = disasterIconLow;

          return (
            <Marker key={`disaster-${d.id}`} position={[d.latitude, d.longitude]} icon={icon}>
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                      🚨 {d.type} ({d.severity})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {d.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{d.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2">{d.description}</p>
                  <div className="mt-2 text-[11px] text-slate-400">📍 {d.location}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shelter Markers */}
        {shelters.map((s) => {
          const icon = s.status === 'FULL' ? shelterIconFull : shelterIconOpen;
          return (
            <Marker key={`shelter-${s.id}`} position={[s.latitude, s.longitude]} icon={icon}>
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                      🏥 Emergency Shelter
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        s.status === 'OPEN' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{s.name}</h4>
                  <p className="text-xs text-slate-300">📍 {s.location}</p>
                  <div className="mt-2 text-xs flex justify-between items-center text-slate-300 bg-slate-800/80 p-1.5 rounded">
                    <span>Occupancy:</span>
                    <span className="font-bold text-sky-400">
                      {s.currentOccupancy} / {s.capacity}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">📞 {s.contactNumber}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
