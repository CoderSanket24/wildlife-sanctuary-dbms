import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Phone, Mail, Clock, Leaf, Send,
  ArrowUpRight, CheckCircle, AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImage from "../assets/image.png";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

/* ── Inline social SVGs (lucide-react has no social brand icons) ── */
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
  </svg>
);

/* ── Shared eyebrow ── */
const Eyebrow = ({ children }) => (
  <div className="mb-4 flex items-center gap-2">
    <Leaf size={11} className="text-lime-300/60" />
    <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-lime-300/60">
      {children}
    </span>
  </div>
);

/* ── Contact info card ── */
const InfoCard = ({ icon: Icon, label, value, href, accent }) => (
  <div
    className="group flex items-start gap-4 p-6 transition-transform duration-300 hover:-translate-y-0.5"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.88) 0%, rgba(9,18,10,0.95) 100%)",
      borderRadius: "18px",
      border:       "1px solid rgba(163,230,53,0.09)",
    }}
  >
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center"
      style={{ background: `${accent}12`, border: `1px solid ${accent}25`, borderRadius: "12px", color: accent }}
    >
      <Icon size={19} strokeWidth={1.5} />
    </div>
    <div>
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.30em] text-white/28">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-semibold text-white/65 transition hover:text-white">
          {value}
        </a>
      ) : (
        <p className="text-sm font-semibold leading-6 text-white/65">{value}</p>
      )}
    </div>
  </div>
);

/* ── Social button ── */
const SocialBtn = ({ icon: Icon, label, href, accent }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noreferrer"
    className="group flex items-center gap-2.5 px-4 py-3 transition-all duration-200"
    style={{
      background:   "rgba(13,26,15,0.80)",
      border:       "1px solid rgba(163,230,53,0.08)",
      borderRadius: "12px",
    }}
  >
    <div style={{ color: accent }} className="transition group-hover:scale-110 duration-200">
      <Icon size={16} />
    </div>
    <span className="text-xs font-semibold text-white/45 transition group-hover:text-white/75">{label}</span>
  </a>
);

/* ── Form field wrapper ── */
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">{label}</label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-red-400/80">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputBase = {
  background:   "rgba(13,26,15,0.70)",
  border:       "1px solid rgba(163,230,53,0.12)",
  borderRadius: "10px",
  color:        "rgba(255,255,255,0.75)",
  outline:      "none",
  fontSize:     "13px",
};
const inputFocusClass =
  "w-full px-4 py-3 text-sm placeholder-white/20 transition focus:border-lime-400/50 focus:shadow-[0_0_0_3px_rgba(163,230,53,0.07)]";

/* ═══════════════════════════════════
   DATA
═══════════════════════════════════ */
const INFO_CARDS = [
  {
    icon:   MapPin,
    label:  "Visit Us",
    value:  "Eastern Woodland Reserve,\nMaharashtra, India — 441 001",
    accent: "#a3e635",
  },
  {
    icon:   Phone,
    label:  "Call Us",
    value:  "+91 12345 67890",
    href:   "tel:+911234567890",
    accent: "#34d399",
  },
  {
    icon:   Mail,
    label:  "Email Us",
    value:  "hello@abhayrnya.in",
    href:   "mailto:hello@abhayrnya.in",
    accent: "#60a5fa",
  },
  {
    icon:   Clock,
    label:  "Open Hours",
    value:  "Daily 5:30 AM – 7:00 PM\nNight Safari: Fri & Sat only",
    accent: "#fbbf24",
  },
];

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram",  href: "#", accent: "#f472b6" },
  { icon: XIcon,         label: "X / Twitter", href: "#", accent: "#60a5fa" },
  { icon: FacebookIcon,  label: "Facebook",   href: "#", accent: "#818cf8" },
  { icon: YoutubeIcon,   label: "YouTube",    href: "#", accent: "#f87171" },
];

const SUBJECTS = [
  "Safari Booking Inquiry",
  "Group / School Visit",
  "Conservation Programme",
  "Photography Expedition",
  "Media & Press",
  "Other",
];

/* ═══════════════════════════════════
   CONTACT FORM
═══════════════════════════════════ */
const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.subject)        e.subject = "Please select a subject.";
    if (!form.message.trim()) e.message = "Message cannot be empty.";
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setStatus("submitting");
    setErrors({});
    try {
      await api.post("/contact", form);
      setStatus("success");
    } catch (err) {
      const msg = err.response?.data?.error ?? "Failed to send message. Please try again.";
      setErrors(prev => ({ ...prev, server: msg }));
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div
        className="flex flex-col items-center justify-center gap-5 py-16 text-center"
        style={{
          background:   "linear-gradient(145deg, rgba(13,26,15,0.88) 0%, rgba(9,18,10,0.95) 100%)",
          borderRadius: "22px",
          border:       "1px solid rgba(163,230,53,0.14)",
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{ background: "rgba(163,230,53,0.10)", borderRadius: "50%", boxShadow: "0 0 32px rgba(163,230,53,0.18)" }}
        >
          <CheckCircle size={30} style={{ color: "#a3e635" }} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white">Message Sent!</h3>
          <p className="mt-2 text-sm text-white/40">
            Thanks for reaching out. We'll get back to you within 24 hours.
          </p>
        </div>
        <button
          onClick={() => { setForm({ name: "", email: "", subject: "", message: "" }); setStatus("idle"); setErrors({}); }}
          className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em] text-lime-300/60 underline underline-offset-4 transition hover:text-lime-300"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 p-8 md:p-10"
      style={{
        background:   "linear-gradient(145deg, rgba(13,26,15,0.88) 0%, rgba(9,18,10,0.95) 100%)",
        borderRadius: "22px",
        border:       "1px solid rgba(163,230,53,0.10)",
      }}
    >
      <div className="mb-1">
        <Eyebrow>Send a Message</Eyebrow>
        <h3 className="text-2xl font-black uppercase tracking-tight text-white">
          Get in touch
        </h3>
        <p className="mt-1.5 text-xs text-white/30">We respond within 24 hours on working days.</p>
      </div>

      {/* Name + Email row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" error={errors.name}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Aarav Sharma"
            className={inputFocusClass}
            style={inputBase}
          />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="aarav@example.com"
            className={inputFocusClass}
            style={inputBase}
          />
        </Field>
      </div>

      {/* Subject */}
      <Field label="Subject" error={errors.subject}>
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className={inputFocusClass}
          style={{ ...inputBase, color: form.subject ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.20)", cursor: "pointer" }}
        >
          <option value="" disabled hidden>Select a subject…</option>
          {SUBJECTS.map(s => (
            <option key={s} value={s} style={{ background: "#0d1a0f", color: "white" }}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      {/* Message */}
      <Field label="Message" error={errors.message}>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Tell us about your visit, inquiry, or how we can help…"
          className={inputFocusClass}
          style={{ ...inputBase, resize: "vertical", minHeight: "120px" }}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex items-center justify-center gap-2 py-3.5 text-[10px] font-black uppercase tracking-[0.30em] text-black transition hover:brightness-110 disabled:opacity-60"
        style={{ background: "#a3e635", borderRadius: "10px" }}
      >
        {status === "submitting" ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            Sending…
          </>
        ) : (
          <>
            <Send size={13} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
};

/* ═══════════════════════════════════
   PAGE
═══════════════════════════════════ */
const Contact = () => (
  <div className="min-h-screen w-full bg-[#050a06] text-white">

    {/* ══ HERO ══ */}
    <div
      className="relative min-h-105 overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(180deg, rgba(5,10,6,0.25) 0%, rgba(5,10,6,0) 35%, rgba(5,10,6,0) 55%, rgba(5,10,6,1) 100%),
          linear-gradient(90deg, rgba(5,10,6,0.90) 0%, rgba(5,10,6,0.48) 55%, rgba(5,10,6,0.90) 100%),
          url(${heroImage})
        `,
        backgroundSize:     "cover",
        backgroundPosition: "center 55%",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 8% 60%, rgba(122,160,40,0.18) 0%, transparent 46%)" }}
      />

      <div className="mx-auto w-full max-w-350 px-6 pt-4 md:px-10 xl:px-16">
        <Navbar />
      </div>

      <div className="relative mx-auto w-full max-w-350 px-6 pb-24 pt-14 md:px-10 xl:px-16">
        <Eyebrow>Reach Out</Eyebrow>
        <h1 className="max-w-xl text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl xl:text-7xl">
          Contact{" "}
          <span style={{ color: "#a3e635", textShadow: "0 0 48px rgba(163,230,53,0.38)" }}>
            Us
          </span>
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-8 text-white/40">
          Have a question about our safaris, a group booking, or just want to say hello?
          We'd love to hear from you. Our team responds within 24 hours.
        </p>
      </div>
    </div>

    {/* ══ MAIN CONTENT ══ */}
    <section className="mx-auto w-full max-w-350 px-6 py-16 md:px-10 xl:px-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">

        {/* ── Left col: info + socials ── */}
        <div className="flex flex-col gap-6">
          <div>
            <Eyebrow>Find Us</Eyebrow>
            <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              Sanctuary <span style={{ color: "#a3e635" }}>Details</span>
            </h2>
          </div>

          {/* Info cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {INFO_CARDS.map(c => <InfoCard key={c.label} {...c} />)}
          </div>

          {/* Social links */}
          <div>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.32em] text-white/28">Follow Along</p>
            <div className="grid grid-cols-2 gap-2.5">
              {SOCIALS.map(s => <SocialBtn key={s.label} {...s} />)}
            </div>
          </div>

          {/* Quick link to book */}
          <div
            className="relative overflow-hidden p-6"
            style={{
              background:   "linear-gradient(135deg, rgba(163,230,53,0.08) 0%, rgba(163,230,53,0.02) 100%)",
              borderRadius: "18px",
              border:       "1px solid rgba(163,230,53,0.14)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(163,230,53,0.6) 0%, transparent 70%)", filter: "blur(20px)" }}
            />
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.32em] text-lime-300/50">Ready to Visit?</p>
            <p className="mb-4 text-base font-black uppercase tracking-tight text-white">
              Book a safari now
            </p>
            <Link
              to="/signin"
              className="flex w-fit items-center gap-2 bg-lime-400 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.28em] text-black transition hover:brightness-110"
              style={{ borderRadius: "8px" }}
            >
              Get Started
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* ── Right col: form ── */}
        <div>
          <ContactForm />
        </div>
      </div>
    </section>

    {/* ══ MAP PLACEHOLDER ══ */}
    <section className="mx-auto w-full max-w-350 px-6 pb-24 md:px-10 xl:px-16">
      <Eyebrow>Our Location</Eyebrow>
      <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
        Find the <span style={{ color: "#a3e635" }}>Sanctuary</span>
      </h2>

      <div
        className="relative flex h-72 items-center justify-center overflow-hidden"
        style={{
          background:   "linear-gradient(145deg, rgba(13,26,15,0.90) 0%, rgba(9,18,10,0.97) 100%)",
          borderRadius: "22px",
          border:       "1px solid rgba(163,230,53,0.10)",
        }}
      >
        {/* Grid lines for map-like feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(163,230,53,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(163,230,53,1) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glowing centre dot */}
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="h-5 w-5 rounded-full"
              style={{ background: "#a3e635", boxShadow: "0 0 0 8px rgba(163,230,53,0.15), 0 0 0 16px rgba(163,230,53,0.07)" }}
            />
            {/* Pulse ring */}
            <div
              className="absolute inset-0 animate-ping rounded-full opacity-40"
              style={{ background: "#a3e635" }}
            />
          </div>
          <div
            className="px-4 py-2 text-center"
            style={{ background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.20)", borderRadius: "10px" }}
          >
            <p className="text-xs font-black text-white">Abhayarnya Wildlife Sanctuary</p>
            <p className="mt-0.5 text-[10px] text-white/35">Eastern Woodland Reserve, Maharashtra — 441 001</p>
          </div>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-lime-300/60 transition hover:text-lime-300"
          >
            Open in Google Maps <ArrowUpRight size={11} />
          </a>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Contact;
