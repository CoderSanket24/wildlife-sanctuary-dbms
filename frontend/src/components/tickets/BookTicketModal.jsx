import React, { useEffect, useState } from "react";
import { X, Ticket, MapPin, IndianRupee, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { CLIMATE_META } from "../../constants/climateData";
import api from "../../api/axiosInstance";

/**
 * Modal for booking a new safari ticket.
 * Fetches available zones, lets the user pick one, shows price breakdown, and confirms.
 *
 * @param {Function} onClose            - Called when modal should close.
 * @param {Function} onBooked           - Called with the new ticket after a successful booking.
 * @param {number}   [preselectedZoneId] - Optional zone_id to auto-select (e.g. from ZoneDetail page).
 */
const BookTicketModal = ({ onClose, onBooked, preselectedZoneId }) => {
  const [zones, setZones]       = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(false);
  const [success, setSuccess]   = useState(null);  // booked ticket
  const [error, setError]       = useState(null);

  /* Fetch zones on mount; auto-select if preselectedZoneId is given */
  useEffect(() => {
    api.get("/zones")
      .then(res => {
        const list = res.data.zones ?? [];
        setZones(list);
        if (preselectedZoneId) {
          const match = list.find(z => z.zone_id === preselectedZoneId);
          if (match) setSelectedZone(match);
        }
      })
      .catch(() => setError("Could not load zones. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async () => {
    if (!selectedZone) return;
    setBooking(true);
    setError(null);
    try {
      const res = await api.post("/ticket/book", { zone_id: selectedZone.zone_id });
      setSuccess(res.data.ticket);
      onBooked(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.error ?? "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  /* GST is 18% for preview (actual is calculated server-side via stored procedure) */
  const basePrice  = selectedZone ? parseFloat(selectedZone.ticket_price) : 0;
  const gst        = +(basePrice * 0.18).toFixed(2);
  const total      = +(basePrice + gst).toFixed(2);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md overflow-hidden"
        style={{
          background:   "linear-gradient(145deg, rgba(13,26,15,0.98) 0%, rgba(9,18,10,0.99) 100%)",
          borderRadius: "20px",
          border:       "1px solid rgba(163,230,53,0.15)",
          boxShadow:    "0 0 60px rgba(163,230,53,0.08)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #a3e635, rgba(163,230,53,0.15), transparent)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5">
            <Ticket size={16} style={{ color: "#a3e635" }} />
            <p className="text-sm font-black uppercase tracking-[0.25em] text-white">Book a Safari</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.40)" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">

          {/* ── Success state ── */}
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center"
                style={{ background: "rgba(74,222,128,0.12)", borderRadius: "50%", color: "#4ade80" }}
              >
                <CheckCircle size={28} strokeWidth={1.5} />
              </div>
              <p className="text-lg font-black uppercase tracking-tight text-white">Ticket Booked!</p>
              <p className="text-[11px] text-white/40">
                Your safari ticket for <span className="text-lime-300">{success.zone?.name}</span> has been confirmed.
              </p>
              <div
                className="w-full px-4 py-3 text-center"
                style={{ background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.15)", borderRadius: "10px" }}
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">Total Paid</p>
                <p className="mt-0.5 text-2xl font-black text-white">
                  ₹{parseFloat(success.total_amount).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-1 w-full py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 transition hover:text-white"
                style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Zone picker */}
              <div className="mb-5">
                <p className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.28em] text-white/35">Select Zone</p>
                {loading ? (
                  <div className="h-11 animate-pulse" style={{ background: "rgba(163,230,53,0.05)", borderRadius: "10px" }} />
                ) : (
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(163,230,53,0.2) transparent" }}
                  >
                    {zones.map(zone => {
                      const meta    = CLIMATE_META[zone.climate] ?? CLIMATE_META.TROPICAL;
                      const active  = selectedZone?.zone_id === zone.zone_id;
                      return (
                        <button
                          key={zone.zone_id}
                          onClick={() => setSelectedZone(zone)}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-all"
                          style={{
                            background:   active ? "rgba(163,230,53,0.09)" : "rgba(255,255,255,0.02)",
                            border:       active ? "1px solid rgba(163,230,53,0.35)" : "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "10px",
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center"
                              style={{ background: meta.bg, borderRadius: "6px", color: meta.color }}
                            >
                              <meta.icon size={11} strokeWidth={2} />
                            </div>
                            <span className="truncate text-[12px] font-bold text-white/80">{zone.name}</span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <IndianRupee size={10} style={{ color: active ? "#a3e635" : "rgba(255,255,255,0.30)" }} />
                            <span className="text-[11px] font-black" style={{ color: active ? "#a3e635" : "rgba(255,255,255,0.40)" }}>
                              {parseFloat(zone.ticket_price).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price breakdown (shows when zone selected) */}
              {selectedZone && (
                <div
                  className="mb-5 px-4 py-3"
                  style={{ background: "rgba(163,230,53,0.04)", border: "1px solid rgba(163,230,53,0.10)", borderRadius: "12px" }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-white/35">Base Price</span>
                    <span className="text-[11px] font-semibold text-white/60">₹{basePrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/35">GST (18%)</span>
                    <span className="text-[11px] font-semibold text-white/60">₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">Total</span>
                    <span className="text-base font-black text-lime-300">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 text-[8px] text-white/18">* Final amount confirmed by server at booking time.</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-start gap-2 px-4 py-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "10px" }}>
                  <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-400" />
                  <p className="text-[11px] text-red-300">{error}</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleBook}
                disabled={!selectedZone || booking}
                className="w-full py-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all"
                style={{
                  background:   !selectedZone || booking ? "rgba(163,230,53,0.08)" : "rgba(163,230,53,1)",
                  color:        !selectedZone || booking ? "rgba(163,230,53,0.35)" : "#0d1a0f",
                  borderRadius: "10px",
                  border:       "1px solid rgba(163,230,53,0.20)",
                  cursor:       !selectedZone || booking ? "not-allowed" : "pointer",
                }}
              >
                {booking ? "Processing…" : "Confirm Booking"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTicketModal;
