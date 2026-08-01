import React, { useEffect, useRef, useState } from "react";
import { Server, Wifi, CheckCircle, X } from "lucide-react";

/* ── Render logo SVG (inline, no external dependency) ─────── */
const RenderLogo = () => (
  <svg viewBox="0 0 200 200" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="40" fill="#46E3B7" />
    <path
      d="M60 140V72a8 8 0 0 1 8-8h44a32 32 0 0 1 0 64H60m52-32h28"
      stroke="#0a0a0a"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Animated dots ─────────────────────────────────────────── */
const Dots = () => (
  <span className="inline-flex items-end gap-[3px]">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="block h-1.5 w-1.5 rounded-full bg-lime-400"
        style={{
          animation: "dotBounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </span>
);

/* ── Ping progress bar ─────────────────────────────────────── */
const PingBar = ({ attempt, maxAttempts }) => {
  const pct = Math.min((attempt / maxAttempts) * 100, 95);
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: "linear-gradient(90deg, #a3e635, #46E3B7)" }}
      />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   RenderWakeupModal
   - Shows once per browser session (sessionStorage flag)
   - Pings GET /api/health every 3 s until 200 → auto-closes
   - User can dismiss manually after 3 s
════════════════════════════════════════════════════════════ */
const PING_INTERVAL_MS = 3000;
const MAX_WAIT_MS      = 90000; // 90 s max — Render free tier usually wakes in < 60 s
const SESSION_KEY      = "render_wakeup_shown";

const RenderWakeupModal = () => {
  const [visible,    setVisible]   = useState(false);
  const [status,     setStatus]    = useState("pinging"); // pinging | awake | error
  const [attempt,    setAttempt]   = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);
  const [elapsed,    setElapsed]   = useState(0);

  const intervalRef  = useRef(null);
  const elapsedRef   = useRef(null);
  const startTimeRef = useRef(null);

  /* Derive API base from the same env var axiosInstance uses */
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  /* ── Ping the health endpoint ── */
  const ping = async () => {
    try {
      const res = await fetch(`${apiBase}/health`, {
        method: "GET",
        credentials: "include",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok || res.status === 200 || res.status === 404) {
        // Any real HTTP response means the server is up
        handleAwake();
      }
    } catch {
      // Still sleeping — keep trying
    }
    setAttempt(prev => prev + 1);
  };

  const handleAwake = () => {
    clearInterval(intervalRef.current);
    clearInterval(elapsedRef.current);
    setStatus("awake");
    sessionStorage.setItem(SESSION_KEY, "1");
    // Auto-close after 1.8 s so user sees the success state
    setTimeout(() => setVisible(false), 1800);
  };

  const handleDismiss = () => {
    clearInterval(intervalRef.current);
    clearInterval(elapsedRef.current);
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  };

  /* ── Mount logic ── */
  useEffect(() => {
    // Only show once per browser session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    setVisible(true);
    startTimeRef.current = Date.now();

    // Allow manual dismiss after 3 s
    const dismissTimer = setTimeout(() => setCanDismiss(true), 3000);

    // Elapsed counter (updates every second)
    elapsedRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Ping immediately then repeat
    ping();
    intervalRef.current = setInterval(() => {
      if (Date.now() - startTimeRef.current > MAX_WAIT_MS) {
        clearInterval(intervalRef.current);
        setStatus("error");
        setCanDismiss(true);
        return;
      }
      ping();
    }, PING_INTERVAL_MS);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(intervalRef.current);
      clearInterval(elapsedRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const maxAttempts = MAX_WAIT_MS / PING_INTERVAL_MS;

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.9); opacity: 0.6; }
          50%  { transform: scale(1.2); opacity: 0;   }
          100% { transform: scale(0.9); opacity: 0;   }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(5,10,6,0.82)", backdropFilter: "blur(12px)" }}
      >
        {/* ── Modal card ── */}
        <div
          style={{
            background:   "linear-gradient(145deg, rgba(13,26,15,0.98) 0%, rgba(9,18,10,0.99) 100%)",
            borderRadius: "28px",
            border:       "1px solid rgba(163,230,53,0.14)",
            boxShadow:    "0 0 80px rgba(163,230,53,0.06), 0 32px 64px rgba(0,0,0,0.6)",
            width:        "100%",
            maxWidth:     "440px",
            animation:    "modalIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {/* Top accent line */}
          <div
            className="h-0.5 w-full rounded-t-[28px]"
            style={{ background: "linear-gradient(90deg, transparent, #a3e635 40%, #46E3B7 70%, transparent)" }}
          />

          <div className="flex flex-col gap-7 p-8">

            {/* ── Header row ── */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Pulsing server icon */}
                <div className="relative">
                  {status === "pinging" && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(70,227,183,0.35)",
                        animation: "pulseRing 1.6s ease-out infinite",
                      }}
                    />
                  )}
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background: status === "awake"
                        ? "rgba(163,230,53,0.12)"
                        : "rgba(70,227,183,0.08)",
                      border: `1px solid ${status === "awake" ? "rgba(163,230,53,0.30)" : "rgba(70,227,183,0.20)"}`,
                    }}
                  >
                    {status === "awake"
                      ? <CheckCircle size={22} style={{ color: "#a3e635" }} />
                      : <Server size={20} style={{ color: "#46E3B7" }} />
                    }
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <RenderLogo />
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/30">
                      Render · Free Tier
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/20">Backend hosting</p>
                </div>
              </div>

              {/* Manual dismiss (only after 3 s) */}
              {canDismiss && status !== "awake" && (
                <button
                  onClick={handleDismiss}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white/20 transition hover:bg-white/5 hover:text-white/50"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* ── Status content ── */}
            {status === "awake" ? (
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <CheckCircle size={36} style={{ color: "#a3e635" }} />
                <p className="text-lg font-black uppercase tracking-tight text-white">Server is awake!</p>
                <p className="text-xs text-white/35">Loading your experience…</p>
              </div>
            ) : status === "error" ? (
              <div className="flex flex-col gap-2">
                <p className="text-base font-black uppercase tracking-tight text-white">
                  Taking longer than usual
                </p>
                <p className="text-[13px] leading-6 text-white/45">
                  The server is still waking up. You can wait or dismiss this and the page will load once it's ready.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-base font-black uppercase tracking-tight text-white">
                  Waking up the server <Dots />
                </p>
                <p className="text-[13px] leading-6 text-white/45">
                  This project is hosted on <span className="font-semibold text-white/70">Render's free tier</span>,
                  which spins down after inactivity. The backend is starting up — this usually takes
                  <span className="font-semibold text-white/70"> 30–60 seconds</span>.
                </p>
              </div>
            )}

            {/* ── Progress bar (only while pinging) ── */}
            {status === "pinging" && (
              <div className="flex flex-col gap-2">
                <PingBar attempt={attempt} maxAttempts={maxAttempts} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wifi size={11} style={{ color: "#46E3B7" }} />
                    <span className="text-[10px] font-semibold text-white/25">
                      Pinging server… attempt {attempt}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/20">{elapsed}s</span>
                </div>
              </div>
            )}

            {/* ── Footer note ── */}
            {status === "pinging" && (
              <p className="text-[11px] leading-5 text-white/18">
                This modal will dismiss automatically the moment the server responds.
                {canDismiss && " You can also close it manually using the × above."}
              </p>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default RenderWakeupModal;
