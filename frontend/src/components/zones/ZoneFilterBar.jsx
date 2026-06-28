import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CLIMATE_META } from "../../constants/climateData";

/* ── Single filter pill ── */
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] transition-all duration-150"
    style={{
      background:   active ? "rgba(163,230,53,0.12)" : "rgba(255,255,255,0.03)",
      border:       active ? "1px solid rgba(163,230,53,0.40)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: "999px",
      color:        active ? "#a3e635" : "rgba(255,255,255,0.35)",
    }}
  >
    {label}
  </button>
);

/**
 * Search input + climate filter pill row for the Zones listing page.
 *
 * @param {string}   search       - Current search text value.
 * @param {Function} onSearch     - Callback receiving the new search string.
 * @param {string}   climate      - Currently active climate filter (e.g. "ALL" | "TROPICAL").
 * @param {Function} onClimate    - Callback receiving the new climate selection.
 */
const ZoneFilterBar = ({ search, onSearch, climate, onClimate }) => {
  const climateOptions = ["ALL", ...Object.keys(CLIMATE_META)];

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search input */}
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
          placeholder="Search zones…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
        />
      </div>

      {/* Climate filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
        {climateOptions.map(opt => (
          <FilterPill
            key={opt}
            label={opt === "ALL" ? "All Climates" : (CLIMATE_META[opt]?.label ?? opt)}
            active={climate === opt}
            onClick={() => onClimate(opt)}
          />
        ))}
      </div>
    </div>
  );
};

export default ZoneFilterBar;
