import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { HEALTH_META } from "../../constants/healthData";

/* ── Single filter pill ── */
const FilterPill = ({ label, active, color, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-150"
    style={{
      background:   active ? `${color ?? "#a3e635"}20` : "rgba(255,255,255,0.03)",
      border:       active ? `1px solid ${color ?? "#a3e635"}55` : "1px solid rgba(255,255,255,0.07)",
      borderRadius: "999px",
      color:        active ? (color ?? "#a3e635") : "rgba(255,255,255,0.35)",
    }}
  >
    {label}
  </button>
);

/**
 * Search input + health-status filter pills for the Animals listing page.
 *
 * @param {string}   search      - Current search text.
 * @param {Function} onSearch    - Callback for search change.
 * @param {string}   status      - Active health filter ("ALL" | "HEALTHY" | …).
 * @param {Function} onStatus    - Callback for status filter change.
 */
const AnimalFilterBar = ({ search, onSearch, status, onStatus }) => {
  const statusOptions = ["ALL", ...Object.keys(HEALTH_META)];

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{
          background:   "rgba(13,26,15,0.80)",
          border:       "1px solid rgba(163,230,53,0.10)",
          borderRadius: "10px",
          width:        "100%",
          maxWidth:     "320px",
        }}
      >
        <Search size={14} style={{ color: "rgba(163,230,53,0.40)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search species, name…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
        />
      </div>

      {/* Health status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
        {statusOptions.map(opt => {
          const meta = opt === "ALL" ? null : HEALTH_META[opt];
          return (
            <FilterPill
              key={opt}
              label={opt === "ALL" ? "All Status" : meta.label}
              active={status === opt}
              color={meta?.color}
              onClick={() => onStatus(opt)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AnimalFilterBar;
