import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation as useGeoLocation } from '@/hooks/useLocation';
import { getNearbyServices, NearbyService } from '@/services/nearbyServices';
import { useLocation as useWouterLocation } from 'wouter';
import { ArrowLeft, LocateFixed, Layers, AlertTriangle } from 'lucide-react';
import NearbyServiceCard from '@/components/map/NearbyServiceCard';
import AmbulanceETA from '@/components/map/AmbulanceETA';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const makeIcon = (color: string, emoji: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      width:32px;height:32px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;border:2px solid rgba(255,255,255,0.8);
      box-shadow:0 0 12px ${color}88;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.6;"></div>
    <div style="position:relative;background:#3b82f6;border-radius:50%;width:20px;height:20px;border:3px solid white;box-shadow:0 0 10px #3b82f6aa;"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const serviceIcons: Record<string, L.DivIcon> = {
  hospital: makeIcon('#ef4444', '🏥'),
  police: makeIcon('#3b82f6', '🚔'),
  fire_station: makeIcon('#f97316', '🚒'),
  clinic: makeIcon('#22c55e', '⚕️'),
  ambulance: makeIcon('#eab308', '🚑'),
};

function MapController({ center, fly }: { center: [number, number]; fly: boolean }) {
  const map = useMap();
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      map.setView(center, 15);
      firstRun.current = false;
    } else if (fly) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, fly]);
  return null;
}

export default function LiveMapPage() {
  const [, setLocation] = useWouterLocation();
  const { lat, lng, loading: geoLoading } = useGeoLocation();
  const [services, setServices] = useState<NearbyService[]>([]);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [flyTo, setFlyTo] = useState(false);
  const [sosActive] = useState(() => {
    // Check if arriving from SOS flow
    return sessionStorage.getItem('sos_active') === 'true';
  });

  const center: [number, number] = lat && lng ? [lat, lng] : [40.7128, -74.006];
  const nearest2 = services.slice(0, 2);

  useEffect(() => {
    if (!lat || !lng) return;
    setFetchingServices(true);
    getNearbyServices(lat, lng, 7000)
      .then(setServices)
      .finally(() => setFetchingServices(false));
  }, [lat, lng]);

  const handleLocate = () => {
    setFlyTo(true);
    setTimeout(() => setFlyTo(false), 2000);
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col relative bg-background overflow-hidden">

      {/* Map fills entire screen */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%', background: '#0a0a0f' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          {lat && lng && <MapController center={[lat, lng]} fly={flyTo} />}

          {/* Accuracy circle */}
          {lat && lng && (
            <Circle
              center={[lat, lng]}
              radius={80}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1 }}
            />
          )}

          {/* User marker */}
          {lat && lng && (
            <Marker position={[lat, lng]} icon={userIcon}>
              <Popup className="leaflet-popup-dark">
                <div className="font-semibold text-sm">You are here</div>
                <div className="text-xs text-gray-400 mt-0.5 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</div>
              </Popup>
            </Marker>
          )}

          {/* Service markers */}
          {services.map(s => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={serviceIcons[s.type] ?? serviceIcons.hospital}
            >
              <Popup>
                <div className="font-bold text-sm">{s.name}</div>
                <div className="text-xs text-gray-400 capitalize">{s.type.replace('_', ' ')}</div>
                {s.distance && <div className="text-xs text-blue-400 mt-0.5">{(s.distance).toFixed(2)} km away</div>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-4 pt-4 flex items-center justify-between pointer-events-none">
        <button
          className="pointer-events-auto w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          onClick={() => setLocation('/dashboard')}
          data-testid="map-back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="pointer-events-auto glass-dark border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-foreground">
            {geoLoading ? 'Locating...' : 'Live Location'}
          </span>
        </div>

        <button
          className="pointer-events-auto w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          onClick={() => setShowPanel(p => !p)}
          data-testid="map-toggle-panel"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Floating locate button */}
      <div className="absolute right-4 bottom-[340px] z-10">
        <button
          onClick={handleLocate}
          data-testid="map-locate-btn"
          className="w-12 h-12 rounded-full glass-dark border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <LocateFixed className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Bottom panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="panel"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-10 glass-dark border-t border-white/10 rounded-t-3xl px-4 pt-4 pb-8 space-y-4"
            style={{ maxHeight: '55vh', overflowY: 'auto' }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2" />

            {/* Ambulance ETA (only shown after SOS) */}
            {sosActive && <AmbulanceETA active={sosActive} />}

            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-widest text-foreground">Nearby Services</h2>
              {fetchingServices && (
                <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
              )}
            </div>

            {!geoLoading && !fetchingServices && services.length === 0 && (
              <div className="flex items-center gap-3 text-muted-foreground text-sm glass-dark rounded-2xl border border-border/50 px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                No services found nearby. Try enabling location access.
              </div>
            )}

            {nearest2.length > 0 && (
              <div className="space-y-3">
                {nearest2.map((s, i) => (
                  <NearbyServiceCard
                    key={s.id}
                    service={s}
                    index={i}
                    userLat={lat ?? undefined}
                    userLng={lng ?? undefined}
                  />
                ))}
              </div>
            )}

            {services.length > 2 && (
              <p className="text-xs text-muted-foreground text-center">
                {services.length - 2} more services found in the area
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
