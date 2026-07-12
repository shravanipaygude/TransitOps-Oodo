import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* Google Maps live tracking — animated markers between fleet waypoints.
   The Maps JS API is loaded once, then vehicles interpolate along a
   polyline route so users see continuous motion. */

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

// Bay Area waypoints used as the operational corridor for the demo fleet.
const HUBS: { name: string; pos: { lat: number; lng: number } }[] = [
  { name: "Central Hub", pos: { lat: 37.7849, lng: -122.4094 } },
  { name: "Harbor Depot", pos: { lat: 37.7325, lng: -122.3660 } },
  { name: "North Yard", pos: { lat: 37.8199, lng: -122.4783 } },
  { name: "South Terminal", pos: { lat: 37.6879, lng: -122.4702 } },
  { name: "East Warehouse", pos: { lat: 37.7749, lng: -122.2280 } },
];

const ROUTES = [
  [0, 2, 1], // Central → North → Harbor
  [0, 4, 1], // Central → East → Harbor
  [0, 3, 4], // Central → South → East
];

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8892b0" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#a3b6d1" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2540" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#243559" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#3a4d7a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050b1a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a4d7a" }] },
];

declare global {
  interface Window {
    google?: typeof google;
    __transitOpsMapReady__?: () => void;
    __transitOpsMapLoading__?: Promise<void>;
  }
}

function loadMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.google?.maps) return Promise.resolve();
  if (window.__transitOpsMapLoading__) return window.__transitOpsMapLoading__;
  window.__transitOpsMapLoading__ = new Promise<void>((resolve, reject) => {
    if (!BROWSER_KEY) { reject(new Error("Missing Google Maps browser key")); return; }
    window.__transitOpsMapReady__ = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDkm32NUvjgVaVn2lWpMB1fViWjUE_BYcY&callback=__transitOpsMapReady__${TRACKING_ID ? `&channel=${TRACKING_ID}` : ""}`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return window.__transitOpsMapLoading__;
}

export function LiveMap({ activeVehicles }: { activeVehicles: { id: string; name: string }[] }) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMapsScript()
      .then(() => {
        if (cancelled || !mapDiv.current || !window.google) return;
        mapRef.current = new window.google.maps.Map(mapDiv.current, {
          center: { lat: 37.77, lng: -122.42 },
          zoom: 11,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: "#0b1220",
          styles: MAP_STYLE as google.maps.MapTypeStyle[],
        });

        // Draw route polylines + hub markers
        ROUTES.forEach((r, i) => {
          const color = ["#22d3ee", "#34d399", "#fbbf24"][i % 3];
          const path = r.map((h) => HUBS[h].pos);
          new window.google.maps.Polyline({
            path, map: mapRef.current!,
            geodesic: true, strokeColor: color, strokeOpacity: 0.9, strokeWeight: 3,
            icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "16px" }],
          });
        });

        HUBS.forEach((h) => {
          new window.google!.maps.Marker({
            position: h.pos, map: mapRef.current!, title: h.name,
            icon: {
              path: window.google!.maps.SymbolPath.CIRCLE,
              scale: 6, fillColor: "#22d3ee", fillOpacity: 1, strokeColor: "#e0f7ff", strokeWeight: 2,
            },
          });
        });

        setReady(true);
      })
      .catch((e: Error) => setError(e.message));
    return () => { cancelled = true; markersRef.current.forEach((m) => m.setMap(null)); markersRef.current = []; };
  }, []);

  // Animate vehicle markers along their assigned route
  useEffect(() => {
    if (!ready || !mapRef.current || !window.google) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const start = performance.now();
    const shown = activeVehicles.slice(0, ROUTES.length);
    const markers = shown.map((v, i) => {
      const color = ["#22d3ee", "#34d399", "#fbbf24"][i % 3];
      return new window.google!.maps.Marker({
        position: HUBS[ROUTES[i][0]].pos,
        map: mapRef.current!,
        title: v.name,
        label: { text: v.name.slice(0, 4), color: "#0b1220", fontWeight: "700", fontSize: "10px" },
        icon: {
          path: window.google!.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6, fillColor: color, fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 1.5,
        },
      });
    });
    markersRef.current = markers;

    let raf = 0;
    const durations = shown.map((_, i) => 20000 + i * 4000);
    const tick = () => {
      const now = performance.now();
      markers.forEach((m, i) => {
        const stops = ROUTES[i].map((h) => HUBS[h].pos);
        const t = ((now - start) % durations[i]) / durations[i];
        const seg = t * (stops.length - 1);
        const idx = Math.floor(seg);
        const localT = seg - idx;
        const a = stops[idx], b = stops[Math.min(idx + 1, stops.length - 1)];
        m.setPosition({
          lat: a.lat + (b.lat - a.lat) * localT,
          lng: a.lng + (b.lng - a.lng) * localT,
        });
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, activeVehicles]);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl glass">
      <div ref={mapDiv} className="absolute inset-0 h-full w-full" />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[color:var(--cyan)] pulse-glow" />
            Initialising Google Maps…
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-xs text-[color:var(--coral)]">
          Map failed to load: {error}
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-xs">
        <span className="h-2 w-2 rounded-full bg-[color:var(--emerald)] pulse-glow" />
        Live Tracking · {activeVehicles.length} on route
      </motion.div>
      <div className="pointer-events-none absolute bottom-4 right-4 flex flex-wrap gap-2 text-[11px]">
        {HUBS.slice(0, 3).map((h) => (
          <span key={h.name} className="rounded-full glass-strong px-2.5 py-1">{h.name}</span>
        ))}
      </div>
    </div>
  );
}
