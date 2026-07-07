import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Hash,
  Leaf,
  ArrowRight,
  LogOut,
  Ticket,
  MapPin,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

/* ── single info row ── */
const InfoRow = ({ icon: Icon, label, value, accent }) => (
  <div
    className="flex items-center gap-4 py-4"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
  >
    {/* icon */}
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center"
      style={{
        background: "rgba(163,230,53,0.07)",
        border: "1px solid rgba(163,230,53,0.12)",
        borderRadius: "8px",
        color: "rgba(163,230,53,0.55)",
      }}
    >
      <Icon size={14} strokeWidth={1.8} />
    </div>

    {/* label + value */}
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/25 mb-0.5">
        {label}
      </p>
      <p
        className="text-[13px] font-semibold truncate"
        style={{ color: accent ? "rgba(163,230,53,0.85)" : "rgba(255,255,255,0.75)" }}
      >
        {value ?? "—"}
      </p>
    </div>
  </div>
);

/* ════════════════════════════════════════
   PROFILE PAGE
════════════════════════════════════════ */
const Profile = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  /* Fetch visitor booking summary from the view-backed endpoint */
  useEffect(() => {
    api.get("/ticket/my")
      .then(res => setSummary(res.data.summary))
      .catch(() => {}); // non-critical — page still works without it
  }, []);

  const initials =
    user
      ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
      : "?";

  const handleLogout = async () => {
    await logoutUser();
    navigate("/signin");
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        {/* ── Page heading ── */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2.5">
            <Leaf size={12} className="text-lime-300/50" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-300/50">
              Abhayarnya · Member Portal
            </p>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
            Your <span style={{ color: "#a3e635" }}>Profile</span>
          </h1>
          <p className="mt-2 text-sm text-white/28">
            View and manage your sanctuary membership details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* ════════════
              LEFT — Avatar card
          ════════════ */}
          <div className="flex flex-col gap-4">

            {/* Avatar panel */}
            <div
              className="flex flex-col items-center gap-4 p-8"
              style={{
                background: "linear-gradient(145deg, rgba(13,26,15,0.88) 0%, rgba(9,18,10,0.95) 100%)",
                borderRadius: "20px",
                border: "1px solid rgba(163,230,53,0.10)",
              }}
            >
              {/* Top lime accent */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{
                  background: "linear-gradient(90deg,#a3e635,rgba(163,230,53,0.2),transparent)",
                  borderRadius: "20px 20px 0 0",
                }}
              />

              {/* Avatar circle */}
              <div
                className="flex h-24 w-24 items-center justify-center text-3xl font-black text-black"
                style={{
                  background: "linear-gradient(135deg,#a3e635 0%,#7aa028 100%)",
                  borderRadius: "50%",
                  boxShadow: "0 0 40px rgba(163,230,53,0.28), 0 0 0 4px rgba(163,230,53,0.12)",
                }}
              >
                {initials}
              </div>

              {/* Name */}
              <div className="text-center">
                <p className="text-lg font-black uppercase tracking-tight text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/30">
                  {user?.email}
                </p>
              </div>

              {/* Role badge */}
              <div
                className="flex items-center gap-2 px-4 py-1.5"
                style={{
                  background: "rgba(163,230,53,0.08)",
                  border: "1px solid rgba(163,230,53,0.18)",
                  borderRadius: "999px",
                }}
              >
                <Shield size={11} className="text-lime-300/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-lime-300/70">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 border py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-red-400/60 transition-all hover:bg-red-500/8 hover:text-red-400 hover:border-red-500/30"
              style={{
                borderColor: "rgba(239,68,68,0.18)",
                borderRadius: "12px",
              }}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>

          {/* ════════════
              RIGHT — Info card
          ════════════ */}
          <div
            style={{
              background: "linear-gradient(145deg, rgba(13,26,15,0.85) 0%, rgba(9,18,10,0.92) 100%)",
              borderRadius: "20px",
              border: "1px solid rgba(163,230,53,0.10)",
            }}
          >
            {/* Card header */}
            <div
              className="px-6 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              {/* Lime top accent line */}
              <div
                className="mb-4 h-0.5 w-12"
                style={{ background: "#a3e635" }}
              />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/25">
                Account Information
              </p>
            </div>

            {/* Info rows */}
            <div className="px-6">
              <InfoRow
                icon={User}
                label="Full Name"
                value={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
              />
              <InfoRow
                icon={Mail}
                label="Email Address"
                value={user?.email}
              />
              <InfoRow
                icon={Hash}
                label="Visitor ID"
                value={user?.visitor_id ? `#${user.visitor_id}` : null}
              />
              <InfoRow
                icon={Shield}
                label="Role"
                value={user?.role}
                accent
              />
              <InfoRow
                icon={Calendar}
                label="Age"
                value={user?.age ? `${user.age} years old` : null}
              />
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : null
                }
              />
            </div>

            {/* Card footer */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-[10px] text-white/20">
                To update your details, contact sanctuary admin.
              </p>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-lime-300/40 transition hover:text-lime-300"
              >
                Back to Overview
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>

        </div>

        {/* Nature note */}
        <div
          className="mt-6 flex items-start gap-3 px-5 py-4"
          style={{
            background: "rgba(163,230,53,0.03)",
            border: "1px solid rgba(163,230,53,0.08)",
            borderRadius: "12px",
          }}
        >
          <Leaf size={13} className="mt-0.5 shrink-0 text-lime-300/40" />
          <p className="text-[11px] leading-relaxed text-white/22">
            Thank you for being a valued member of Abhayarnya Wildlife Sanctuary.
            Your visits directly fund conservation efforts and animal welfare programs.
          </p>
        </div>

        {/* ── Activity Stats (from vw_visitor_booking_summary) ── */}
        {summary && (
          <div className="mt-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-white/25">
              Your Activity
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Total Bookings */}
              <div
                className="flex flex-col gap-2 p-4"
                style={{ background: "rgba(163,230,53,0.05)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "14px" }}
              >
                <Ticket size={14} style={{ color: "rgba(163,230,53,0.55)" }} />
                <p className="text-2xl font-black text-white">{summary.total_bookings}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">
                  {summary.total_bookings === 1 ? "Booking" : "Bookings"}
                </p>
              </div>

              {/* Zones Visited */}
              <div
                className="flex flex-col gap-2 p-4"
                style={{ background: "rgba(163,230,53,0.05)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "14px" }}
              >
                <MapPin size={14} style={{ color: "rgba(163,230,53,0.55)" }} />
                <p className="text-2xl font-black text-white">{summary.zones_visited}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">
                  {summary.zones_visited === 1 ? "Zone Visited" : "Zones Visited"}
                </p>
              </div>

              {/* Total Spent */}
              <div
                className="flex flex-col gap-2 p-4"
                style={{ background: "rgba(212,168,83,0.05)", border: "1px solid rgba(212,168,83,0.14)", borderRadius: "14px" }}
              >
                <IndianRupee size={14} style={{ color: "rgba(212,168,83,0.65)" }} />
                <p className="text-2xl font-black" style={{ color: "#f5dfa0" }}>
                  {summary.total_spent.toLocaleString("en-IN")}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Total Spent</p>
              </div>

              {/* Last Visit */}
              <div
                className="flex flex-col gap-2 p-4"
                style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.14)", borderRadius: "14px" }}
              >
                <TrendingUp size={14} style={{ color: "rgba(96,165,250,0.65)" }} />
                <p className="text-sm font-black leading-tight" style={{ color: "#93c5fd" }}>
                  {summary.last_booking_date
                    ? new Date(summary.last_booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Last Visit</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Profile;
