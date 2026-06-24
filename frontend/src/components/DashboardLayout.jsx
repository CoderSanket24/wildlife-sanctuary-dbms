import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  PawPrint,
  User,
  Ticket,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const navItems = [
  { to: "/dashboard",         icon: LayoutDashboard, label: "Overview"   },
  { to: "/dashboard/zones",   icon: MapPin,           label: "Zones"     },
  { to: "/dashboard/animals", icon: PawPrint,         label: "Animals"   },
  { to: "/dashboard/tickets", icon: Ticket,           label: "My Tickets"},
  { to: "/dashboard/profile", icon: User,             label: "Profile"   },
];

const DashboardLayout = ({ children }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/signin");
  };

  const initials =
    user
      ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
      : "?";

  return (
    <div className="min-h-screen" style={{ background: "#060e07" }}>

      {/* ═══════════════════════════════════════
          TOP NAVBAR
      ═══════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(6,14,7,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(163,230,53,0.10)",
        }}
      >
        {/* Lime top line */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, #a3e635 30%, rgba(163,230,53,0.4) 70%, transparent 100%)",
          }}
        />

        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-5 py-3 md:px-10">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img
              src={logo}
              alt="Abhayarnya Wildlife Sanctuary"
              className="h-11 w-auto object-contain"
              style={{ filter: "drop-shadow(0 0 12px rgba(163,230,53,0.30))" }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-150 ${
                    isActive
                      ? "text-lime-300"
                      : "text-white/45 hover:text-white/80"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        borderBottom: "2px solid #a3e635",
                        marginBottom: "-2px",
                      }
                    : { borderBottom: "2px solid transparent", marginBottom: "-2px" }
                }
              >
                <Icon size={13} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right: profile link + logout */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Clickable profile chip */}
            <Link
              to="/dashboard/profile"
              className="group flex items-center gap-2.5 px-3 py-1.5 transition-all duration-200 hover:bg-lime-400/8"
              style={{
                background: "rgba(163,230,53,0.05)",
                border: "1px solid rgba(163,230,53,0.13)",
                borderRadius: "8px",
              }}
            >
              {/* Avatar circle */}
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center text-[9px] font-black text-black"
                style={{
                  background: "linear-gradient(135deg,#a3e635 0%,#7aa028 100%)",
                  borderRadius: "50%",
                }}
              >
                {initials}
              </div>
              {/* Name */}
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-white/85 transition-colors">
                {user?.first_name}
              </span>
              {/* Role badge */}
              <span
                className="text-[8px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5"
                style={{
                  background: "rgba(163,230,53,0.11)",
                  color: "rgba(163,230,53,0.65)",
                  borderRadius: "4px",
                }}
              >
                {user?.role}
              </span>
              {/* Profile icon hint */}
              <User size={11} className="text-white/20 group-hover:text-lime-300/60 transition-colors" />
            </Link>

            {/* Divider */}
            <div className="h-5 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/28 transition-all hover:text-red-400"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex lg:hidden items-center justify-center p-1.5 text-white/50 transition hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="border-t px-5 pb-5 pt-3 lg:hidden"
            style={{
              background: "rgba(6,14,7,0.97)",
              borderColor: "rgba(163,230,53,0.08)",
            }}
          >
            <div className="space-y-0.5">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.22em] transition-all ${
                      isActive ? "text-lime-300" : "text-white/45 hover:text-white/80"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { borderLeft: "2px solid #a3e635", paddingLeft: "10px" }
                      : { borderLeft: "2px solid transparent" }
                  }
                >
                  <Icon size={14} />
                  {label}
                </NavLink>
              ))}
            </div>

            <div
              className="mt-3 border-t pt-3"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              {/* User info row */}
              <div className="mb-3 flex items-center gap-3 px-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-[10px] font-black text-black"
                  style={{ background: "#a3e635" }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-lime-300/50">
                    {user?.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 border px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400/70 transition hover:bg-red-500/8 hover:text-red-400"
                style={{ borderColor: "rgba(239,68,68,0.20)" }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════
          PAGE CONTENT
      ═══════════════════════════════════════ */}
      <main className="mx-auto w-full max-w-screen-2xl">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
