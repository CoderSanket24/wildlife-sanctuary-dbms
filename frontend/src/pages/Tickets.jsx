import React, { useEffect, useState } from "react";
import { Ticket, Plus, IndianRupee, MapPin } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import EmptyState from "../components/ui/EmptyState";
import TicketCard from "../components/tickets/TicketCard";
import BookTicketModal from "../components/tickets/BookTicketModal";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

/* ── Loading skeleton ── */
const TicketSkeleton = () => (
  <div className="grid gap-5 lg:grid-cols-2">
    {[1, 2, 3, 4].map(i => (
      <div
        key={i}
        className="animate-pulse"
        style={{
          background:   "rgba(13,26,15,0.60)",
          borderRadius: "18px",
          border:       "1px solid rgba(163,230,53,0.06)",
          height:       "200px",
        }}
      />
    ))}
  </div>
);

/* ════════════════════════════════════════
   MY TICKETS PAGE
════════════════════════════════════════ */
const Tickets = () => {
  const { user }      = useAuth();
  const [tickets, setTickets]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets/my");
      setTickets(res.data.tickets);
      setSummary(res.data.summary);   // from vw_visitor_booking_summary
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  /* Prepend newly booked ticket — summary will refresh on next fetch */
  const handleBooked = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        {/* ── Header row ── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            eyebrow="Abhayarnya · My Bookings"
            titlePlain="My"
            titleAccent="Tickets"
            subtitle="All your safari bookings in one place."
          />

          {/* Book button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex shrink-0 items-center gap-2 self-start px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-black transition-all hover:brightness-110 active:scale-95"
            style={{ background: "#a3e635", borderRadius: "8px" }}
          >
            <Plus size={13} />
            Book Safari
          </button>
        </div>

        {/* ── Summary chips — sourced from vw_visitor_booking_summary ── */}
        {!loading && !error && tickets.length > 0 && summary && (
          <div className="mb-8 flex flex-wrap gap-3">
            {/* Total bookings */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "12px" }}
            >
              <Ticket size={14} style={{ color: "rgba(163,230,53,0.55)" }} />
              <div>
                <p className="text-xl font-black text-white">{summary.total_bookings}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">
                  {summary.total_bookings === 1 ? "Booking" : "Bookings"}
                </p>
              </div>
            </div>

            {/* Zones visited */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "12px" }}
            >
              <MapPin size={14} style={{ color: "rgba(163,230,53,0.55)" }} />
              <div>
                <p className="text-xl font-black text-white">{summary.zones_visited}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">
                  {summary.zones_visited === 1 ? "Zone Visited" : "Zones Visited"}
                </p>
              </div>
            </div>

            {/* Total spent */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.15)", borderRadius: "12px" }}
            >
              <IndianRupee size={14} style={{ color: "rgba(212,168,83,0.70)" }} />
              <div>
                <p className="text-xl font-black" style={{ color: "#f5dfa0" }}>
                  {summary.total_spent.toLocaleString("en-IN")}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Total Spent</p>
              </div>
            </div>

            {/* Avg ticket cost — from view */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: "12px" }}
            >
              <IndianRupee size={14} style={{ color: "rgba(96,165,250,0.70)" }} />
              <div>
                <p className="text-xl font-black" style={{ color: "#93c5fd" }}>
                  {summary.avg_ticket_cost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Avg Cost</p>
              </div>
            </div>
          </div>
        )}

        {loading && <TicketSkeleton />}

        {!loading && error && <ErrorAlert message={error} />}

        {!loading && !error && tickets.length === 0 && (
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center"
              style={{ background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "50%" }}
            >
              <Ticket size={32} style={{ color: "rgba(163,230,53,0.25)" }} />
            </div>
            <div>
              <p className="text-lg font-black uppercase tracking-tight text-white/30">No bookings yet</p>
              <p className="mt-1 text-sm text-white/18">Book your first safari experience below.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-black"
              style={{ background: "#a3e635", borderRadius: "8px" }}
            >
              <Plus size={13} />
              Book Your First Safari
            </button>
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {tickets.map(t => (
              <TicketCard key={String(t.ticket_id)} ticket={t} />
            ))}
          </div>
        )}

      </div>

      {/* ── Book ticket modal ── */}
      {showModal && (
        <BookTicketModal
          onClose={() => setShowModal(false)}
          onBooked={(newTicket) => {
            handleBooked(newTicket);
            setShowModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Tickets;
