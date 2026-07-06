import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Binoculars, Moon, Footprints, Bird, Camera, Leaf,
  ShieldCheck, HeartPulse, Users, Clock, MapPin,
  ArrowUpRight, ChevronDown, ChevronUp, Star,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImage from "../assets/image.png";
import { useAuth } from "../context/AuthContext";

/* ── Shared eyebrow label ── */
const Eyebrow = ({ children }) => (
  <div className="mb-4 flex items-center gap-2">
    <Leaf size={11} className="text-lime-300/60" />
    <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-lime-300/60">
      {children}
    </span>
  </div>
);

/* ── Large service card ── */
const ServiceCard = ({ icon: Icon, title, tagline, body, duration, groupSize, accent, badge }) => (
  <div
    className="group relative flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.90) 0%, rgba(9,18,10,0.96) 100%)",
      borderRadius: "20px",
      border:       "1px solid rgba(163,230,53,0.09)",
    }}
  >
    {/* Top accent bar — slides in on hover */}
    <div
      className="absolute top-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: "20px 20px 0 0" }}
    />

    {/* Hover glow */}
    <div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ boxShadow: `0 0 40px 2px ${accent}14`, borderRadius: "20px" }}
    />

    <div className="flex flex-1 flex-col p-7">
      {/* Icon + badge row */}
      <div className="mb-5 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center"
          style={{ background: `${accent}12`, border: `1px solid ${accent}25`, borderRadius: "14px", color: accent }}
        >
          <Icon size={22} strokeWidth={1.4} />
        </div>
        {badge && (
          <span
            className="rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.22em]"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
          >
            {badge}
          </span>
        )}
      </div>

      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/28">{tagline}</p>
      <h3 className="mb-3 text-xl font-black uppercase tracking-tight text-white">{title}</h3>
      <p className="flex-1 text-sm leading-7 text-white/45">{body}</p>

      {/* Meta chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {duration && (
          <div
            className="flex items-center gap-1.5 px-3 py-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}
          >
            <Clock size={11} className="text-white/30" />
            <span className="text-[10px] font-semibold text-white/40">{duration}</span>
          </div>
        )}
        {groupSize && (
          <div
            className="flex items-center gap-1.5 px-3 py-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}
          >
            <Users size={11} className="text-white/30" />
            <span className="text-[10px] font-semibold text-white/40">{groupSize}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

/* ── Feature pill ── */
const Feature = ({ icon: Icon, label, accent = "#a3e635" }) => (
  <div
    className="flex items-center gap-2.5 px-4 py-2.5"
    style={{
      background:   "rgba(13,26,15,0.85)",
      border:       "1px solid rgba(163,230,53,0.09)",
      borderRadius: "12px",
    }}
  >
    <Icon size={14} style={{ color: accent }} strokeWidth={1.5} />
    <span className="text-xs font-semibold text-white/55">{label}</span>
  </div>
);

/* ── FAQ accordion item ── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{
        background:   "rgba(13,26,15,0.80)",
        border:       `1px solid ${open ? "rgba(163,230,53,0.18)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "14px",
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-sm font-semibold text-white/80">{q}</span>
        {open
          ? <ChevronUp size={16} className="shrink-0 text-lime-300" />
          : <ChevronDown size={16} className="shrink-0 text-white/30" />
        }
      </button>
      {open && (
        <div className="border-t border-white/6 px-6 pb-5 pt-4">
          <p className="text-sm leading-7 text-white/45">{a}</p>
        </div>
      )}
    </div>
  );
};

/* ── Review card ── */
const ReviewCard = ({ name, role, text, stars = 5 }) => (
  <div
    className="flex flex-col gap-4 p-6"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.88) 0%, rgba(9,18,10,0.95) 100%)",
      borderRadius: "18px",
      border:       "1px solid rgba(163,230,53,0.08)",
    }}
  >
    <div className="flex gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} size={12} fill="#a3e635" stroke="none" />
      ))}
    </div>
    <p className="flex-1 text-sm leading-7 text-white/50 italic">"{text}"</p>
    <div>
      <p className="text-xs font-black uppercase tracking-tight text-white">{name}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-white/28">{role}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */
const SERVICES = [
  {
    icon:      Binoculars,
    title:     "Guided Jungle Safari",
    tagline:   "Signature Experience",
    body:      "Our most popular offering — a 3-hour guided jeep safari through the Tropical and Temperate zones with an expert ranger. Spot resident wildlife, learn about their behaviour, and witness their natural habitat up close.",
    duration:  "3 Hours",
    groupSize: "Max 8 per jeep",
    accent:    "#a3e635",
    badge:     "Most Popular",
  },
  {
    icon:      Moon,
    title:     "Night Safari",
    tagline:   "After Dark",
    body:      "Experience the sanctuary after sunset. Infrared-equipped vehicles and night-vision binoculars let you observe the nocturnal ecosystem — owls, civets, pangolins, and more active only after dark.",
    duration:  "2.5 Hours",
    groupSize: "Max 6 per vehicle",
    accent:    "#818cf8",
    badge:     "Fri & Sat Only",
  },
  {
    icon:      Footprints,
    title:     "Elephant Corridor Walk",
    tagline:   "On Foot",
    body:      "A guided walking trail through the Wetland Zone along the elephant movement corridor. Rangers track footprints, dung, and scratch marks — bringing the science of wildlife tracking to life in real time.",
    duration:  "2 Hours",
    groupSize: "Max 12 guests",
    accent:    "#fbbf24",
  },
  {
    icon:      Bird,
    title:     "Bird Watching Tour",
    tagline:   "Avian Discovery",
    body:      "With 90+ bird species resident across the Alpine and Wetland zones, Abhayarnya is a premier birding destination. Expert ornithologists lead early-morning sessions with high-power spotting scopes provided.",
    duration:  "2 Hours",
    groupSize: "Max 10 guests",
    accent:    "#34d399",
    badge:     "Dawn Only",
  },
  {
    icon:      Camera,
    title:     "Photography Expedition",
    tagline:   "For Creators",
    body:      "A specialised half-day programme for photographers. Slower-paced vehicles, optimal golden-hour timing, and a ranger trained in wildlife photography allow you to capture stunning, publication-quality shots.",
    duration:  "4 Hours",
    groupSize: "Max 4 guests",
    accent:    "#f472b6",
  },
  {
    icon:      Leaf,
    title:     "Conservation Programme",
    tagline:   "Give Back",
    body:      "A full-day behind-the-scenes experience — assist our veterinary team with routine health checks, help rangers log survey data, and participate in habitat restoration. Available to groups and schools.",
    duration:  "Full Day",
    groupSize: "Max 20 guests",
    accent:    "#60a5fa",
    badge:     "Schools Welcome",
  },
];

const FEATURES = [
  { icon: ShieldCheck, label: "Certified Wildlife Rangers",  accent: "#a3e635" },
  { icon: HeartPulse,  label: "Zero Animal Disturbance Policy", accent: "#f472b6" },
  { icon: Camera,      label: "Photography Guidelines Provided", accent: "#fbbf24" },
  { icon: Users,       label: "Small Groups Only",           accent: "#60a5fa" },
  { icon: MapPin,      label: "GPS-Tracked Vehicles",        accent: "#34d399" },
  { icon: Leaf,        label: "Eco-Certified Operations",    accent: "#818cf8" },
];

const FAQS = [
  {
    q: "Do I need to book in advance?",
    a: "Yes — all safari experiences require advance booking due to strict group-size limits. You can book through your dashboard after signing up. Walk-in bookings are available only on weekdays subject to seat availability.",
  },
  {
    q: "What should I wear and bring?",
    a: "Wear muted earth tones (khaki, olive, beige). Avoid bright colours or strong perfumes. We recommend closed shoes, a light jacket for morning safaris, and a water bottle. Cameras and binoculars are welcome.",
  },
  {
    q: "Are children allowed on all experiences?",
    a: "Children above 6 years are welcome on the Guided Jungle Safari, Bird Watching Tour, and Conservation Programme. Night Safari is restricted to guests aged 14 and above for safety.",
  },
  {
    q: "What if wildlife isn't spotted during the safari?",
    a: "Wildlife sightings depend on animal behaviour and are never guaranteed. However, our rangers have an 85%+ sighting rate for big animals. If no large mammals are spotted, you'll receive a 50% credit voucher for your next visit.",
  },
  {
    q: "Is the sanctuary accessible for guests with mobility needs?",
    a: "Our jeep safaris are accessible for most mobility requirements. Please notify us during booking so we can assign appropriate vehicles. The walking trails are not recommended for guests with severe mobility limitations.",
  },
];

const REVIEWS = [
  {
    name:  "Ananya S.",
    role:  "Wildlife Photographer, Pune",
    text:  "The Photography Expedition was unlike anything I've experienced. Four hours in the golden light with a ranger who knew every animal's name. I came back with 40 frames I'm proud of.",
    stars: 5,
  },
  {
    name:  "Rohan M.",
    role:  "Teacher, Nagpur",
    text:  "We brought our school's ecology class for the Conservation Programme. The students helped with real health log data and left understanding conservation as a practice, not a concept.",
    stars: 5,
  },
  {
    name:  "Priya & Vikram",
    role:  "Visitors, Mumbai",
    text:  "Night Safari was absolutely magical. Saw a pair of civets and a pangolin — species we'd only read about. The rangers' night vision equipment made all the difference.",
    stars: 5,
  },
];

/* ═══════════════════════════════════════════
   PAGE
═══════════════════════════════════════════ */
const Services = () => {
  const { user } = useAuth();
  const bookTo   = user ? "/dashboard/tickets" : "/signin";

  return (
    <div className="min-h-screen w-full bg-[#050a06] text-white">

      {/* ══ HERO ══ */}
      <div
        className="relative min-h-120 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(5,10,6,0.25) 0%, rgba(5,10,6,0) 35%, rgba(5,10,6,0) 55%, rgba(5,10,6,1) 100%),
            linear-gradient(90deg, rgba(5,10,6,0.88) 0%, rgba(5,10,6,0.42) 50%, rgba(5,10,6,0.88) 100%),
            url(${heroImage})
          `,
          backgroundSize:     "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 10% 60%, rgba(122,160,40,0.20) 0%, transparent 46%)" }}
        />

        <div className="mx-auto w-full max-w-350 px-6 pt-4 md:px-10 xl:px-16">
          <Navbar />
        </div>

        <div className="relative mx-auto w-full max-w-350 px-6 pb-28 pt-16 md:px-10 xl:px-16">
          <Eyebrow>What We Offer</Eyebrow>
          <h1 className="max-w-2xl text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl xl:text-7xl">
            Our{" "}
            <span style={{ color: "#a3e635", textShadow: "0 0 48px rgba(163,230,53,0.38)" }}>
              Experiences
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-8 text-white/40">
            Six curated wildlife experiences across five climate zones. Every programme is led by certified rangers
            and designed to bring you as close to nature as responsibly possible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={bookTo}
              className="flex items-center gap-2 bg-lime-400 px-6 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-black transition hover:brightness-110"
              style={{ borderRadius: "6px" }}
            >
              Book a Safari
              <ArrowUpRight size={13} />
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 border border-white/15 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 transition hover:border-white/35 hover:text-white"
              style={{ borderRadius: "6px" }}
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* ══ SERVICES GRID ══ */}
      <section className="mx-auto w-full max-w-350 px-6 py-20 md:px-10 xl:px-16">
        <Eyebrow>Six Curated Programmes</Eyebrow>
        <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          Choose Your <span style={{ color: "#a3e635" }}>Adventure</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map(s => <ServiceCard key={s.title} {...s} />)}
        </div>
      </section>

      {/* ══ FEATURES STRIP ══ */}
      <section className="mx-auto w-full max-w-350 px-6 pb-20 md:px-10 xl:px-16">
        <div
          className="p-10 md:p-12"
          style={{
            background:   "linear-gradient(135deg, rgba(13,26,15,0.92) 0%, rgba(9,18,10,0.97) 100%)",
            borderRadius: "24px",
            border:       "1px solid rgba(163,230,53,0.10)",
          }}
        >
          <Eyebrow>The Abhayarnya Standard</Eyebrow>
          <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
            Every experience includes
          </h2>
          <div className="flex flex-wrap gap-3">
            {FEATURES.map(f => <Feature key={f.label} {...f} />)}
          </div>
        </div>
      </section>

      {/* ══ BOOKING CTA BANNER ══ */}
      <section className="mx-auto w-full max-w-350 px-6 pb-20 md:px-10 xl:px-16">
        <div
          className="relative grid gap-8 overflow-hidden px-10 py-14 md:grid-cols-2 md:items-center md:px-14"
          style={{
            background:   "linear-gradient(135deg, rgba(163,230,53,0.09) 0%, rgba(163,230,53,0.02) 100%)",
            borderRadius: "24px",
            border:       "1px solid rgba(163,230,53,0.16)",
          }}
        >
          {/* Glow blob */}
          <div
            className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(163,230,53,0.6) 0%, transparent 70%)", filter: "blur(40px)" }}
          />

          <div className="relative">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-lime-300/55">
              Ready to Visit?
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
              Book your safari today
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/35">
              Spots fill up fast — especially for Night Safari and the Photography Expedition.
              {user ? " Head to your dashboard to book." : " Create a free account to get started."}
            </p>
          </div>

          <div className="relative flex flex-wrap gap-3 md:justify-end">
            <Link
              to={bookTo}
              className="flex items-center gap-2 bg-lime-400 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] text-black transition hover:brightness-110"
              style={{ borderRadius: "6px" }}
            >
              {user ? "Go to Dashboard" : "Sign Up Free"}
              <ArrowUpRight size={13} />
            </Link>
            {!user && (
              <Link
                to="/signin"
                className="flex items-center gap-2 border border-white/15 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50 transition hover:border-white/35 hover:text-white"
                style={{ borderRadius: "6px" }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ══ VISITOR REVIEWS ══ */}
      <section className="mx-auto w-full max-w-350 px-6 pb-20 md:px-10 xl:px-16">
        <Eyebrow>Guest Stories</Eyebrow>
        <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          What Visitors <span style={{ color: "#a3e635" }}>Say</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {REVIEWS.map(r => <ReviewCard key={r.name} {...r} />)}
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="mx-auto w-full max-w-350 px-6 pb-24 md:px-10 xl:px-16">
        <Eyebrow>Common Questions</Eyebrow>
        <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          FAQs
        </h2>
        <div className="mx-auto max-w-3xl flex flex-col gap-3">
          {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
