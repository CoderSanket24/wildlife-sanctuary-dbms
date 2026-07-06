import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const quickLinks = [
  { label: "Home",         to: "/"         },
  { label: "About Us",    to: "/about"    },
  { label: "Our Services", to: "/services" },
  { label: "Plan a Visit", to: "/"         },
  { label: "Contact",     to: "/contact"  },
];


const experiences = [
  "Guided Jungle Safari",
  "Night Safari",
  "Elephant Corridor Walk",
  "Bird Watching Tour",
  "Photography Expedition",
  "Conservation Program",
];

const socials = [
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: XIcon,         label: "X",         href: "#" },
  { icon: FacebookIcon,  label: "Facebook",  href: "#" },
  { icon: YoutubeIcon,   label: "YouTube",   href: "#" },
];

const Footer = () => {
  const { user } = useAuth();
  const safariTo  = user ? "/dashboard/zones" : "/signin";
  return (
    <footer className="w-full border-t border-white/8 bg-[#050705]">
      {/* ── Top band ── */}
      <div className="mx-auto w-full max-w-350 px-6 py-14 md:px-10 xl:px-16">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1.4fr]">

          {/* ── Brand column ── */}
          <div>
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt="Abhayrnya Wildlife Sanctuary"
                className="h-14 w-auto object-contain"
                style={{ mixBlendMode: "screen" }}
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">
              A living sanctuary where wildlife roams free. We blend
              conservation with immersive experiences so every visit
              deepens your connection to the natural world.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-lime-300/50 hover:text-lime-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-lime-300">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white"
                  >
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0 text-lime-300"
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Experiences ── */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-lime-300">
              Experiences
            </h3>
            <ul className="space-y-3">
              {experiences.map((exp) => (
                <li key={exp}>
                  <span className="text-sm text-white/55 transition hover:text-white cursor-default">
                    {exp}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact & Hours ── */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-lime-300">
              Visit Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-lime-300/70" />
                <span className="text-sm leading-6 text-white/55">
                  Abhayrnya Wildlife Sanctuary,<br />
                  Eastern Woodland Reserve,<br />
                  Maharashtra, India — 441 001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="shrink-0 text-lime-300/70" />
                <a href="tel:+911234567890" className="text-sm text-white/55 transition hover:text-white">
                  +91 12345 67890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="shrink-0 text-lime-300/70" />
                <a href="mailto:hello@abhayrnya.in" className="text-sm text-white/55 transition hover:text-white">
                  hello@abhayrnya.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={15} className="mt-0.5 shrink-0 text-lime-300/70" />
                <span className="text-sm leading-6 text-white/55">
                  Open daily · 5:30 AM – 7:00 PM<br />
                  Night safari: Fri & Sat only
                </span>
              </li>
            </ul>

            {/* CTA */}
            <Link
              to={safariTo}
              className="mt-6 inline-flex items-center gap-2 border border-lime-400/70 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-lime-400 hover:text-black"
            >
              Book a Safari
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-auto w-full max-w-350 px-6 md:px-10 xl:px-16">
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Bottom bar ── */}
      <div className="mx-auto w-full max-w-350 px-6 py-5 md:px-10 xl:px-16">
        <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Abhayrnya Wildlife Sanctuary. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-white/30 transition hover:text-white/70"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
