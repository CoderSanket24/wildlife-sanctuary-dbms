import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import api from "../../../api/axiosInstance";
import { STATUS_COLOR } from "../shared/adminConstants";
import { Eyebrow, Modal, Inp, Sel, TableWrap, TableSkeleton, EmptyState, AddButton, DeleteButton, SubmitButton, inputStyle } from "../shared/adminComponents";

const HealthLogsTab = ({ toast }) => {
  const [logs, setLogs]         = useState([]);
  const [animals, setAnimals]   = useState([]);
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ animal_id: "", veterinarian_id: "", diagnosis: "", treatment: "", require_isolation: false });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/admin/health-logs"), api.get("/sanctuary"), api.get("/admin/staff")])
      .then(([l, a, s]) => { setLogs(l.data.logs); setAnimals(a.data.animals); setStaff(s.data.staff); })
      .catch(() => toast("Failed to load health logs.", "error"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const addLog = async e => {
    e.preventDefault();
    if (!form.animal_id || !form.veterinarian_id || !form.diagnosis || !form.treatment) { toast("All fields required.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/medical/logs", { ...form, animal_id: parseInt(form.animal_id), veterinarian_id: parseInt(form.veterinarian_id) });
      toast("Health log created.");
      setShowModal(false);
      setForm({ animal_id: "", veterinarian_id: "", diagnosis: "", treatment: "", require_isolation: false });
      load();
    } catch (err) {
      toast(err.response?.data?.error ?? "Failed to create log.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async id => {
    if (!window.confirm("Delete this health log?")) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/health-logs/${id}`);
      setLogs(v => v.filter(x => String(x.log_id) !== String(id)));
      toast("Health log deleted.");
    } catch {
      toast("Failed to delete.", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Clinical Records</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Health <span style={{ color: "#f87171" }}>Logs</span></h2>
        </div>
        <AddButton onClick={() => setShowModal(true)}><Plus size={12} /> Add Log</AddButton>
      </div>

      <TableWrap>
        <div className="grid grid-cols-[1fr_1fr_1.5fr_1.5fr_90px_44px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Animal</span><span>Vet</span><span>Diagnosis</span><span>Treatment</span><span>Date</span><span></span>
        </div>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : logs.length === 0 ? (
          <EmptyState message="No health logs found." />
        ) : (
          <div className="divide-y max-h-130 overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {logs.map(log => {
              const col = STATUS_COLOR[log.animal?.health_status] ?? "#a3e635";
              return (
                <div key={String(log.log_id)} className="grid grid-cols-[1fr_1fr_1.5fr_1.5fr_90px_44px] items-center gap-3 px-5 py-3">
                  <div>
                    <p className="truncate text-[12px] font-semibold" style={{ color: col }}>{log.animal?.nickname ?? log.animal?.species ?? "—"}</p>
                    <p className="text-[10px] text-white/28">{log.require_isolation ? "🔒 Isolation" : ""}</p>
                  </div>
                  <span className="truncate text-[11px] text-white/50">{log.veterinarian ? `${log.veterinarian.first_name} ${log.veterinarian.last_name}` : "—"}</span>
                  <span className="truncate text-[11px] text-white/55">{log.diagnosis}</span>
                  <span className="truncate text-[11px] text-white/40">{log.treatment}</span>
                  <span className="text-[10px] text-white/30">{new Date(log.logged_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</span>
                  <DeleteButton onClick={() => remove(log.log_id)} disabled={deleting === log.log_id} />
                </div>
              );
            })}
          </div>
        )}
      </TableWrap>

      {showModal && (
        <Modal title="Create Health Log" onClose={() => setShowModal(false)}>
          <form onSubmit={addLog} className="flex flex-col gap-4">
            <Sel label="Animal *" value={form.animal_id} onChange={e => setForm(f => ({ ...f, animal_id: e.target.value }))} required>
              <option value="" disabled>Select animal…</option>
              {animals.map(a => <option key={a.animal_id} value={a.animal_id} style={{ background: "#0d1a0f" }}>{a.nickname ? `${a.nickname} (${a.species})` : a.species}</option>)}
            </Sel>
            <Sel label="Veterinarian *" value={form.veterinarian_id} onChange={e => setForm(f => ({ ...f, veterinarian_id: e.target.value }))} required>
              <option value="" disabled>Select vet from staff…</option>
              {staff.map(s => <option key={s.staff_id} value={s.staff_id} style={{ background: "#0d1a0f" }}>{s.first_name} {s.last_name} — {s.role.replace("_", " ")}</option>)}
            </Sel>
            <Inp label="Diagnosis *" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} required placeholder="Describe the condition…" />
            <Inp label="Treatment *" value={form.treatment} onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} required placeholder="Prescribed treatment…" />
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.require_isolation} onChange={e => setForm(f => ({ ...f, require_isolation: e.target.checked }))} className="h-4 w-4 accent-lime-400" />
              <span className="text-[11px] font-semibold text-white/55">Requires Isolation (auto-sets status to QUARANTINED)</span>
            </label>
            <SubmitButton submitting={submitting} label="Save Health Log" loadingLabel="Saving…" />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HealthLogsTab;
