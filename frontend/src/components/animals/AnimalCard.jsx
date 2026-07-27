import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, MapPin, Microscope, ArrowRight } from "lucide-react";
import { HEALTH_META } from "../../constants/healthData";
import { CLIMATE_META } from "../../constants/climateData";
import { getAnimalImage, FALLBACK_ANIMAL_IMAGE } from "../../constants/animalImages";

/**
 * Animal listing card with species image banner.
 * @param {{ animal_id, species, nickname, scientific_name, health_status,
 *           date_joined, enclosure, _count }} animal
 */
const AnimalCard = ({ animal }) => {
  const health      = HEALTH_META[animal.health_status] ?? HEALTH_META.HEALTHY;
  const HealthIcon  = health.icon;
  const climate     = animal.enclosure?.zone?.climate;
  const climateMeta = climate ? CLIMATE_META[climate] : null;

  const [imgSrc, setImgSrc] = useState(getAnimalImage(animal.species));

  return (
    <Link
      to={`/dashboard/animals/${animal.animal_id}`}
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
          boxShadow:    `0 0 32px 2px ${health.color}22`,
          border:       `1px solid ${health.color}44`,
          zIndex:       10,
        }}
      />

      {/* ── Image Banner ─────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: "155px" }}>
        <img
          src={imgSrc}
          alt={animal.species}
          onError={() => setImgSrc(FALLBACK_ANIMAL_IMAGE)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay — blends image into card background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(9,18,10,0.92) 100%)",
          }}
        />

        {/* Health badge (top-left on image) */}
        <div className="absolute left-3 top-3">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{
              background:   health.bg,
              border:       `1px solid ${health.color}44`,
              borderRadius: "999px",
              color:        health.color,
              backdropFilter: "blur(8px)",
            }}
          >
            <HealthIcon size={10} strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{health.label}</span>
          </div>
        </div>

        {/* Animal ID (top-right on image) */}
        <span
          className="absolute right-3 top-3 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          #{animal.animal_id}
        </span>

        {/* Health accent line at bottom of image */}
        <div
          className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
          style={{ background: `linear-gradient(90deg, ${health.color}, transparent)` }}
        />
      </div>

      {/* ── Card Content ─────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col gap-3 p-5">

        {/* Species name + nickname */}
        <div>
          <p className="truncate text-base font-black uppercase tracking-tight text-white">
            {animal.nickname ?? animal.species}
          </p>
          {animal.nickname && (
            <p className="truncate text-[10px] text-white/35">{animal.species}</p>
          )}
        </div>

        {/* Scientific name */}
        {animal.scientific_name && (
          <div className="flex items-center gap-1.5">
            <Microscope size={10} style={{ color: "rgba(163,230,53,0.40)", flexShrink: 0 }} />
            <span className="truncate text-[10px] italic text-white/30">{animal.scientific_name}</span>
          </div>
        )}

        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

        {/* Zone / enclosure */}
        <div className="flex items-center gap-1.5">
          <MapPin size={10} style={{ color: "rgba(163,230,53,0.45)", flexShrink: 0 }} />
          {animal.enclosure ? (
            <span className="truncate text-[10px] text-white/35">
              {animal.enclosure.zone?.name ?? "—"}
              <span className="mx-1 text-white/15">·</span>
              {animal.enclosure.code_name}
            </span>
          ) : (
            <span className="text-[10px] text-white/20">Unassigned</span>
          )}
        </div>

        {/* Climate pill */}
        {climateMeta && (
          <div
            className="self-start flex items-center gap-1.5 px-2 py-0.5"
            style={{
              background:   climateMeta.bg,
              border:       `1px solid ${climateMeta.border}`,
              borderRadius: "999px",
              color:        climateMeta.color,
            }}
          >
            <climateMeta.icon size={9} strokeWidth={2} />
            <span className="text-[8px] font-bold uppercase tracking-[0.18em]">{climateMeta.label}</span>
          </div>
        )}

        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

        {/* Footer: stats + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[9px] text-white/22 uppercase tracking-[0.18em]">Surveys</p>
              <p className="text-sm font-black text-white">{animal._count?.surveys ?? 0}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/22 uppercase tracking-[0.18em]">Health Logs</p>
              <p className="text-sm font-black text-white">{animal._count?.health_logs ?? 0}</p>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lime-300/60 transition-all group-hover:text-lime-300"
            style={{
              background:   "rgba(163,230,53,0.06)",
              border:       "1px solid rgba(163,230,53,0.13)",
              borderRadius: "8px",
            }}
          >
            View
            <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimalCard;
