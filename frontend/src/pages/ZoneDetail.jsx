import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, PawPrint, Camera, ArrowLeft, Layers, Ticket, Waves } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import EmptyState from "../components/ui/EmptyState";
import EnclosureCard from "../components/zones/EnclosureCard";
import { CLIMATE_META } from "../constants/climateData";
import api from "../api/axiosInstance";

/* ── Compact stat card used in the detail header row ── */
const ZoneStatCard = ({ icon: Icon, label, value, color }) => (
  <div
    className="flex flex-1 flex-col gap-3 p-5"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)",
      borderRadius: "16px",
      border:       "1px solid rgba(163,230,53,0.09)",
    }}
  >
    <div
      className="flex h-9 w-9 items-center justify-center"
      style={{
        background:   "rgba(163,230,53,0.07)",
        border:       "1px solid rgba(163,230,53,0.13)",
        borderRadius: "10px",
        color:        color ?? "#a3e635",
      }}
    >
      <Icon size={16} strokeWidth={1.8} />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value ?? "—"}</p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/28">{label}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════
   ZONE DETAIL PAGE
════════════════════════════════════════ */
const ZoneDetail = () => {
  const { id } = useParams();
  const [zone, setZone]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchZone = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/zones/${id}`);
        setZone(res.data.zone);
      } catch (err) {
        setError(err.response?.data?.error ?? "Failed to load zone.");
      } finally {
        setLoading(false);
      }
    };
    fetchZone();
  }, [id]);

  if (loading) {
    return <DashboardLayout><LoadingSpinner label="Loading zone…" /></DashboardLayout>;
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="px-6 py-10 md:px-10 xl:px-16">
          <BackLink />
          <ErrorAlert message={error} />
        </div>
      </DashboardLayout>
    );
  }

  const meta         = CLIMATE_META[zone.climate] ?? CLIMATE_META.TROPICAL;
  const ClimateIcon  = meta.icon;
  const totalAnimals = zone.enclosures.reduce((s, e) => s + e.animals.length, 0);
  const totalCapacity = zone.enclosures.reduce((s, e) => s + e.max_capacity, 0);

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        <BackLink />

        {/* ── Zone hero header card ── */}
        <div
          className="relative mb-8 overflow-hidden p-8"
          style={{
            background:   "linear-gradient(135deg, rgba(13,26,15,0.95) 0%, rgba(9,18,10,0.98) 100%)",
            borderRadius: "20px",
            border:       "1px solid rgba(163,230,53,0.10)",
          }}
        >
          {/* Paw watermark */}
          <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute -bottom-6 -right-6 h-44 w-44"
            fill="rgba(163,230,53,0.035)"
          >
            <ellipse cx="50" cy="72" rx="18" ry="14" />
            <ellipse cx="27" cy="52" rx="10" ry="13" />
            <ellipse cx="73" cy="52" rx="10" ry="13" />
            <ellipse cx="37" cy="35" rx="9"  ry="11" />
            <ellipse cx="63" cy="35" rx="9"  ry="11" />
          </svg>

          {/* Top climate-coloured bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background:   `linear-gradient(90deg, ${meta.color}, rgba(163,230,53,0.15), transparent)`,
              borderRadius: "20px 20px 0 0",
            }}
          />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              {/* Climate badge */}
              <div
                className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5"
                style={{
                  background:   meta.bg,
                  border:       `1px solid ${meta.border}`,
                  borderRadius: "999px",
                  color:        meta.color,
                }}
              >
                <ClimateIcon size={12} strokeWidth={2} />
                <span className="text-[9px] font-bold uppercase tracking-[0.25em]">{meta.label} Zone</span>
              </div>

              <h1 className="text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
                {zone.name}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <MapPin size={12} style={{ color: "rgba(163,230,53,0.50)" }} />
                <span className="text-[10px] font-semibold text-white/30">
                  Zone #{zone.zone_id} · Abhayarnya Wildlife Sanctuary
                </span>
              </div>
            </div>

            {/* Ticket price + book CTA */}
            <div className="flex flex-col items-start gap-3 md:items-end shrink-0">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25">Entry Ticket</p>
                <p className="text-3xl font-black text-white">
                  ₹{parseFloat(zone.ticket_price).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-white/28">per visit · + GST</p>
              </div>
              <Link
                to="/dashboard/zones"
                className="flex items-center gap-2 border border-lime-400/60 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-lime-400 hover:text-black"
                style={{ borderRadius: "8px" }}
              >
                <Ticket size={12} />
                Book a Visit
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="mb-8 flex flex-wrap gap-4">
          <ZoneStatCard icon={Waves}    label="Enclosures"     value={zone.enclosures.length} />
          <ZoneStatCard icon={PawPrint} label="Animals"        value={totalAnimals} />
          <ZoneStatCard icon={Camera}   label="Camera Traps"   value={zone.camera_traps_count} />
          <ZoneStatCard icon={Layers}   label="Total Capacity" value={totalCapacity} />
          <ZoneStatCard icon={Ticket}   label="Tickets Sold"   value={zone._count?.tickets ?? 0} color="#fbbf24" />
        </div>

        {/* ── Enclosures ── */}
        <div>
          <p className="mb-5 text-xl font-black uppercase tracking-tight text-white">
            Enclosures
            <span className="ml-3 text-base font-semibold text-white/25">({zone.enclosures.length})</span>
          </p>

          {zone.enclosures.length === 0 ? (
            <EmptyState
              icon={Layers}
              heading="No enclosures yet"
              subtext="This zone has no enclosures configured."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {zone.enclosures.map(enc => (
                <EnclosureCard key={enc.enclosure_id} enclosure={enc} />
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

/* ── Shared back-link ── */
const BackLink = () => (
  <Link
    to="/dashboard/zones"
    className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 transition hover:text-lime-300/70"
  >
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current strokeWidth-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    All Zones
  </Link>
);

export default ZoneDetail;
