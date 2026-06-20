import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between py-2 text-white">
      {/* Logo / Brand */}
      <Link to="/" className="flex items-center">
        <img
          src={logo}
          alt="Abhayrnya Wildlife Sanctuary"
          className="h-16 w-auto object-contain drop-shadow-[0_0_14px_rgba(163,230,53,0.35)]"
        />
      </Link>

      {/* Desktop Nav Links */}
      <nav className="hidden items-center gap-8 lg:flex">
        <Link
          to="/"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-lime-300"
        >
          Home
        </Link>
        <Link
          to="/"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:text-white"
        >
          About us
        </Link>
        <Link
          to="/"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:text-white"
        >
          Destinations
        </Link>
        <Link
          to="/"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:text-white"
        >
          Our services
        </Link>
      </nav>

      {/* Auth Buttons — Desktop */}
      <div className="hidden items-center gap-3 lg:flex">
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
      </div>

      {/* Mobile Hamburger */}
      <button
        className="flex lg:hidden items-center justify-center rounded p-1.5 text-white/80 hover:text-white transition"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/80 px-6 py-6 backdrop-blur-xl lg:hidden">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-lime-300" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 hover:text-white transition" onClick={() => setMobileOpen(false)}>About us</Link>
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 hover:text-white transition" onClick={() => setMobileOpen(false)}>Destinations</Link>
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 hover:text-white transition" onClick={() => setMobileOpen(false)}>Our services</Link>
          <hr className="border-white/10" />
          <Link to="/signin" className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80 hover:text-white transition" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link to="/signup" className="border border-lime-400/80 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-lime-400 hover:text-black" onClick={() => setMobileOpen(false)}>Sign Up</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
