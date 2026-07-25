import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, PawPrint, Ticket, HeartPulse, Leaf, LayoutGrid, AlertTriangle, Clock, IndianRupee } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import DashboardStatCard from "../components/dashboard/DashboardStatCard";
import QuickActionButton from "../components/dashboard/QuickActionButton";
import useDashboardStats from "../hooks/useDashboardStats";
import heroImage from "../assets/image.png";
import api from "../api/axiosInstance";

/* ── Floating particle dot ── */
const Particle = ({ style }) => (
  <div
    className="pointer-events-none absolute rounded-full"
    style={{
      width:      "3px",
      height:     "3px",
      background: "rgba(163,230,53,0.55)",
      boxShadow:  "0 0 6px 2px rgba(163,230,53,0.25)",
      animation:  "floatUp 6s ease-in-out infinite",
      ...style,
    }}
  />
);

const PARTICLES = [
  { left: "10%", top: "70%", animationDuration: "5.5s", animationDelay: "0s"   },
  { left: "25%", top: "75%", animationDuration: "7s",   animationDelay: "1.2s" },
  { left: "52%", top: "65%", animationDuration: "6.2s", animationDelay: "0.6s" },
  { left: "70%", top: "78%", animationDuration: "8s",   animationDelay: "2s"   },
  { left: "86%", top: "60%", animationDuration: "5s",   animationDelay: "0.3s" },
];

const QUICK_ACTIONS = [
  { icon: MapPin,      label: "Explore Map",     to: "/dashboard/zones"   },
  { icon: PawPrint,    label: "View Animals",    to: "/dashboard/animals" },
  { icon: Ticket,      label: "Book Safari",     to: "/dashboard/tickets" },
  { icon: HeartPulse,  label: "Health Alerts",   to: "/dashboard/animals" },
];

/* ════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════ */
const Dashboard = () => {
  const { user }           = useAuth();
  const { stats, loading } = useDashboardStats();
  const [recentTickets, setRecentTickets] = useState([]);
  const [alerts, setAlerts]               = useState([]);
  const [dataLoading, setDataLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/tickets/my"),
      api.get("/dashboard/alerts"),
    ])
      .then(([ticketRes, alertRes]) => {
        setRecentTickets((ticketRes.data.tickets ?? []).slice(0, 3));
        setAlerts(alertRes.data.alerts ?? []);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  /* Build stat card config with live values */
  const statCards = [
    { icon: LayoutGrid, label: "Active Zones",    value: stats.active_zones    ?? "—", to: "/dashboard/zones",   variant: "lime",  loading },
    { icon: PawPrint,   label: "Animals Tracked", value: stats.animals_tracked ?? "—", to: "/dashboard/animals", variant: "lime",  loading },
    { icon: Ticket,     label: "My Bookings",     value: stats.my_bookings     ?? "—", to: "/dashboard/tickets", variant: "lime",  loading },
    { icon: HeartPulse, label: "Health Alerts",   value: stats.health_alerts   ?? "—", to: "/dashboard/animals", variant: "amber", loading },
  ];

  /* Health status colour map */
  const statusColor = { CRITICAL: "#f87171", UNDER_CARE: "#fbbf24", HEALTHY: "#4ade80", QUARANTINED: "#818cf8" };

  return (
    <DashboardLayout>

      {/* ── Hero banner ── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(6,14,7,0.88) 0%, rgba(6,14,7,0.40) 50%, rgba(6,14,7,0.88) 100%),
            url(${heroImage})
          `,
          backgroundSize:     "cover",
          backgroundPosition: "center 30%",
          minHeight:          "320px",
        }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,14,7,0.30) 0%, rgba(6,14,7,0) 30%, rgba(6,14,7,0) 55%, rgba(6,14,7,1) 100%)" }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 12% 50%, rgba(122,160,40,0.20) 0%, transparent 50%)" }} />
        {PARTICLES.map((p, i) => <Particle key={i} style={p} />)}

        <div className="relative px-6 pb-20 pt-12 md:px-10 xl:px-16">
          <div className="mb-4 flex items-center gap-3">
            <Leaf size={13} className="text-lime-300/55" />
            <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-lime-300/55">Abhayarnya Wildlife Sanctuary</p>
          </div>
          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl xl:text-7xl">
            Welcome back,{" "}
            <span style={{ color: "#a3e635", textShadow: "0 0 48px rgba(163,230,53,0.40)" }}>
              {user?.first_name ?? "Visitor"}
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-sm text-white/30 leading-relaxed">
            Your gateway to the sanctuary — explore zones, track wildlife, and manage your visits all in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard/zones"   className="flex items-center gap-2 border border-lime-400/60 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-lime-400 hover:text-black" style={{ borderRadius: "6px" }}>
              <MapPin size={12} /> Explore Zones
            </Link>
            <Link to="/dashboard/animals" className="flex items-center gap-2 border border-white/12 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/45 transition-all hover:border-white/30 hover:text-white/75" style={{ borderRadius: "6px" }}>
              <PawPrint size={12} /> View Animals
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <section className="px-6 pt-8 pb-2 md:px-10 xl:px-16">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(s => <DashboardStatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className="px-6 py-8 md:px-10 xl:px-16">
        <p className="mb-5 text-xl font-black uppercase tracking-tight text-white">Quick Actions</p>
        <div className="overflow-hidden p-5" style={{ background: "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.10)" }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map(a => <QuickActionButton key={a.label} {...a} />)}
          </div>
        </div>
      </section>

      {/* ── Recent Bookings ── */}
      <section className="px-6 pb-8 md:px-10 xl:px-16">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xl font-black uppercase tracking-tight text-white">Recent Bookings</p>
          <Link to="/dashboard/tickets" className="text-[10px] font-bold uppercase tracking-[0.25em] text-lime-300/50 transition hover:text-lime-300">
            View All →
          </Link>
        </div>
        <div
          className="overflow-hidden"
          style={{ background: "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.10)" }}
        >
          {dataLoading ? (
            <div className="flex flex-col gap-3 p-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 animate-pulse" style={{ background: "rgba(163,230,53,0.04)", borderRadius: "10px" }} />
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Ticket size={28} style={{ color: "rgba(163,230,53,0.18)" }} />
              <p className="text-sm font-semibold text-white/20">No bookings yet</p>
              <Link to="/dashboard/tickets" className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-300/40 transition hover:text-lime-300">
                Book your first safari →
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ "--tw-divide-opacity": 1, borderColor: "rgba(255,255,255,0.04)" }}>
              {recentTickets.map(t => (
                <div key={String(t.ticket_id)} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center" style={{ background: "rgba(163,230,53,0.07)", border: "1px solid rgba(163,230,53,0.14)", borderRadius: "10px" }}>
                      <Ticket size={14} style={{ color: "#a3e635" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-white/80">{t.zone?.name ?? "Unknown Zone"}</p>
                      <p className="flex items-center gap-1 text-[10px] text-white/30">
                        <Clock size={9} />
                        {new Date(t.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <IndianRupee size={11} style={{ color: "#a3e635" }} />
                    <span className="text-sm font-black text-white/70">{parseFloat(t.total_amount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Health Alerts Panel ── */}
      {(dataLoading || alerts.length > 0) && (
        <section className="px-6 pb-10 md:px-10 xl:px-16">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xl font-black uppercase tracking-tight text-white">
              Health Alerts
              {alerts.length > 0 && (
                <span className="ml-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-black" style={{ background: "rgba(248,113,113,0.14)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                  {alerts.length}
                </span>
              )}
            </p>
            <Link to="/dashboard/animals" className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 transition hover:text-white/60">
              All Animals →
            </Link>
          </div>
          <div style={{ background: "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(248,113,113,0.10)" }}>
            {dataLoading ? (
              <div className="flex flex-col gap-3 p-5">
                {[1, 2].map(i => <div key={i} className="h-14 animate-pulse" style={{ background: "rgba(248,113,113,0.04)", borderRadius: "10px" }} />)}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {alerts.slice(0, 5).map(a => {
                  const col = statusColor[a.health_status] ?? "#a3e635";
                  return (
                    <div key={a.animal_id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center" style={{ background: `${col}12`, border: `1px solid ${col}28`, borderRadius: "10px" }}>
                        <AlertTriangle size={14} style={{ color: col }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-bold text-white/80">
                          {a.nickname ? `${a.nickname} (${a.species})` : a.species}
                        </p>
                        <p className="text-[10px] text-white/30">{a.enclosure_name} · {a.zone_name}</p>
                      </div>
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]"
                        style={{ background: `${col}14`, color: col, border: `1px solid ${col}28` }}>
                        {a.health_status?.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
                {alerts.length > 5 && (
                  <div className="px-5 py-3 text-center">
                    <Link to="/dashboard/animals" className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/25 transition hover:text-white/50">
                      +{alerts.length - 5} more animals →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Float animation keyframes */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px)   scale(1);   opacity: 0.6; }
          50%  { transform: translateY(-28px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(-56px) scale(0.8); opacity: 0;   }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;
