import React from "react";
import { Link } from "react-router-dom";
import { MapPin, PawPrint, Ticket, HeartPulse, Leaf, LayoutGrid } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import DashboardStatCard from "../components/dashboard/DashboardStatCard";
import QuickActionButton from "../components/dashboard/QuickActionButton";
import useDashboardStats from "../hooks/useDashboardStats";
import heroImage from "../assets/image.png";

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
  const { user }                    = useAuth();
  const { stats, loading }          = useDashboardStats();

  /* Build stat card config with live values */
  const statCards = [
    {
      icon:    LayoutGrid,
      label:   "Active Zones",
      value:   stats.active_zones ?? "—",
      to:      "/dashboard/zones",
      variant: "lime",
      loading,
    },
    {
      icon:    PawPrint,
      label:   "Animals Tracked",
      value:   stats.animals_tracked ?? "—",
      to:      "/dashboard/animals",
      variant: "lime",
      loading,
    },
    {
      icon:    Ticket,
      label:   "My Bookings",
      value:   stats.my_bookings ?? "—",
      to:      "/dashboard/tickets",
      variant: "lime",
      loading,
    },
    {
      icon:    HeartPulse,
      label:   "Health Alerts",
      value:   stats.health_alerts ?? "—",
      to:      "/dashboard/animals",
      variant: "amber",
      loading,
    },
  ];

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
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(6,14,7,0.30) 0%, rgba(6,14,7,0) 30%, rgba(6,14,7,0) 55%, rgba(6,14,7,1) 100%)" }}
        />
        {/* Radial lime glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 12% 50%, rgba(122,160,40,0.20) 0%, transparent 50%)" }}
        />
        {PARTICLES.map((p, i) => <Particle key={i} style={p} />)}

        <div className="relative px-6 pb-20 pt-12 md:px-10 xl:px-16">
          <div className="mb-4 flex items-center gap-3">
            <Leaf size={13} className="text-lime-300/55" />
            <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-lime-300/55">
              Abhayarnya Wildlife Sanctuary
            </p>
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
            <Link
              to="/dashboard/zones"
              className="flex items-center gap-2 border border-lime-400/60 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-lime-400 hover:text-black"
              style={{ borderRadius: "6px" }}
            >
              <MapPin size={12} /> Explore Zones
            </Link>
            <Link
              to="/dashboard/animals"
              className="flex items-center gap-2 border border-white/12 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/45 transition-all hover:border-white/30 hover:text-white/75"
              style={{ borderRadius: "6px" }}
            >
              <PawPrint size={12} /> View Animals
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <section className="px-6 pt-8 pb-2 md:px-10 xl:px-16">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(s => (
            <DashboardStatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className="px-6 py-8 md:px-10 xl:px-16">
        <p className="mb-5 text-xl font-black uppercase tracking-tight text-white">
          Quick Actions
        </p>
        <div
          className="overflow-hidden p-5"
          style={{
            background:   "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)",
            borderRadius: "18px",
            border:       "1px solid rgba(163,230,53,0.10)",
          }}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map(a => (
              <QuickActionButton key={a.label} {...a} />
            ))}
          </div>
        </div>
      </section>

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
