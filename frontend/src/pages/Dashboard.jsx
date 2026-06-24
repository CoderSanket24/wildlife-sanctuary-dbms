import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  PawPrint,
  Ticket,
  HeartPulse,
  ArrowRight,
  Leaf,
  Shield,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import heroImage from "../assets/image.png";

/* ══════════════════════════════════════════
   FLOATING PARTICLE (animated lime dot)
══════════════════════════════════════════ */
const Particle = ({ style }) => (
  <div
    className="pointer-events-none absolute rounded-full"
    style={{
      width: "3px",
      height: "3px",
      background: "rgba(163,230,53,0.55)",
      boxShadow: "0 0 6px 2px rgba(163,230,53,0.25)",
      animation: "floatUp 6s ease-in-out infinite",
      ...style,
    }}
  />
);

/* ══════════════════════════════════════════
   STAT CARD  — matches the mockup style:
   • large rounded corners
   • dark forest-green glassmorphism bg
   • leaf + paw SVG watermarks (bottom-right)
   • glowing border (lime or amber)
   • icon in rounded square chip
   • big number + label
══════════════════════════════════════════ */
const StatCard = ({ icon: Icon, label, value, to, variant = "lime" }) => {
  const isAmber = variant === "amber";

  /* colour tokens per variant */
  const tokens = isAmber
    ? {
        bg: "linear-gradient(145deg, rgba(30,20,5,0.92) 0%, rgba(20,14,4,0.97) 100%)",
        border: "rgba(212,168,83,0.55)",
        glow: "rgba(212,168,83,0.30)",
        iconBg: "rgba(212,168,83,0.15)",
        iconColor: "#d4a853",
        watermarkColor: "rgba(212,168,83,0.08)",
        valueColor: "#f5dfa0",
        labelColor: "rgba(245,223,160,0.55)",
      }
    : {
        bg: "linear-gradient(145deg, rgba(13,26,15,0.92) 0%, rgba(9,18,10,0.97) 100%)",
        border: "rgba(163,230,53,0.45)",
        glow: "rgba(163,230,53,0.22)",
        iconBg: "rgba(163,230,53,0.12)",
        iconColor: "#a3e635",
        watermarkColor: "rgba(163,230,53,0.06)",
        valueColor: "#e8efe8",
        labelColor: "rgba(200,220,180,0.55)",
      };

  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01]"
      style={{
        background: tokens.bg,
        borderRadius: "18px",
        border: `1.5px solid ${tokens.border}`,
        boxShadow: `0 0 0 0 ${tokens.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        minHeight: "195px",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* Outer glow ring on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          borderRadius: "18px",
          boxShadow: `0 0 28px 4px ${tokens.glow}`,
        }}
      />

      {/* ── Watermark: paw print (large, bottom-right) ── */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -bottom-3 -right-3 h-28 w-28 opacity-100"
        fill={tokens.watermarkColor}
      >
        {/* Paw pads */}
        <ellipse cx="50" cy="72" rx="18" ry="14" />
        <ellipse cx="27" cy="52" rx="10" ry="13" />
        <ellipse cx="73" cy="52" rx="10" ry="13" />
        <ellipse cx="37" cy="35" rx="9"  ry="11" />
        <ellipse cx="63" cy="35" rx="9"  ry="11" />
      </svg>

      {/* ── Watermark: leaf silhouette (top-right) ── */}
      <svg
        viewBox="0 0 80 80"
        className="pointer-events-none absolute -top-4 right-8 h-20 w-20 opacity-100 rotate-12"
        fill={tokens.watermarkColor}
      >
        <path d="M40 5 C60 5, 75 20, 75 40 C75 62, 55 72, 40 75 C40 75, 5 60, 5 40 C5 18, 20 5, 40 5Z" />
      </svg>

      {/* ── Icon chip ── */}
      <div
        className="flex h-11 w-11 items-center justify-center"
        style={{
          background: tokens.iconBg,
          borderRadius: "12px",
          border: `1px solid ${tokens.border}`,
          color: tokens.iconColor,
        }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* ── Value + label ── */}
      <div>
        <p
          className="text-5xl font-black leading-none tracking-tight"
          style={{ color: tokens.valueColor }}
        >
          {value}
        </p>
        <p
          className="mt-2 text-[12px] font-semibold tracking-wide"
          style={{ color: tokens.labelColor }}
        >
          {label}
        </p>
      </div>
    </Link>
  );
};

/* ══════════════════════════════════════════
   QUICK ACTION GRID BUTTON
══════════════════════════════════════════ */
const ActionButton = ({ icon: Icon, label, to }) => (
  <Link
    to={to}
    className="group flex flex-col items-center justify-center gap-2.5 p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-lime-400/5"
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(163,230,53,0.10)",
      borderRadius: "14px",
    }}
  >
    <div
      className="flex h-10 w-10 items-center justify-center transition-colors duration-200 group-hover:text-lime-300"
      style={{ color: "rgba(163,230,53,0.50)" }}
    >
      <Icon size={22} strokeWidth={1.5} />
    </div>
    <span
      className="text-center text-[10px] font-bold uppercase tracking-[0.22em] transition-colors duration-200 group-hover:text-white/80"
      style={{ color: "rgba(255,255,255,0.40)" }}
    >
      {label}
    </span>
  </Link>
);

/* ══════════════════════════════════════════
   ACCOUNT INFO ROW
══════════════════════════════════════════ */
const AccountRow = ({ label, value, accent }) => (
  <div
    className="py-3.5"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
  >
    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/25 mb-0.5">
      {label}
    </p>
    <p
      className="text-[13px] font-semibold truncate"
      style={{ color: accent ? "rgba(163,230,53,0.80)" : "rgba(255,255,255,0.70)" }}
    >
      {value}
    </p>
  </div>
);

/* ══════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      icon: LayoutGrid,
      label: "Active Zones",
      value: "—",
      to: "/dashboard/zones",
      variant: "lime",
    },
    {
      icon: PawPrint,
      label: "Animals Tracked",
      value: "—",
      to: "/dashboard/animals",
      variant: "lime",
    },
    {
      icon: Ticket,
      label: "My Bookings",
      value: "—",
      to: "/dashboard/tickets",
      variant: "lime",
    },
    {
      icon: HeartPulse,
      label: "Health Alerts",
      value: "—",
      to: "/dashboard/animals",
      variant: "amber",
    },
  ];

  return (
    <DashboardLayout>

      {/* ════════════════════════════════
          HERO WELCOME BANNER
      ════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `
            linear-gradient(180deg, rgba(6,14,7,0.10) 0%, rgba(6,14,7,0.55) 55%, rgba(6,14,7,1) 100%),
            linear-gradient(90deg, rgba(6,14,7,0.88) 0%, rgba(6,14,7,0.40) 50%, rgba(6,14,7,0.88) 100%),
            url(${heroImage})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          minHeight: "320px",
        }}
      >
        {/* Radial lime glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 12% 50%, rgba(122,160,40,0.20) 0%, transparent 50%)",
          }}
        />

        {/* Floating particles */}
        {[
          { left: "10%",  top: "70%", animationDuration: "5.5s", animationDelay: "0s"   },
          { left: "25%",  top: "75%", animationDuration: "7s",   animationDelay: "1.2s" },
          { left: "52%",  top: "65%", animationDuration: "6.2s", animationDelay: "0.6s" },
          { left: "70%",  top: "78%", animationDuration: "8s",   animationDelay: "2s"   },
          { left: "86%",  top: "60%", animationDuration: "5s",   animationDelay: "0.3s" },
        ].map((p, i) => <Particle key={i} style={p} />)}

        {/* Text */}
        <div className="relative px-6 pb-16 pt-12 md:px-10 xl:px-16">
          <div className="mb-4 flex items-center gap-3">
            <Leaf size={13} className="text-lime-300/55" />
            <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-lime-300/55">
              Abhayarnya Wildlife Sanctuary
            </p>
          </div>

          <h1
            className="text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl xl:text-7xl"
          >
            Welcome back,{" "}
            <span
              style={{
                color: "#a3e635",
                textShadow: "0 0 48px rgba(163,230,53,0.40)",
              }}
            >
              {user?.first_name ?? "Visitor"}
            </span>
          </h1>

          <p className="mt-3 max-w-lg text-sm text-white/30 leading-relaxed">
            Your gateway to the sanctuary — explore zones, track wildlife, and
            manage your visits all in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/dashboard/zones"
              className="flex items-center gap-2 border border-lime-400/60 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-lime-400 hover:text-black"
              style={{ borderRadius: "6px" }}
            >
              <MapPin size={12} />
              Explore Zones
            </Link>
            <Link
              to="/dashboard/animals"
              className="flex items-center gap-2 border border-white/12 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/45 transition-all hover:border-white/30 hover:text-white/75"
              style={{ borderRadius: "6px" }}
            >
              <PawPrint size={12} />
              View Animals
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          STAT CARDS  (below hero, not overlapping)
      ════════════════════════════════ */}
      <section className="px-6 pt-8 pb-2 md:px-10 xl:px-16">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          LOWER PANELS
      ════════════════════════════════ */}
      <section className="px-6 py-8 md:px-10 xl:px-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* ── Quick Actions ── */}
          <div>
            <p
              className="mb-5 text-xl font-black uppercase tracking-tight text-white"
            >
              Quick Actions
            </p>
            <div
              className="overflow-hidden p-5"
              style={{
                background: "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)",
                borderRadius: "18px",
                border: "1px solid rgba(163,230,53,0.10)",
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <ActionButton icon={MapPin}     label="Explore Map"     to="/dashboard/zones"   />
                <ActionButton icon={PawPrint}   label="Report Sighting" to="/dashboard/animals" />
                <ActionButton icon={Ticket}     label="Book Safari"     to="/dashboard/zones"   />
                <ActionButton icon={HeartPulse} label="Health Alerts"   to="/dashboard/animals" />
              </div>
            </div>
          </div>

          {/* ── Your Account ── */}
          <div>
            <p className="mb-5 text-xl font-black uppercase tracking-tight text-white">
              Your Account
            </p>
            <div
              className="overflow-hidden px-5 pt-2 pb-4"
              style={{
                background: "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)",
                borderRadius: "18px",
                border: "1px solid rgba(163,230,53,0.10)",
              }}
            >
              {/* Avatar row */}
              <div
                className="mb-1 flex items-center gap-3 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center text-base font-black text-black"
                  style={{
                    background: "linear-gradient(135deg, #a3e635 0%, #7aa028 100%)",
                    borderRadius: "50%",
                    boxShadow: "0 0 20px rgba(163,230,53,0.25)",
                  }}
                >
                  {`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white/80">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield size={9} className="text-lime-300/50" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-lime-300/55">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <AccountRow label="User name"    value={user?.email ?? "—"} />
              <AccountRow label="Account ID"   value={user?.visitor_id ? `#${user.visitor_id}` : "—"} />
              <AccountRow
                label="Member Since"
                value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"
                }
              />
              <AccountRow label="Account Alerts" value={user?.role ?? "—"} accent />

              <div className="mt-3">
                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-lime-300/45 transition hover:text-lime-300"
                >
                  Edit Profile <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Particle float animation */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px)   scale(1);   opacity: 0.6; }
          50%  { transform: translateY(-28px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(-56px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;
