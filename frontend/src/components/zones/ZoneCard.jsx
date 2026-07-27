import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, PawPrint, Camera, Waves, ArrowRight } from "lucide-react";
import { CLIMATE_META } from "../../constants/climateData";
import { getZoneImage, ZONE_IMAGES } from "../../constants/zoneImages";

/* ── Small stat chip inside the card ── */
const StatChip = ({ icon: Icon, value, label }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="flex items-center gap-1.5">
      <Icon size={12} style={{ color: "rgba(163,230,53,0.55)" }} />
      <span className="text-sm font-black text-white">{value ?? "—"}</span>
    </div>
    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">{label}</span>
  </div>
);

/**
 * Zone listing card with climate landscape image banner.
 *
 * @param {{ zone_id, name, climate, enclosure_count, total_animals, camera_traps_count, ticket_price }} zone
 */
const ZoneCard = ({ zone }) => {
  const meta        = CLIMATE_META[zone.climate] ?? CLIMATE_META.TROPICAL;
  const ClimateIcon = meta.icon;

  const [imgSrc, setImgSrc] = useState(getZoneImage(zone.climate));

  return (
    <Link
      to={`/dashboard/zones/${zone.zone_id}`}
      className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background:           "linear-gradient(145deg, rgba(13,26,15,0.90) 0%, rgba(9,18,10,0.96) 100%)",
        borderRadius:         "18px",
        border:               "1px solid rgba(163,230,53,0.10)",
        backdropFilter:       "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderRadius: "18px",
          boxShadow:    "0 0 32px 2px rgba(163,230,53,0.12)",
          border:       "1px solid rgba(163,230,53,0.28)",
          zIndex:       10,
        }}
      />

      {/* ── Zone Landscape Image Banner ──────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: "150px" }}>
        <img
          src={imgSrc}
          alt={`${zone.climate} landscape`}
          onError={() => setImgSrc(ZONE_IMAGES.TROPICAL)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay — blends into card */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(9,18,10,0.90) 100%)",
          }}
        />

        {/* Climate badge (top-left on image) */}
        <div className="absolute left-3 top-3">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{
              background:     meta.bg,
              border:         `1px solid ${meta.border}`,
              borderRadius:   "999px",
              color:          meta.color,
              backdropFilter: "blur(8px)",
            }}
          >
            <ClimateIcon size={11} strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-[0.22em]">{meta.label}</span>
          </div>
        </div>

        {/* Zone ID (top-right on image) */}
        <span
          className="absolute right-3 top-3 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          #{zone.zone_id}
        </span>

        {/* Lime accent line at bottom of image */}
        <div
          className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
          style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }}
        />
      </div>

      {/* ── Card Content ─────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col gap-4 p-6">

        {/* Zone name */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
            {zone.name}
          </h2>
          <div className="mt-1.5 flex items-center gap-1.5">
            <MapPin size={11} style={{ color: "rgba(163,230,53,0.50)" }} />
            <span className="text-[10px] font-semibold text-white/30">Sanctuary Zone</span>
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <StatChip icon={Waves}    value={zone.enclosure_count}    label="Enclosures" />
          <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.06)" }} />
          <StatChip icon={PawPrint} value={zone.total_animals}      label="Animals"    />
          <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.06)" }} />
          <StatChip icon={Camera}   value={zone.camera_traps_count} label="Cameras"    />
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

        {/* Ticket price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/25">Entry Price</p>
            <p className="mt-0.5 text-lg font-black text-white">
              ₹{parseFloat(zone.ticket_price).toLocaleString("en-IN")}
              <span className="ml-1 text-[10px] font-semibold text-white/30">/ visit</span>
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300/70 transition-all duration-200 group-hover:text-lime-300"
            style={{
              background:   "rgba(163,230,53,0.06)",
              border:       "1px solid rgba(163,230,53,0.14)",
              borderRadius: "8px",
            }}
          >
            Explore
            <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ZoneCard;
