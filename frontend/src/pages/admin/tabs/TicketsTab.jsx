import React, { useState, useEffect } from "react";
import { Ticket, IndianRupee, QrCode, ShieldCheck, CheckCircle2, AlertTriangle, Download, Search } from "lucide-react";
import api from "../../../api/axiosInstance";
import { Eyebrow, TableWrap, TableSkeleton, EmptyState } from "../shared/adminComponents";

const TicketsTab = ({ toast }) => {
  const [tickets, setTickets]       = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  
  // Scanner state
  const [scanInput, setScanInput]   = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { type: 'success' | 'warning' | 'error', message, ticket }

  const fetchTickets = () => {
    api.get("/admin/tickets")
      .then(r => { setTickets(r.data.tickets); setSummary(r.data.summary); })
      .catch(() => toast?.("Failed to load tickets.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Parse ID string (handles "19", "#19", "#TKT-19", etc.)
  const parseTicketId = (str) => {
    const cleaned = String(str).replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : null;
  };

  // Perform Gate Check-In
  const handleCheckIn = async (idToUse = null) => {
    const targetId = idToUse || parseTicketId(scanInput);
    if (!targetId) {
      setScanResult({ type: "error", message: "Please enter a valid numeric Ticket ID." });
      return;
    }

    setScanLoading(true);
    setScanResult(null);

    try {
      const res = await api.post("/tickets/check-in", { ticket_id: targetId });
      setScanResult({
        type: "success",
        message: res.data.message || `Entry Approved for Ticket #${targetId}!`,
        ticket: res.data.ticket
      });
      toast?.(`Ticket #${targetId} admitted successfully!`, "success");
      // Update local state
      setTickets(prev => prev.map(t => String(t.ticket_id) === String(targetId) ? { ...t, status: "CHECKED_IN", checked_in_at: new Date() } : t));
      setScanInput("");
    } catch (err) {
      const data = err.response?.data;
      if (data?.alreadyCheckedIn) {
        setScanResult({
          type: "warning",
          message: data.message,
          ticket: data.ticket
        });
        toast?.(`Ticket #${targetId} was already admitted.`, "warning");
      } else {
        setScanResult({
          type: "error",
          message: data?.error || "Ticket not found or check-in rejected.",
          ticket: null
        });
        toast?.(data?.error || "Check-in failed.", "error");
      }
    } finally {
      setScanLoading(false);
    }
  };

  // Download PDF helper
  const handleDownloadPdf = async (ticketId) => {
    try {
      const res = await api.get(`/tickets/${ticketId}/pdf`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Abhayarnya_Ticket_${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast?.("Failed to download ticket PDF.", "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Booking Ledger & Gate Control</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            All <span style={{ color: "#fbbf24" }}>Tickets</span> & Gate Scanner
          </h2>
        </div>
      </div>

      {/* ── Summary Counters ──────────────────────────────────────────────── */}
      {summary && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-3 px-5 py-3" style={{ background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "12px" }}>
            <Ticket size={14} style={{ color: "rgba(163,230,53,0.55)" }} />
            <div>
              <p className="text-xl font-black text-white">{summary.total_tickets}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Total Bookings</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "12px" }}>
            <IndianRupee size={14} style={{ color: "rgba(251,191,36,0.70)" }} />
            <div>
              <p className="text-xl font-black" style={{ color: "#f5dfa0" }}>₹{summary.total_revenue.toLocaleString("en-IN")}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Total Gross Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Gate Entry Check-In Scanner ──────────────────────── */}
      <div 
        className="mb-8 p-5 rounded-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15,31,18,0.95) 0%, rgba(9,19,11,0.98) 100%)",
          border: "1px solid rgba(163,230,53,0.18)"
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <QrCode size={16} className="text-lime-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Electronic Gate Entry Scanner</h3>
          <span className="ml-auto text-[9px] font-mono uppercase tracking-widest text-lime-400/60 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
            Checkpoint Terminal
          </span>
        </div>

        <p className="text-xs text-white/45 mb-4">
          Scan the visitor's printed or mobile QR code, or manually input the Ticket ID to validate entry and seal checkpoint check-in.
        </p>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan or enter Ticket ID (e.g. 19 or TKT-19)..."
              className="w-full pl-9 pr-4 py-2.5 text-xs text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/60 transition"
            />
          </div>
          <button
            type="submit"
            disabled={scanLoading || !scanInput.trim()}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-lime-400 hover:bg-lime-300 active:scale-95 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ShieldCheck size={14} />
            <span>{scanLoading ? "Verifying..." : "Admit Visitor"}</span>
          </button>
        </form>

        {/* Scanner Feedback Alert Box */}
        {scanResult && (
          <div 
            className={`mt-4 p-4 rounded-xl border flex items-start gap-3 transition-all ${
              scanResult.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : scanResult.type === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {scanResult.type === "success" && <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />}
            {scanResult.type === "warning" && <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />}
            {scanResult.type === "error"   && <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-400" />}
            
            <div className="flex-1 text-xs">
              <p className="font-bold mb-0.5">{scanResult.message}</p>
              {scanResult.ticket && (
                <p className="text-[11px] opacity-80 mt-1">
                  Visitor: <strong className="text-white">{scanResult.ticket.visitor?.first_name} {scanResult.ticket.visitor?.last_name}</strong> • 
                  Zone: <strong className="text-white">{scanResult.ticket.zone?.name}</strong> • 
                  Pass: #{scanResult.ticket.ticket_id}
                </p>
              )}
            </div>
            <button 
              onClick={() => setScanResult(null)} 
              className="text-[10px] uppercase font-bold tracking-wider opacity-60 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ── Tickets Table ─────────────────────────────────────────────────── */}
      <TableWrap>
        <div className="grid grid-cols-[1.4fr_1.3fr_1fr_90px_100px_120px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Visitor</span>
          <span>Safari Zone</span>
          <span>Booking Date</span>
          <span>Total ₹</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : tickets.length === 0 ? (
          <EmptyState message="No tickets found in sanctuary registry." />
        ) : (
          <div className="divide-y max-h-130 overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {tickets.map(t => {
              const isCheckedIn = (t.status || "CONFIRMED") === "CHECKED_IN";
              return (
                <div key={String(t.ticket_id)} className="grid grid-cols-[1.4fr_1.3fr_1fr_90px_100px_120px] items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition">
                  <div>
                    <p className="truncate text-[12px] font-semibold text-white/80">
                      {t.visitor?.first_name} {t.visitor?.last_name}
                    </p>
                    <p className="truncate text-[10px] text-white/30 font-mono">
                      #{String(t.ticket_id).padStart(6, "0")} • {t.visitor?.email}
                    </p>
                  </div>

                  <div>
                    <p className="truncate text-[12px] text-white/70">{t.zone?.name ?? "—"}</p>
                    <span className="text-[9px] uppercase tracking-wider text-lime-400/50">{t.zone?.climate}</span>
                  </div>

                  <span className="text-[11px] text-white/40">
                    {new Date(t.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>

                  <span className="text-[12px] font-bold" style={{ color: "#fbbf24" }}>
                    ₹{parseFloat(t.total_amount).toLocaleString("en-IN")}
                  </span>

                  <div>
                    {isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/25">
                        <ShieldCheck size={10} />
                        Admitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                        <CheckCircle2 size={10} />
                        Confirmed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    {!isCheckedIn && (
                      <button
                        onClick={() => handleCheckIn(t.ticket_id)}
                        className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                        title="Admit visitor at gate"
                      >
                        Admit
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadPdf(t.ticket_id)}
                      className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                      title="Download PDF E-Ticket"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TableWrap>
    </div>
  );
};

export default TicketsTab;
