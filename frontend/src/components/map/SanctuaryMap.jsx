import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  Layers,
  Search,
  Radio,
  Eye,
  Crosshair,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  BatteryCharging,
  Wifi,
} from "lucide-react";
import { Link } from "react-router-dom";

// Climate styling configuration
const CLIMATE_BADGES = {
  TROPICAL: { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)" },
  TEMPERATE: { bg: "rgba(132,204,22,0.15)", text: "#84cc16", border: "rgba(132,204,22,0.3)" },
  ARID: { bg: "rgba(249,115,22,0.15)", text: "#f97316", border: "rgba(249,115,22,0.3)" },
  WETLAND: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  ALPINE: { bg: "rgba(6,182,212,0.15)", text: "#06b6d4", border: "rgba(6,182,212,0.3)" },
};

const HEALTH_COLORS = {
  HEALTHY: "#4ade80",
  UNDER_CARE: "#fbbf24",
  CRITICAL: "#f87171",
  QUARANTINED: "#a78bfa",
};

// Create custom animated HTML Marker for Leaflet
const createAnimalMarkerHtml = (sighting, isSelected) => {
  const color = HEALTH_COLORS[sighting.health_status] || "#4ade80";
  const size = isSelected ? 44 : 34;
  const initial = (sighting.nickname?.[0] || sighting.species?.[0] || "A").toUpperCase();

  return `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        inset: -4px;
        border-radius: 9999px;
        background: ${color};
        opacity: ${isSelected ? 0.35 : 0.18};
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 9999px;
        background: #09130a;
        border: 2px solid ${color};
        box-shadow: 0 0 ${isSelected ? "18px" : "10px"} ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-family: monospace;
        font-weight: 900;
        font-size: ${isSelected ? "14px" : "12px"};
      ">
        ${initial}
      </div>
    </div>
  `;
};

const createCameraTrapMarkerHtml = (trap) => {
  const isRec = trap.status === "RECORDING";
  return `
    <div style="
      position: relative;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        inset: -3px;
        border-radius: 9999px;
        background: ${isRec ? "#ef4444" : "#3b82f6"};
        opacity: 0.3;
        animation: pulse 1.5s infinite;
      "></div>
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: ${isRec ? "#ef4444" : "#3b82f6"};
        border: 2px solid #ffffff;
        box-shadow: 0 0 8px ${isRec ? "#ef4444" : "#3b82f6"};
      "></div>
    </div>
  `;
};

export default function SanctuaryMap({ telemetry }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({ zones: null, sightings: null, traps: null });
  const markersMapRef = useRef(new Map());

  const [basemap, setBasemap] = useState("satellite"); // "satellite" | "streets"
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLayer, setFilterLayer] = useState("ALL"); // ALL | ANIMALS | TRAPS | ZONES
  const [healthFilter, setHealthFilter] = useState("ALL");
  const [selectedZoneId, setSelectedZoneId] = useState("ALL");

  const { zones = [], sightings = [], camera_traps = [], center = [11.6681, 76.62] } =
    telemetry || {};

  // Basemap Tile Providers (100% Free, NO API Key Required)
  const TILE_CONFIGS = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      options: {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, NASA, USGS',
        maxZoom: 18,
      },
    },
    streets: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
    },
  };

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initial Satellite Tile Layer
    const initialTile = L.tileLayer(
      TILE_CONFIGS.satellite.url,
      TILE_CONFIGS.satellite.options
    ).addTo(map);
    tileLayerRef.current = initialTile;

    // Create Layer Groups
    const zonesGroup = L.featureGroup().addTo(map);
    const trapsGroup = L.featureGroup().addTo(map);
    const sightingsGroup = L.featureGroup().addTo(map);

    layersRef.current = {
      zones: zonesGroup,
      traps: trapsGroup,
      sightings: sightingsGroup,
    };

    mapInstanceRef.current = map;

    // Trigger resize calculation to ensure all tiles render seamlessly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Layer Switching (Satellite vs Street/Topo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_CONFIGS[basemap] || TILE_CONFIGS.satellite;
    tileLayerRef.current = L.tileLayer(cfg.url, cfg.options).addTo(map);
    
    // Ensure vector features stay on top of basemap
    if (layersRef.current.zones) layersRef.current.zones.bringToFront();
    if (layersRef.current.traps) layersRef.current.traps.bringToFront();
    if (layersRef.current.sightings) layersRef.current.sightings.bringToFront();
  }, [basemap]);

  // Update Layers when Telemetry or Filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { zones: zonesGroup, traps: trapsGroup, sightings: sightingsGroup } =
      layersRef.current;
    if (!zonesGroup || !trapsGroup || !sightingsGroup) return;

    // 1. Render Zones
    zonesGroup.clearLayers();
    if (filterLayer === "ALL" || filterLayer === "ZONES") {
      zones.forEach((z) => {
        const circle = L.circle(z.center, {
          radius: z.radius,
          color: z.color || "#a3e635",
          fillColor: z.fillColor || "#d9f99d",
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "6, 6",
        });

        circle.on("click", () => {
          setSelectedItem({ type: "ZONE", data: z });
          map.flyTo(z.center, 14, { duration: 0.8 });
        });

        circle.bindTooltip(
          `<div style="font-weight: bold; color: #111;">${z.name}</div><div style="font-size: 10px; color: #555;">${z.climate} • ${z.animals_count} Fauna</div>`,
          { permanent: false, direction: "center", className: "sanctuary-zone-tooltip" }
        );

        zonesGroup.addLayer(circle);
      });
    }

    // 2. Render Camera Traps
    trapsGroup.clearLayers();
    if (filterLayer === "ALL" || filterLayer === "TRAPS") {
      camera_traps.forEach((trap) => {
        const icon = L.divIcon({
          className: "trap-custom-icon",
          html: createCameraTrapMarkerHtml(trap),
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([trap.latitude, trap.longitude], { icon });
        marker.on("click", () => {
          setSelectedItem({ type: "TRAP", data: trap });
          map.flyTo([trap.latitude, trap.longitude], 15, { duration: 0.8 });
        });

        trapsGroup.addLayer(marker);
      });
    }

    // 3. Render Wildlife Sightings
    sightingsGroup.clearLayers();
    markersMapRef.current.clear();

    if (filterLayer === "ALL" || filterLayer === "ANIMALS") {
      const filteredSightings = sightings.filter((s) => {
        if (healthFilter !== "ALL" && s.health_status !== healthFilter) return false;
        if (selectedZoneId !== "ALL") {
          const matchedZone = zones.find((z) => z.name === s.zone_name);
          if (matchedZone && String(matchedZone.zone_id) !== String(selectedZoneId)) {
            return false;
          }
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nick = (s.nickname || "").toLowerCase();
          const spec = (s.species || "").toLowerCase();
          return nick.includes(q) || spec.includes(q);
        }
        return true;
      });

      filteredSightings.forEach((s) => {
        const isSelected = selectedItem?.type === "ANIMAL" && selectedItem.data.survey_id === s.survey_id;
        const icon = L.divIcon({
          className: "sighting-custom-icon",
          html: createAnimalMarkerHtml(s, isSelected),
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([s.latitude, s.longitude], { icon });
        marker.on("click", () => {
          setSelectedItem({ type: "ANIMAL", data: s });
          map.flyTo([s.latitude, s.longitude], 16, { duration: 0.8 });
        });

        sightingsGroup.addLayer(marker);
        markersMapRef.current.set(s.survey_id, marker);
      });
    }
  }, [telemetry, filterLayer, healthFilter, selectedZoneId, searchQuery, selectedItem]);

  // Handler to center on specific animal
  const handleSelectAnimal = (s) => {
    setSelectedItem({ type: "ANIMAL", data: s });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([s.latitude, s.longitude], 16, { duration: 1 });
    }
  };

  // Handler to center on specific zone
  const handleSelectZone = (z) => {
    setSelectedItem({ type: "ZONE", data: z });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(z.center, 14, { duration: 1 });
    }
  };

  // Filtered animal list for sidebar
  const visibleSightings = sightings.filter((s) => {
    if (healthFilter !== "ALL" && s.health_status !== healthFilter) return false;
    if (selectedZoneId !== "ALL") {
      const matchedZone = zones.find((z) => z.name === s.zone_name);
      if (matchedZone && String(matchedZone.zone_id) !== String(selectedZoneId)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (s.nickname || "").toLowerCase().includes(q) ||
        (s.species || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="relative flex h-[75vh] min-h-[550px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#060e07] shadow-2xl">
      {/* ── Left Telemetry & Filter Sidebar ── */}
      <div className="relative z-30 flex w-84 shrink-0 flex-col border-r border-white/10 bg-[#08120a]/98 backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              <Compass size={13} /> Field Telemetry
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
              LIVE GPS
            </span>
          </div>
          <h2 className="mt-1 text-base font-black uppercase tracking-tight text-white">
            Sanctuary <span className="text-lime-400">Radar</span>
          </h2>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Search fauna or species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-xs text-white placeholder-white/30 outline-none transition focus:border-lime-400/50"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-2 border-b border-white/10 p-4">
          {/* Layer toggles */}
          <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5">
            {[
              { id: "ALL", label: "All" },
              { id: "ANIMALS", label: "Fauna" },
              { id: "ZONES", label: "Zones" },
              { id: "TRAPS", label: "Sensors" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterLayer(t.id)}
                className={`flex-1 rounded-md py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                  filterLayer === t.id
                    ? "bg-lime-400 text-black shadow"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-white/75 outline-none"
            >
              <option value="ALL" className="bg-[#0b180d]">All Habitats</option>
              {zones.map((z) => (
                <option key={z.zone_id} value={z.zone_id} className="bg-[#0b180d]">
                  {z.name.split(" ")[0]} ({z.climate})
                </option>
              ))}
            </select>

            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-white/75 outline-none"
            >
              <option value="ALL" className="bg-[#0b180d]">All Health</option>
              <option value="HEALTHY" className="bg-[#0b180d]">Healthy</option>
              <option value="UNDER_CARE" className="bg-[#0b180d]">Under Care</option>
              <option value="CRITICAL" className="bg-[#0b180d]">Critical</option>
              <option value="QUARANTINED" className="bg-[#0b180d]">Quarantined</option>
            </select>
          </div>
        </div>

        {/* Fauna List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
          <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
            Detected Telemetry ({visibleSightings.length})
          </div>
          {visibleSightings.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/30">
              No animal sightings match filters.
            </div>
          ) : (
            visibleSightings.map((s) => {
              const isSelected = selectedItem?.type === "ANIMAL" && selectedItem.data.survey_id === s.survey_id;
              const color = HEALTH_COLORS[s.health_status] || "#4ade80";

              return (
                <button
                  key={s.survey_id}
                  onClick={() => handleSelectAnimal(s)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg p-2.5 text-left transition ${
                    isSelected ? "bg-lime-400/10 border border-lime-400/30" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-black text-black"
                      style={{ background: color }}
                    >
                      {(s.nickname?.[0] || s.species?.[0] || "A").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">
                        {s.nickname || s.species}
                      </p>
                      <p className="truncate text-[10px] text-white/40">
                        {s.species} • {s.zone_name.split(" ")[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className="rounded px-1.5 py-0.5 text-[8px] font-black tracking-wider uppercase"
                      style={{
                        background: `${color}1a`,
                        color: color,
                        border: `1px solid ${color}33`,
                      }}
                    >
                      {s.health_status}
                    </span>
                    <span className="mt-0.5 text-[9px] text-white/30">
                      {s.sighting_count} seen
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Quick Metric */}
        <div className="border-t border-white/10 p-3 bg-black/30">
          <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
            <span>Traps: {camera_traps.length} Active</span>
            <span>Zones: {zones.length}</span>
            <span className="text-lime-400">FPS: 60</span>
          </div>
        </div>
      </div>

      {/* ── Main Map Container ── */}
      <div className="relative flex-1 h-full min-w-0 overflow-hidden">
        <div ref={mapContainerRef} className="relative z-0 h-full w-full" />

        {/* Floating Controls: Basemap Toggle & Reset Center */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
          {/* Basemap Switcher */}
          <div className="flex rounded-lg border border-white/10 bg-[#08120a]/95 p-0.5 backdrop-blur-md shadow-xl">
            <button
              type="button"
              onClick={() => setBasemap("satellite")}
              className={`rounded px-2.5 py-1 text-[9px] font-bold uppercase transition ${
                basemap === "satellite"
                  ? "bg-lime-400 text-black shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setBasemap("streets")}
              className={`rounded px-2.5 py-1 text-[9px] font-bold uppercase transition ${
                basemap === "streets"
                  ? "bg-lime-400 text-black shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Topo/Street
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo(center, 13, { duration: 1 });
                setSelectedItem(null);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#08120a]/95 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl backdrop-blur-md transition hover:border-lime-400 hover:text-lime-400"
          >
            <Crosshair size={12} /> Center
          </button>
        </div>

        {/* Floating Habitat Shortcuts Bar */}
        <div className="absolute bottom-4 left-4 z-30 hidden max-w-[calc(100%-250px)] flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#08120a]/90 p-2 backdrop-blur-md lg:flex pointer-events-auto">
          {zones.map((z) => (
            <button
              key={z.zone_id}
              onClick={() => handleSelectZone(z)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/80 transition hover:border-lime-400 hover:text-white"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: z.color || "#a3e635" }}
              />
              {z.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Detail Inspector Drawer / Modal */}
        {selectedItem && (
          <div className="absolute top-4 left-4 z-40 w-80 max-w-[calc(100%-2rem)] rounded-xl border border-white/15 bg-[#09150b]/98 p-5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-left duration-200 pointer-events-auto">
            {selectedItem.type === "ANIMAL" && (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-lime-400 border border-lime-400/20">
                      GPS Tagged Sighting
                    </span>
                    <h3 className="mt-1 text-lg font-black uppercase text-white">
                      {selectedItem.data.nickname}
                    </h3>
                    <p className="text-xs text-white/50">{selectedItem.data.species}</p>
                    {selectedItem.data.scientific_name && (
                      <p className="text-[10px] italic text-white/30">
                        {selectedItem.data.scientific_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-y border-white/10 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Status</span>
                    <span
                      className="font-bold"
                      style={{ color: HEALTH_COLORS[selectedItem.data.health_status] }}
                    >
                      {selectedItem.data.health_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Observed</span>
                    <span className="font-semibold text-white/80">
                      {selectedItem.data.sighting_count} Specimen(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Habitat Zone</span>
                    <span className="font-semibold text-white/80">
                      {selectedItem.data.zone_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Enclosure</span>
                    <span className="font-mono text-white/80">
                      {selectedItem.data.enclosure_code}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>LAT: {selectedItem.data.latitude.toFixed(5)}</span>
                  <span>LNG: {selectedItem.data.longitude.toFixed(5)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/dashboard/animals/${selectedItem.data.animal_id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-400 py-2 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-lime-300"
                  >
                    View Dossier <ArrowRight size={11} />
                  </Link>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-white/60 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {selectedItem.type === "ZONE" && (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border"
                      style={{
                        background: `${selectedItem.data.color}20`,
                        color: selectedItem.data.color,
                        borderColor: `${selectedItem.data.color}40`,
                      }}
                    >
                      {selectedItem.data.climate} Climate
                    </span>
                    <h3 className="mt-1 text-lg font-black uppercase text-white">
                      {selectedItem.data.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <p className="mt-2 text-xs text-white/50 leading-relaxed">
                  {selectedItem.data.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-y border-white/10 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Fauna Count</span>
                    <span className="font-bold text-lime-400">{selectedItem.data.animals_count} Animals</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Safari Pass</span>
                    <span className="font-bold text-white">₹{selectedItem.data.ticket_price}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Camera Traps</span>
                    <span className="font-bold text-white/80">{selectedItem.data.camera_traps_count} Active</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Daily Cap</span>
                    <span className="font-bold text-white/80">{selectedItem.data.max_daily_capacity} Visitors</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/dashboard/zones/${selectedItem.data.zone_id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-400 py-2 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-lime-300"
                  >
                    Zone Details <ArrowRight size={11} />
                  </Link>
                  <Link
                    to="/dashboard/tickets"
                    className="flex items-center justify-center rounded-lg border border-lime-400/40 bg-lime-400/10 px-3 py-2 text-[10px] font-bold text-lime-300 hover:bg-lime-400/20"
                  >
                    Book Safari
                  </Link>
                </div>
              </div>
            )}

            {selectedItem.type === "TRAP" && (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                        selectedItem.data.status === "RECORDING"
                          ? "bg-red-500/20 text-red-400 border-red-500/40"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/40"
                      }`}
                    >
                      {selectedItem.data.status}
                    </span>
                    <h3 className="mt-1 text-lg font-black uppercase text-white">
                      {selectedItem.data.name}
                    </h3>
                    <p className="text-xs text-white/50">{selectedItem.data.zone_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-y border-white/10 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Battery</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <BatteryCharging size={13} /> {selectedItem.data.battery_pct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">WAN Link</span>
                    <span className="font-semibold text-white/80 flex items-center gap-1">
                      <Wifi size={13} /> 4G LTE
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block">Last Motion Ping</span>
                    <span className="font-mono text-[11px] text-white/70">
                      {new Date(selectedItem.data.last_ping).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="mt-4 w-full rounded-lg border border-white/10 py-2 text-[10px] font-bold text-white/60 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
