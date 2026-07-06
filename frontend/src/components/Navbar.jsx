import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, User } from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Exact match for '/', prefix match for everything else
  const isActive = (to) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const handleLogout = async () => {
    await logoutUser();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Home",         to: "/"         },
    { label: "About us",    to: "/about"    },
    { label: "Our services", to: "/services" },
    { label: "Contact",     to: "/contact"  },
  ];

  return (
    <header className="relative flex items-center justify-between py-2 text-white">
      {/* ── Logo ── */}
      <Link to="/" className="flex items-center">
        <img
          src={logo}
          alt="Abhayrnya Wildlife Sanctuary"
          className="h-16 w-auto object-contain drop-shadow-[0_0_14px_rgba(163,230,53,0.35)]"
        />
      </Link>

      {/* ── Desktop nav links ── */}
      <nav className="hidden items-center gap-8 lg:flex">
        {navLinks.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            className={`text-sm font-semibold uppercase tracking-[0.22em] transition hover:text-white ${
              isActive(to) ? "text-lime-300" : "text-white/80"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Desktop auth area ── */}
      <div className="hidden items-center gap-3 lg:flex">
        {/* Still loading session — show nothing to avoid flicker */}
        {loading ? null : user ? (
          /* ── Logged-in: user menu ── */
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-lime-400/50 hover:text-white"
            >
              <User size={14} className="text-lime-300" />
              {user.first_name}
              <ChevronDown
                size={13}
                className={`text-white/40 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 border border-white/10 bg-[#0b100b] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                {/* User info */}
                <div className="border-b border-white/8 px-4 py-3">
                  <p className="text-xs font-semibold text-white">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-white/40">{user.email}</p>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:bg-lime-400/8 hover:text-lime-300"
                >
                  <LayoutDashboard size={13} />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 border-t border-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 transition hover:bg-red-500/8 hover:text-red-400"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Guest: sign in / sign up ── */
          <>
            <Link
              to="/signin"
              className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="border border-lime-400/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-lime-400 hover:text-black"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* ── Mobile hamburger ── */}
      <button
        className="flex items-center justify-center rounded p-1.5 text-white/80 transition hover:text-white lg:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/80 px-6 py-6 backdrop-blur-xl lg:hidden">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`text-sm font-semibold uppercase tracking-[0.22em] transition hover:text-white ${
                isActive(to) ? "text-lime-300" : "text-white/80"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}

          <hr className="border-white/10" />

          {loading ? null : user ? (
            <>
              {/* Logged-in mobile options */}
              <div className="mb-1">
                <p className="text-xs font-semibold text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="mt-0.5 text-[11px] text-white/40">{user.email}</p>
              </div>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-lime-300"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-red-400/80 transition hover:text-red-400"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="border border-lime-400/80 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-lime-400 hover:text-black"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
