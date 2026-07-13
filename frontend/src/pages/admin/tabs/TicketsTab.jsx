import React, { useState, useEffect } from "react";
import { Ticket, IndianRupee } from "lucide-react";
import api from "../../../api/axiosInstance";
import { Eyebrow, TableWrap, TableSkeleton, EmptyState } from "../shared/adminComponents";

const TicketsTab = ({ toast }) => {
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/tickets")
      .then(r => { setTickets(r.data.tickets); setSummary(r.data.summary); })
      .catch(() => toast("Failed to load tickets.", "error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <Eyebrow>Booking Ledger</Eyebrow>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">All <span style={{ color: "#fbbf24" }}>Tickets</span></h2>
      </div>

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
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Total Revenue</p>
            </div>
          </div>
        </div>
      )}

      <TableWrap>
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_80px_100px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Visitor</span><span>Zone</span><span>Date</span><span>Base ₹</span><span>Total ₹</span>
        </div>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : tickets.length === 0 ? (
          <EmptyState message="No tickets found." />
        ) : (
          <div className="divide-y max-h-130 overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {tickets.map(t => (
              <div key={String(t.ticket_id)} className="grid grid-cols-[1.5fr_1.5fr_1fr_80px_100px] items-center gap-3 px-5 py-3">
                <div>
                  <p className="truncate text-[12px] font-semibold text-white/75">{t.visitor?.first_name} {t.visitor?.last_name}</p>
                  <p className="truncate text-[10px] text-white/28">{t.visitor?.email}</p>
                </div>
                <span className="truncate text-[12px] text-white/55">{t.zone?.name ?? "—"}</span>
                <span className="text-[11px] text-white/38">{new Date(t.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="text-[12px] text-white/45">₹{parseFloat(t.base_cost).toLocaleString("en-IN")}</span>
                <span className="text-[12px] font-bold" style={{ color: "#fbbf24" }}>₹{parseFloat(t.total_amount).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}
      </TableWrap>
    </div>
  );
};

export default TicketsTab;
