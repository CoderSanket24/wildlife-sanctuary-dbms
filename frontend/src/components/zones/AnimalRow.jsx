import React from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { HEALTH_META } from "../../constants/healthData";

/**
 * A single animal row inside an EnclosureCard.
 * Clicking navigates to the animal detail page (future route).
 *
 * @param {{ animal_id, species, nickname, health_status }} animal
 */
const AnimalRow = ({ animal }) => {
  const h = HEALTH_META[animal.health_status] ?? HEALTH_META.HEALTHY;
  const HealthIcon = h.icon;

  return (
    <Link
      to={`/dashboard/animals/${animal.animal_id}`}
      className="group flex items-center justify-between gap-3 px-4 py-3 transition-all hover:bg-white/[0.025]"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Paw icon + name/species */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center"
          style={{
            background:   "rgba(163,230,53,0.07)",
            borderRadius: "8px",
            color:        "rgba(163,230,53,0.50)",
          }}
        >
          <PawPrint size={13} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold text-white/80">
            {animal.nickname ?? animal.species}
          </p>
          {animal.nickname && (
            <p className="text-[10px] text-white/28 truncate">{animal.species}</p>
          )}
        </div>
      </div>

      {/* Health status badge */}
      <div
        className="flex shrink-0 items-center gap-1.5 px-2.5 py-1"
        style={{
          background:   h.bg,
          border:       `1px solid ${h.color}33`,
          borderRadius: "999px",
          color:        h.color,
        }}
      >
        <HealthIcon size={10} strokeWidth={2} />
        <span className="text-[9px] font-bold uppercase tracking-[0.18em]">{h.label}</span>
      </div>
    </Link>
  );
};

export default AnimalRow;
