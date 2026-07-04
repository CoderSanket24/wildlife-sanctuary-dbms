import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, ShieldCheck, Binoculars, TreePine, Heart,
  Globe, Award, Users, PawPrint, Camera, ArrowUpRight,
  MapPin, Phone, Mail,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImage from "../assets/image.png";

/* ════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════ */

/* ── Section eyebrow label ── */
const Eyebrow = ({ children }) => (
  <div className="mb-4 flex items-center gap-2">
    <Leaf size={11} className="text-lime-300/60" />
    <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-lime-300/60">
      {children}
    </span>
  </div>
);

/* ── Glassy stat counter card ── */
const StatCard = ({ value, label, icon: Icon }) => (
  <div
    className="group relative flex flex-col items-center gap-2 overflow-hidden p-6 text-center transition-transform duration-300 hover:-translate-y-1"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.88) 0%, rgba(9,18,10,0.95) 100%)",
      borderRadius: "18px",
      border:       "1px solid rgba(163,230,53,0.12)",
    }}
  >
    {/* Glow on hover */}
    <div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ boxShadow: "0 0 40px 2px rgba(163,230,53,0.08)", borderRadius: "18px" }}
    />
    <div
      className="mb-1 flex h-10 w-10 items-center justify-center"
      style={{ background: "rgba(163,230,53,0.08)", borderRadius: "50%", color: "#a3e635" }}
    >
      <Icon size={18} strokeWidth={1.5} />
    </div>
    <p className="text-4xl font-black text-white">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">{label}</p>
  </div>
);

/* ── Value pillar card ── */
const ValueCard = ({ icon: Icon, title, body, accent }) => (
  <div
    className="group relative overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)",
      borderRadius: "18px",
      border:       "1px solid rgba(163,230,53,0.09)",
    }}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        boxShadow: `0 0 36px 2px ${accent}18`,
        border:    `1px solid ${accent}28`,
        borderRadius: "18px",
      }}
    />
    {/* Top accent line */}
    <div
      className="absolute top-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: "18px 18px 0 0" }}
    />
    <div
      className="mb-4 flex h-11 w-11 items-center justify-center"
      style={{ background: `${accent}12`, border: `1px solid ${accent}25`, borderRadius: "12px", color: accent }}
    >
      <Icon size={20} strokeWidth={1.5} />
    </div>
    <h3 className="mb-2 text-base font-black uppercase tracking-tight text-white">{title}</h3>
    <p className="text-sm leading-7 text-white/45">{body}</p>
  </div>
);

/* ── Team member card ── */
const TeamCard = ({ name, role, initials, accent = "#a3e635" }) => (
  <div
    className="group relative flex flex-col items-center gap-3 overflow-hidden p-6 text-center transition-transform duration-300 hover:-translate-y-1"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.88) 0%, rgba(9,18,10,0.95) 100%)",
      borderRadius: "18px",
      border:       "1px solid rgba(163,230,53,0.09)",
    }}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ boxShadow: `0 0 36px 2px ${accent}14`, borderRadius: "18px" }}
    />
    {/* Avatar */}
    <div
      className="flex h-16 w-16 items-center justify-center text-xl font-black"
      style={{
        background:   `${accent}14`,
        border:       `2px solid ${accent}30`,
        borderRadius: "50%",
        color:        accent,
        boxShadow:    `0 0 24px ${accent}20`,
      }}
    >
      {initials}
    </div>
    <div>
      <p className="text-sm font-black uppercase tracking-tight text-white">{name}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">{role}</p>
    </div>
  </div>
);

/* ── Timeline milestone ── */
const Milestone = ({ year, event, last }) => (
  <div className="relative flex gap-5">
    {/* Spine */}
    <div className="flex flex-col items-center">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center text-[10px] font-black"
        style={{
          background:   "rgba(163,230,53,0.10)",
          border:       "1px solid rgba(163,230,53,0.25)",
          borderRadius: "50%",
          color:        "#a3e635",
        }}
      >
        {year.slice(2)}
      </div>
      {!last && <div className="mt-1 h-full w-px bg-white/6" />}
    </div>
    <div className="pb-7">
      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-lime-300/50">{year}</p>
      <p className="mt-1 text-sm font-semibold text-white/65">{event}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════ */
const STATS = [
  { value: "850+",  label: "Acres of Protected Land",   icon: TreePine    },
  { value: "240+",  label: "Species Resident",           icon: PawPrint    },
  { value: "18",    label: "Active Camera Traps",        icon: Camera      },
  { value: "12K+",  label: "Annual Visitors",            icon: Users       },
];

const VALUES = [
  {
    icon:   ShieldCheck,
    title:  "Conservation First",
    body:   "Every decision — from enclosure design to visitor pathways — is guided by the well-being of our resident wildlife above all else.",
    accent: "#a3e635",
  },
  {
    icon:   Binoculars,
    title:  "Scientific Rigour",
    body:   "Our rangers and field analysts log real-time data on animal health, sighting patterns, and habitat utilisation across all five climate zones.",
    accent: "#fbbf24",
  },
  {
    icon:   Globe,
    title:  "Community Roots",
    body:   "Abhayarnya was built with local villages, not against them. Employment, education, and eco-tourism revenue flow directly back to the region.",
    accent: "#60a5fa",
  },
  {
    icon:   Heart,
    title:  "Compassionate Care",
    body:   "Resident veterinarians monitor every animal weekly. Animals under care receive tailored treatment protocols logged in our health system.",
    accent: "#f472b6",
  },
  {
    icon:   Award,
    title:  "Accredited Excellence",
    body:   "Recognised by the Central Zoo Authority of India and a member of the Global Species Survival Programme for three endangered species.",
    accent: "#a78bfa",
  },
  {
    icon:   Leaf,
    title:  "Zero-Footprint Goals",
    body:   "Solar-powered ranger stations, rainwater harvesting, and a ban on single-use plastics across the entire 850-acre reserve.",
    accent: "#34d399",
  },
];

const TEAM = [
  { name: "Dr. Priya Nair",      role: "Chief Wildlife Veterinarian",   initials: "PN", accent: "#a3e635" },
  { name: "Arjun Deshmukh",      role: "Head Ranger & Field Director",  initials: "AD", accent: "#fbbf24" },
  { name: "Dr. Sneha Kulkarni",  role: "Conservation Biologist",        initials: "SK", accent: "#60a5fa" },
  { name: "Rahul Patil",         role: "Sanctuary Operations Manager",  initials: "RP", accent: "#f472b6" },
];

const MILESTONES = [
  { year: "2008", event: "Abhayarnya established on 200 acres of degraded forest land in Maharashtra." },
  { year: "2011", event: "First successful reintroduction — Indian Star Tortoise colony released into the Wetland Zone." },
  { year: "2014", event: "Expanded to 850 acres. Tropical and Alpine zones commissioned." },
  { year: "2017", event: "Received CZA accreditation. Initiated Species Survival Programme for Indian Pangolin." },
  { year: "2020", event: "Launched real-time digital health monitoring system for all resident animals." },
  { year: "2024", event: "12,000+ annual visitors, 240+ species — our most biodiverse year on record." },
];

/* ════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════ */
const AboutUs = () => {
  return (
    <div className="min-h-screen w-full bg-[#050a06] text-white">

      {/* ══════ HERO ══════ */}
      <div
        className="relative min-h-130 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(5,10,6,0.30) 0%, rgba(5,10,6,0) 40%, rgba(5,10,6,0) 55%, rgba(5,10,6,1) 100%),
            linear-gradient(90deg, rgba(5,10,6,0.85) 0%, rgba(5,10,6,0.45) 50%, rgba(5,10,6,0.85) 100%),
            url(${heroImage})
          `,
          backgroundSize:     "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Radial lime glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 8% 55%, rgba(122,160,40,0.22) 0%, transparent 48%)" }}
        />

        {/* Navbar */}
        <div className="mx-auto w-full max-w-350 px-6 pt-4 md:px-10 xl:px-16">
          <Navbar />
        </div>

        {/* Hero text */}
        <div className="relative mx-auto w-full max-w-350 px-6 pb-28 pt-16 md:px-10 xl:px-16">
          <Eyebrow>Our Story · Since 2008</Eyebrow>
          <h1 className="max-w-2xl text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl xl:text-7xl">
            Guardians of{" "}
            <span style={{ color: "#a3e635", textShadow: "0 0 48px rgba(163,230,53,0.38)" }}>
              Wild India
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-8 text-white/40">
            Abhayarnya Wildlife Sanctuary is a 850-acre living reserve in Maharashtra where conservation science,
            compassionate animal care, and immersive eco-tourism coexist. Every acre exists to give wildlife a safe home —
            and every visitor a reason to protect it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-lime-400 px-6 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-black transition hover:brightness-110"
              style={{ borderRadius: "6px" }}
            >
              Join the Sanctuary
              <ArrowUpRight size={13} />
            </Link>
            <Link
              to="/signin"
              className="flex items-center gap-2 border border-white/15 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/60 transition hover:border-white/35 hover:text-white"
              style={{ borderRadius: "6px" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ══════ STATS STRIP ══════ */}
      <section className="mx-auto w-full max-w-350 px-6 py-16 md:px-10 xl:px-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ══════ MISSION STATEMENT ══════ */}
      <section
        className="mx-auto w-full max-w-350 px-6 py-16 md:px-10 xl:px-16"
      >
        <div
          className="relative overflow-hidden p-10 md:p-14"
          style={{
            background:   "linear-gradient(135deg, rgba(13,26,15,0.92) 0%, rgba(9,18,10,0.97) 100%)",
            borderRadius: "24px",
            border:       "1px solid rgba(163,230,53,0.12)",
          }}
        >
          {/* Background paw watermark */}
          <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute -bottom-8 -right-8 h-64 w-64 opacity-[0.03]"
            fill="white"
          >
            <ellipse cx="50" cy="72" rx="18" ry="14" />
            <ellipse cx="27" cy="52" rx="10" ry="13" />
            <ellipse cx="73" cy="52" rx="10" ry="13" />
            <ellipse cx="37" cy="35" rx="9" ry="11" />
            <ellipse cx="63" cy="35" rx="9" ry="11" />
          </svg>

          {/* Lime accent bar */}
          <div className="mb-8 h-0.5 w-14" style={{ background: "#a3e635" }} />

          <Eyebrow>Our Mission</Eyebrow>
          <blockquote
            className="max-w-3xl text-2xl font-black leading-snug tracking-tight text-white md:text-3xl"
            style={{ fontStyle: "normal" }}
          >
            "To protect, restore, and celebrate India's biodiversity — one species, one enclosure, one visitor at a time."
          </blockquote>
          <p className="mt-6 max-w-2xl text-sm leading-8 text-white/40">
            We believe conservation is not a destination but a daily practice. Our rangers walk every zone before sunrise.
            Our vets check every animal every week. Our data systems track every sighting and every health log — because
            nature doesn't take days off, and neither do we.
          </p>
        </div>
      </section>

      {/* ══════ CORE VALUES ══════ */}
      <section className="mx-auto w-full max-w-350 px-6 py-16 md:px-10 xl:px-16">
        <Eyebrow>What We Stand For</Eyebrow>
        <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          Our <span style={{ color: "#a3e635" }}>Core Values</span>
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {VALUES.map(v => <ValueCard key={v.title} {...v} />)}
        </div>
      </section>

      {/* ══════ TIMELINE ══════ */}
      <section className="mx-auto w-full max-w-350 px-6 py-16 md:px-10 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left: heading */}
          <div className="lg:sticky lg:top-24">
            <Eyebrow>Our Journey</Eyebrow>
            <h2 className="mb-5 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              16 Years of <span style={{ color: "#a3e635" }}>Wild Progress</span>
            </h2>
            <p className="text-sm leading-8 text-white/40">
              From 200 degraded acres to one of Maharashtra's most biodiverse sanctuaries —
              every milestone is a testament to what sustained conservation can achieve.
            </p>
            <div
              className="mt-8 inline-flex items-center gap-2 px-4 py-2"
              style={{
                background:   "rgba(163,230,53,0.07)",
                border:       "1px solid rgba(163,230,53,0.15)",
                borderRadius: "8px",
              }}
            >
              <PawPrint size={12} style={{ color: "#a3e635" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime-300/70">Est. 2008 · Maharashtra, India</span>
            </div>
          </div>

          {/* Right: milestones */}
          <div className="flex flex-col">
            {MILESTONES.map((m, i) => (
              <Milestone key={m.year} {...m} last={i === MILESTONES.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TEAM ══════ */}
      <section className="mx-auto w-full max-w-350 px-6 py-16 md:px-10 xl:px-16">
        <Eyebrow>The People Behind the Mission</Eyebrow>
        <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          Meet Our <span style={{ color: "#a3e635" }}>Team</span>
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {TEAM.map(t => <TeamCard key={t.name} {...t} />)}
        </div>
      </section>

      {/* ══════ CONTACT STRIP ══════ */}
      <section className="mx-auto w-full max-w-350 px-6 py-16 md:px-10 xl:px-16">
        <div
          className="grid gap-8 p-10 md:grid-cols-3 md:p-14"
          style={{
            background:   "linear-gradient(135deg, rgba(13,26,15,0.92) 0%, rgba(9,18,10,0.97) 100%)",
            borderRadius: "24px",
            border:       "1px solid rgba(163,230,53,0.10)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: "rgba(163,230,53,0.08)", borderRadius: "10px", color: "#a3e635" }}
            >
              <MapPin size={17} strokeWidth={1.5} />
            </div>
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/28">Location</p>
              <p className="text-sm leading-7 text-white/55">
                Eastern Woodland Reserve,<br />Maharashtra, India — 441 001
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: "rgba(163,230,53,0.08)", borderRadius: "10px", color: "#a3e635" }}
            >
              <Phone size={17} strokeWidth={1.5} />
            </div>
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/28">Phone</p>
              <a href="tel:+911234567890" className="text-sm text-white/55 transition hover:text-white">
                +91 12345 67890
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: "rgba(163,230,53,0.08)", borderRadius: "10px", color: "#a3e635" }}
            >
              <Mail size={17} strokeWidth={1.5} />
            </div>
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/28">Email</p>
              <a href="mailto:hello@abhayrnya.in" className="text-sm text-white/55 transition hover:text-white">
                hello@abhayrnya.in
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CTA BANNER ══════ */}
      <section className="mx-auto w-full max-w-350 px-6 pb-24 md:px-10 xl:px-16">
        <div
          className="relative overflow-hidden px-10 py-16 text-center md:px-20"
          style={{
            background:   "linear-gradient(135deg, rgba(163,230,53,0.10) 0%, rgba(163,230,53,0.03) 100%)",
            borderRadius: "24px",
            border:       "1px solid rgba(163,230,53,0.18)",
          }}
        >
          {/* Glow blob */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, rgba(163,230,53,0.5) 0%, transparent 70%)", filter: "blur(40px)" }}
          />
          <p className="relative mb-2 text-[10px] font-bold uppercase tracking-[0.45em] text-lime-300/60">
            Begin Your Visit
          </p>
          <h2 className="relative mb-5 text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
            Ready to explore the sanctuary?
          </h2>
          <p className="relative mb-8 text-sm text-white/35">
            Create an account to book your safari ticket, track animals, and explore all five climate zones.
          </p>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-lime-400 px-7 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-black transition hover:brightness-110"
              style={{ borderRadius: "6px" }}
            >
              Get Started Free
              <ArrowUpRight size={12} />
            </Link>
            <Link
              to="/signin"
              className="flex items-center gap-2 border border-white/15 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50 transition hover:border-white/35 hover:text-white"
              style={{ borderRadius: "6px" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
