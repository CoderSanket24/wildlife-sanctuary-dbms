import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PawPrint, MapPin, Microscope, Calendar, Layers,
  HeartPulse, Activity, ArrowRight, Ticket,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import EmptyState from "../components/ui/EmptyState";
import HealthLogCard from "../components/animals/HealthLogCard";
import { HEALTH_META } from "../constants/healthData";
import { CLIMATE_META } from "../constants/climateData";
import api from "../api/axiosInstance";

/* ── Back navigation ── */
const BackLink = () => (
  <Link
    to="/dashboard/animals"
    className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 transition hover:text-lime-300/70"
  >
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    All Animals
  </Link>
);

/* ── Info row inside the detail card ── */
const InfoRow = ({ icon: Icon, label, value, accent }) => (
  <div
    className="flex items-center gap-4 py-3.5"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
  >
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center"
      style={{
        background:   "rgba(163,230,53,0.07)",
        border:       "1px solid rgba(163,230,53,0.12)",
        borderRadius: "8px",
        color:        accent ?? "rgba(163,230,53,0.55)",
      }}
    >
      <Icon size={13} strokeWidth={1.8} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/22">{label}</p>
      <p className="mt-0.5 text-[12px] font-semibold text-white/70 truncate">{value ?? "—"}</p>
    </div>
  </div>
);

/* ── Small stat chip ── */
const StatChip = ({ label, value, color }) => (
  <div
    className="flex flex-1 flex-col items-center gap-1 p-4"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.80) 0%, rgba(9,18,10,0.90) 100%)",
      borderRadius: "14px",
      border:       "1px solid rgba(163,230,53,0.09)",
    }}
  >
    <p className="text-2xl font-black" style={{ color: color ?? "#ffffff" }}>{value ?? "—"}</p>
    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">{label}</p>
  </div>
);

/* ════════════════════════════════════════
   ANIMAL DETAIL PAGE
════════════════════════════════════════ */
const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sanctuary/${id}`);
        setAnimal(res.data.animal);
      } catch (err) {
        setError(err.response?.data?.error ?? "Failed to load animal.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [id]);

  if (loading) {
    return <DashboardLayout><LoadingSpinner label="Loading animal…" /></DashboardLayout>;
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="px-6 py-10 md:px-10 xl:px-16">
          <BackLink />
          <ErrorAlert message={error} />
        </div>
      </DashboardLayout>
    );
  }

  const health      = HEALTH_META[animal.health_status] ?? HEALTH_META.HEALTHY;
  const HealthIcon  = health.icon;
  const climate     = animal.enclosure?.zone?.climate;
  const climateMeta = climate ? CLIMATE_META[climate] : null;

  const ageYears = animal.birth_date
    ? Math.floor((Date.now() - new Date(animal.birth_date)) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        <BackLink />

        {/* ════ HERO HEADER CARD ════ */}
        <div
          className="relative mb-8 overflow-hidden p-8"
          style={{
            background:   "linear-gradient(135deg, rgba(13,26,15,0.95) 0%, rgba(9,18,10,0.98) 100%)",
            borderRadius: "20px",
            border:       "1px solid rgba(163,230,53,0.10)",
          }}
        >
          {/* Health-coloured top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background:   `linear-gradient(90deg, ${health.color}, ${health.color}30, transparent)`,
              borderRadius: "20px 20px 0 0",
            }}
          />

          {/* Paw watermark */}
          <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48"
            fill="rgba(163,230,53,0.03)"
          >
            <ellipse cx="50" cy="72" rx="18" ry="14" />
            <ellipse cx="27" cy="52" rx="10" ry="13" />
            <ellipse cx="73" cy="52" rx="10" ry="13" />
            <ellipse cx="37" cy="35" rx="9"  ry="11" />
            <ellipse cx="63" cy="35" rx="9"  ry="11" />
          </svg>

          <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            {/* Left: avatar + names */}
            <div className="flex items-start gap-5">
              {/* Avatar circle */}
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center"
                style={{
                  background:   `${health.color}15`,
                  border:       `2px solid ${health.color}35`,
                  borderRadius: "50%",
                  boxShadow:    `0 0 32px ${health.color}25`,
                  color:        health.color,
                }}
              >
                <PawPrint size={36} strokeWidth={1.3} />
              </div>

              <div>
                {/* Health badge */}
                <div
                  className="mb-3 inline-flex items-center gap-1.5 px-3 py-1"
                  style={{
                    background:   health.bg,
                    border:       `1px solid ${health.color}33`,
                    borderRadius: "999px",
                    color:        health.color,
                  }}
                >
                  <HealthIcon size={10} strokeWidth={2} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.22em]">{health.label}</span>
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
                  {animal.nickname ?? animal.species}
                </h1>
                {animal.nickname && (
                  <p className="mt-0.5 text-sm font-semibold text-white/40">{animal.species}</p>
                )}
                {animal.scientific_name && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Microscope size={11} style={{ color: "rgba(163,230,53,0.45)" }} />
                    <span className="text-[11px] italic text-white/30">{animal.scientific_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: location info */}
            <div className="flex flex-col gap-2 md:items-end shrink-0">
              {animal.enclosure?.zone && (
                <Link
                  to={`/dashboard/zones/${animal.enclosure.zone.zone_id}`}
                  className="flex items-center gap-2 transition hover:text-lime-300"
                  style={{ color: "rgba(163,230,53,0.55)" }}
                >
                  <MapPin size={13} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                    {animal.enclosure.zone.name}
                  </span>
                  <ArrowRight size={11} />
                </Link>
              )}
              {climateMeta && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1"
                  style={{
                    background:   climateMeta.bg,
                    border:       `1px solid ${climateMeta.border}`,
                    borderRadius: "999px",
                    color:        climateMeta.color,
                  }}
                >
                  <climateMeta.icon size={10} strokeWidth={2} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em]">{climateMeta.label} Zone</span>
                </div>
              )}
              {animal.enclosure && (
                <div className="flex items-center gap-1.5">
                  <Layers size={11} style={{ color: "rgba(163,230,53,0.35)" }} />
                  <span className="text-[10px] text-white/30">
                    Enclosure: {animal.enclosure.code_name}
                  </span>
                </div>
              )}
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                Animal #{animal.animal_id}
              </p>
            </div>
          </div>
        </div>

        {/* ════ STAT CHIPS ════ */}
        <div className="mb-8 flex flex-wrap gap-3">
          <StatChip label="Surveys Total"   value={animal._count?.surveys ?? 0}     color="#a3e635" />
          <StatChip label="Health Logs"     value={animal._count?.health_logs ?? 0} color="#fbbf24" />
          {ageYears !== null && (
            <StatChip label="Age (yrs)"     value={ageYears}                         color="#60a5fa" />
          )}
        </div>

        {/* ════ INFO + HEALTH LOG COLUMNS ════ */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

          {/* ── Animal Info card ── */}
          <div>
            <p className="mb-4 text-lg font-black uppercase tracking-tight text-white">Animal Info</p>
            <div
              style={{
                background:   "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)",
                borderRadius: "18px",
                border:       "1px solid rgba(163,230,53,0.09)",
              }}
            >
              {/* Top accent */}
              <div className="h-0.5 w-10 mx-5 mt-5" style={{ background: "#a3e635" }} />
              <div className="px-5 pb-4">
                <InfoRow icon={PawPrint}   label="Species"       value={animal.species} />
                <InfoRow icon={Microscope} label="Scientific Name" value={animal.scientific_name} />
                <InfoRow icon={Activity}   label="Health Status" value={health.label} accent={health.color} />
                <InfoRow icon={Calendar}   label="Birth Date"
                  value={animal.birth_date
                    ? new Date(animal.birth_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : null}
                />
                <InfoRow icon={Calendar}   label="Date Joined"
                  value={new Date(animal.date_joined).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                />
                <InfoRow icon={Layers}     label="Enclosure"     value={animal.enclosure?.code_name} />
                <InfoRow icon={MapPin}     label="Zone"          value={animal.enclosure?.zone?.name} />
              </div>
            </div>
          </div>

          {/* ── Health log timeline ── */}
          <div>
            <p className="mb-4 text-lg font-black uppercase tracking-tight text-white">
              Health Timeline
              <span className="ml-3 text-sm font-semibold text-white/25">
                ({animal._count?.health_logs ?? 0} total)
              </span>
            </p>

            {animal.health_logs.length === 0 ? (
              <EmptyState
                icon={HeartPulse}
                heading="No health logs yet"
                subtext="No veterinary records have been filed for this animal."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {animal.health_logs.map(log => (
                  <HealthLogCard key={String(log.log_id)} log={log} />
                ))}
                {animal._count?.health_logs > 10 && (
                  <p className="text-center text-[10px] text-white/25 py-2">
                    Showing 10 most recent entries of {animal._count.health_logs} total.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AnimalDetail;
