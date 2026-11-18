import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SanctuaryMap from "../components/map/SanctuaryMap";
import api from "../api/axiosInstance";
import { Compass, RefreshCw, Radio, Shield, MapPin, Eye, AlertCircle } from "lucide-react";

export default function SanctuaryMapPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTelemetry = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/fauna/telemetry");
      if (res.data?.success) {
        setTelemetry(res.data.telemetry);
        setError(null);
      } else {
        setError(res.data?.error || "Failed to load telemetry");
      }
    } catch (err) {
      console.error("Telemetry load failed:", err);
      setError("Unable to connect to field telemetry server. Please ensure backend is active.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <DashboardLayout>
      <div className="relative z-10 mx-auto max-w-screen-2xl px-5 py-6 md:px-10">
        {/* Top Header */}
        <div className="relative z-20 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                <Compass size={12} /> Unit II / Geospatial DBMS
              </span>
              <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                <Radio size={11} className="animate-pulse" /> Active Telemetry
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              Interactive Sanctuary <span className="text-lime-400">GIS Radar</span>
            </h1>
            <p className="mt-1 text-xs text-white/40">
              Live GPS tracking of sanctuary fauna, climate habitats, and field camera trap sensor nodes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTelemetry}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:border-lime-400/50 hover:bg-lime-400/10 hover:text-lime-300 disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin text-lime-400" : ""} />
              {refreshing ? "Polling Sensors..." : "Sync Radar"}
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        {telemetry && (
          <div className="relative z-20 mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#09150b]/80 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">
                Tracked Habitats
              </span>
              <span className="mt-1 text-xl font-black text-white">
                {telemetry.total_zones} <span className="text-xs font-normal text-lime-400">Zones</span>
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#09150b]/80 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">
                Active GPS Telemetry
              </span>
              <span className="mt-1 text-xl font-black text-white">
                {telemetry.total_sightings} <span className="text-xs font-normal text-emerald-400">Beacons</span>
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#09150b]/80 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">
                Camera Trap Mesh
              </span>
              <span className="mt-1 text-xl font-black text-white">
                {telemetry.total_camera_traps} <span className="text-xs font-normal text-cyan-400">Sensors</span>
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#09150b]/80 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">
                Coverage Grid
              </span>
              <span className="mt-1 text-xl font-black text-white font-mono">
                11.668°N, 76.620°E
              </span>
            </div>
          </div>
        )}

        {/* Main Interactive Map Canvas */}
        {loading ? (
          <div className="flex h-[75vh] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#060e07]">
            <RefreshCw size={32} className="animate-spin text-lime-400" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/50">
              Initializing Spatial Leaflet Canvas & Loading Telemetry...
            </p>
          </div>
        ) : error ? (
          <div className="flex h-[75vh] w-full flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <AlertCircle size={40} className="text-red-400" />
            <p className="mt-3 text-sm font-bold text-red-400">{error}</p>
            <button
              onClick={fetchTelemetry}
              className="mt-4 rounded-lg bg-red-400/20 px-4 py-2 text-xs font-bold uppercase text-red-300 hover:bg-red-400/30"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <SanctuaryMap telemetry={telemetry} />
        )}
      </div>
    </DashboardLayout>
  );
}
