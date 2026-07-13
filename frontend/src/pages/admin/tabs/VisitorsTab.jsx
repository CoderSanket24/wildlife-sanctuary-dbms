import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import api from "../../../api/axiosInstance";
import { ROLE_COLOR } from "../shared/adminConstants";
import { Eyebrow, TableWrap, TableSkeleton, EmptyState, inputStyle } from "../shared/adminComponents";

const VisitorsTab = ({ toast }) => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/admin/visitors")
      .then(r => setVisitors(r.data.visitors))
      .catch(() => toast("Failed to load visitors.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const changeRole = async (visitor_id, role) => {
    setUpdating(visitor_id);
    try {
      await api.put(`/admin/visitors/${visitor_id}/role`, { role });
      setVisitors(v => v.map(x => x.visitor_id === visitor_id ? { ...x, role } : x));
      toast("Role updated successfully.");
    } catch (e) {
      toast(e.response?.data?.error ?? "Failed to update role.", "error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Member Registry</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">All <span style={{ color: "#60a5fa" }}>Visitors</span></h2>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 transition hover:text-white/60">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      <TableWrap>
        <div className="grid grid-cols-[1fr_1.5fr_80px_80px_130px] gap-4 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Name</span><span>Email</span><span>Age</span><span>Bookings</span><span>Access</span>
        </div>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : visitors.length === 0 ? (
          <EmptyState message="No visitors found." />
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {visitors.map(v => (
              <div key={v.visitor_id} className="grid grid-cols-[1fr_1.5fr_80px_80px_130px] items-center gap-4 px-5 py-3">
                <span className="truncate text-[13px] font-semibold text-white/75">{v.first_name} {v.last_name}</span>
                <span className="truncate text-[11px] text-white/38">{v.email}</span>
                <span className="text-[12px] text-white/45">{v.age}</span>
                <span className="text-[12px] text-white/45">{v._count?.tickets ?? 0}</span>
                <select
                  value={v.role}
                  disabled={updating === v.visitor_id}
                  onChange={e => changeRole(v.visitor_id, e.target.value)}
                  className="cursor-pointer px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] transition"
                  style={{ ...inputStyle, color: ROLE_COLOR[v.role], fontSize: "10px" }}
                >
                  <option value="VISITOR">Visitor</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </TableWrap>
    </div>
  );
};

export default VisitorsTab;
