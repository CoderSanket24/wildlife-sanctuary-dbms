import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Ticket, ArrowRight, IndianRupee, Download, CheckCircle2, ShieldCheck } from "lucide-react";
import { CLIMATE_META } from "../../constants/climateData";
import api from "../../api/axiosInstance";

/**
 * Single ticket card shown in the My Tickets listing.
 *
 * @param {{ ticket_id, booking_date, base_cost, gst_amount, total_amount, zone, status }} ticket
 */
const TicketCard = ({ ticket }) => {
  const [downloading, setDownloading] = useState(false);
  const climate     = ticket.zone?.climate;
  const climateMeta = climate ? (CLIMATE_META[climate] ?? CLIMATE_META.TROPICAL) : null;
  const status      = ticket.status || "CONFIRMED";

  const handleDownloadPdf = async (e) => {
    e.preventDefault();
    try {
      setDownloading(true);
      const res = await api.get(`/tickets/${ticket.ticket_id}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Abhayarnya_Ticket_${ticket.ticket_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF ticket pass:", err);
    } finally {
      setDownloading(false);
    }
  };

  const bookingDate = new Date(ticket.booking_date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const bookingTime = new Date(ticket.booking_date).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background:           "linear-gradient(145deg, rgba(13,26,15,0.90) 0%, rgba(9,18,10,0.96) 100%)",
        borderRadius:         "18px",
        border:               "1px solid rgba(163,230,53,0.10)",
        backdropFilter:       "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderRadius: "18px",
          boxShadow:    "0 0 32px 2px rgba(163,230,53,0.10)",
          border:       "1px solid rgba(163,230,53,0.25)",
        }}
      />

      {/* Ticket perforation line (decorative) */}
      <div
        className="relative flex items-center gap-1 px-5"
        style={{ borderBottom: "1.5px dashed rgba(255,255,255,0.06)" }}
      >
        {/* Left notch */}
        <div
          className="absolute -left-3 h-6 w-6 rounded-full"
          style={{ background: "rgba(6,14,7,1)" }}
        />
        {/* Right notch */}
        <div
          className="absolute -right-3 h-6 w-6 rounded-full"
          style={{ background: "rgba(6,14,7,1)" }}
        />

        {/* Zone name + climate */}
        <div className="flex flex-1 items-center justify-between py-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Ticket size={11} style={{ color: "rgba(163,230,53,0.50)" }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-lime-300/50">
                Safari Ticket
              </span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              {ticket.zone?.name ?? "Unknown Zone"}
            </h3>
          </div>

          {/* Status pill & Climate pill */}
          <div className="flex items-center gap-2">
            {status === "CHECKED_IN" ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/25">
                <ShieldCheck size={10} />
                <span>Admitted</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                <CheckCircle2 size={10} />
                <span>Confirmed</span>
              </div>
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
                <span className="text-[9px] font-bold uppercase tracking-[0.18em]">{climateMeta.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket body */}
      <div className="px-5 py-4">
        <div className="flex items-end justify-between gap-4">

          {/* Left: date + ticket ID */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Calendar size={11} style={{ color: "rgba(163,230,53,0.40)" }} />
              <span className="text-[11px] text-white/50">{bookingDate}</span>
              <span className="text-[10px] text-white/25">{bookingTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={11} style={{ color: "rgba(163,230,53,0.40)" }} />
              <span className="text-[10px] text-white/35">Abhayarnya Wildlife Sanctuary</span>
            </div>
            <span className="font-mono text-[9px] text-white/18 tracking-widest">
              #{String(ticket.ticket_id).padStart(8, "0")}
            </span>
          </div>

          {/* Right: price breakdown */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-0.5 text-[10px] text-white/30">
              <IndianRupee size={9} />
              <span>{parseFloat(ticket.base_cost).toLocaleString("en-IN")}</span>
              <span className="ml-1">base</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-white/25">
              <IndianRupee size={9} />
              <span>{parseFloat(ticket.gst_amount).toLocaleString("en-IN")}</span>
              <span className="ml-1">GST</span>
            </div>
            <div
              className="mt-1 flex items-center gap-1 px-2.5 py-1.5"
              style={{
                background:   "rgba(163,230,53,0.08)",
                border:       "1px solid rgba(163,230,53,0.20)",
                borderRadius: "8px",
              }}
            >
              <IndianRupee size={12} className="text-lime-300" />
              <span className="text-base font-black text-white">
                {parseFloat(ticket.total_amount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Action bar: PDF Download + Zone Link */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/6 gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-lime-300 bg-lime-400/10 hover:bg-lime-400/20 active:scale-95 border border-lime-400/25 rounded-lg transition cursor-pointer disabled:opacity-50"
            title="Download official branded PDF entry pass with QR code"
          >
            <Download size={11} className={downloading ? "animate-pulse" : ""} />
            <span>{downloading ? "Generating PDF..." : "Download E-Ticket"}</span>
          </button>

          {ticket.zone?.zone_id && (
            <Link
              to={`/dashboard/zones/${ticket.zone.zone_id}`}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 transition hover:text-lime-300/80"
            >
              <span>Zone Info</span>
              <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
