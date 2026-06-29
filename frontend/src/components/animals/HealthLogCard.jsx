import React from "react";
import { HeartPulse, User, Calendar, ShieldCheck } from "lucide-react";

/**
 * Single health-log entry card on the Animal detail page.
 * @param {{ log_id, logged_at, diagnosis, treatment, require_isolation, veterinarian }} log
 */
const HealthLogCard = ({ log }) => (
  <div
    className="relative overflow-hidden p-4"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.75) 0%, rgba(9,18,10,0.88) 100%)",
      borderRadius: "14px",
      border:       "1px solid rgba(163,230,53,0.08)",
    }}
  >
    {/* Isolation flag */}
    {log.require_isolation && (
      <div
        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5"
        style={{
          background:   "rgba(192,132,252,0.10)",
          border:       "1px solid rgba(192,132,252,0.25)",
          borderRadius: "999px",
          color:        "#c084fc",
        }}
      >
        <ShieldCheck size={9} />
        <span className="text-[8px] font-bold uppercase tracking-[0.18em]">Isolation</span>
      </div>
    )}

    {/* Date + vet */}
    <div className="mb-3 flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Calendar size={11} style={{ color: "rgba(163,230,53,0.45)" }} />
        <span className="text-[10px] text-white/40">
          {new Date(log.logged_at).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
          })}
        </span>
      </div>
      {log.veterinarian && (
        <div className="flex items-center gap-1.5">
          <User size={10} style={{ color: "rgba(163,230,53,0.35)" }} />
          <span className="text-[10px] text-white/35">
            Dr. {log.veterinarian.first_name} {log.veterinarian.last_name}
          </span>
        </div>
      )}
    </div>

    {/* Diagnosis */}
    <div className="mb-2">
      <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white/25">Diagnosis</p>
      <p className="text-[12px] font-semibold text-white/75">{log.diagnosis}</p>
    </div>

    {/* Treatment */}
    <div>
      <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white/25">Treatment</p>
      <p className="text-[12px] text-white/55 leading-relaxed">{log.treatment}</p>
    </div>
  </div>
);

export default HealthLogCard;
