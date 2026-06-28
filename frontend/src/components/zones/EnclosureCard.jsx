import React from "react";
import { Layers, PawPrint } from "lucide-react";
import AnimalRow from "./AnimalRow";

/**
 * Card displaying a single enclosure: header, capacity bar, and animal list.
 *
 * @param {{ enclosure_id, code_name, max_capacity, current_occupancy, animals[] }} enclosure
 */
const EnclosureCard = ({ enclosure }) => {
  const pct = enclosure.max_capacity > 0
    ? Math.round((enclosure.current_occupancy / enclosure.max_capacity) * 100)
    : 0;

  /* Green → Amber → Red based on fill percentage */
  const barColor = pct >= 90 ? "#f87171" : pct >= 60 ? "#fbbf24" : "#a3e635";

  return (
    <div
      className="overflow-hidden"
      style={{
        background:   "linear-gradient(145deg, rgba(13,26,15,0.80) 0%, rgba(9,18,10,0.90) 100%)",
        borderRadius: "16px",
        border:       "1px solid rgba(163,230,53,0.09)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center"
            style={{
              background:   "rgba(163,230,53,0.08)",
              border:       "1px solid rgba(163,230,53,0.15)",
              borderRadius: "8px",
              color:        "#a3e635",
            }}
          >
            <Layers size={14} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[12px] font-black uppercase tracking-wide text-white">
              {enclosure.code_name}
            </p>
            <p className="text-[9px] text-white/28">Enclosure #{enclosure.enclosure_id}</p>
          </div>
        </div>

        {/* Occupancy badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1"
          style={{
            background:   "rgba(163,230,53,0.06)",
            border:       "1px solid rgba(163,230,53,0.13)",
            borderRadius: "999px",
          }}
        >
          <PawPrint size={10} style={{ color: "rgba(163,230,53,0.55)" }} />
          <span className="text-[9px] font-bold text-white/50">
            {enclosure.current_occupancy} / {enclosure.max_capacity}
          </span>
        </div>
      </div>

      {/* ── Capacity bar ── */}
      <div className="px-5 py-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/22">Capacity</span>
          <span className="text-[9px] font-bold" style={{ color: barColor }}>{pct}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)", borderRadius: "999px" }}
        >
          <div
            className="h-full transition-all duration-700"
            style={{
              width:        `${pct}%`,
              background:   `linear-gradient(90deg, ${barColor}, ${barColor}99)`,
              borderRadius: "999px",
            }}
          />
        </div>
      </div>

      {/* ── Animal list ── */}
      {enclosure.animals.length > 0 ? (
        <div>
          {enclosure.animals.map(a => (
            <AnimalRow key={a.animal_id} animal={a} />
          ))}
        </div>
      ) : (
        <div className="px-5 py-4">
          <p className="text-[11px] text-white/20">No animals currently in this enclosure.</p>
        </div>
      )}
    </div>
  );
};

export default EnclosureCard;
