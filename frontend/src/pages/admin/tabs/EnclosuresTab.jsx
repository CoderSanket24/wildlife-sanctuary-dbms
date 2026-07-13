import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import api from "../../../api/axiosInstance";
import { Eyebrow, Modal, Inp, Sel, TableWrap, TableSkeleton, EmptyState, AddButton, DeleteButton, SubmitButton } from "../shared/adminComponents";

const EnclosuresTab = ({ toast }) => {
  const [enclosures, setEnclosures] = useState([]);
  const [zones, setZones]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deleting, setDeleting]     = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ zone_id: "", code_name: "", max_capacity: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/admin/enclosures"), api.get("/zones")])
      .then(([e, z]) => { setEnclosures(e.data.enclosures); setZones(z.data.zones ?? []); })
      .catch(() => toast("Failed to load enclosures.", "error"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const addEnclosure = async e => {
    e.preventDefault();
    if (!form.zone_id || !form.code_name || !form.max_capacity) { toast("All fields required.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/sanctuary/enclosures", { zone_id: parseInt(form.zone_id), code_name: form.code_name, max_capacity: parseInt(form.max_capacity) });
      toast("Enclosure created.");
      setShowModal(false);
      setForm({ zone_id: "", code_name: "", max_capacity: "" });
      load();
    } catch (err) {
      toast(err.response?.data?.error ?? "Failed to create enclosure.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async id => {
    if (!window.confirm("Delete this enclosure? All animals inside will become unassigned.")) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/enclosures/${id}`);
      setEnclosures(v => v.filter(x => x.enclosure_id !== id));
      toast("Enclosure deleted.");
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
          <Eyebrow>Habitat Registry</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Manage <span style={{ color: "#818cf8" }}>Enclosures</span></h2>
        </div>
        <AddButton onClick={() => setShowModal(true)}><Plus size={12} /> Add Enclosure</AddButton>
      </div>

      <TableWrap>
        <div className="grid grid-cols-[1fr_1.5fr_80px_80px_80px_44px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Code Name</span><span>Zone</span><span>Capacity</span><span>Occupancy</span><span>Animals</span><span></span>
        </div>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : enclosures.length === 0 ? (
          <EmptyState message="No enclosures found." />
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {enclosures.map(enc => (
              <div key={enc.enclosure_id} className="grid grid-cols-[1fr_1.5fr_80px_80px_80px_44px] items-center gap-3 px-5 py-3">
                <span className="truncate text-[13px] font-bold text-white/80">{enc.code_name}</span>
                <span className="truncate text-[11px] text-white/45">{enc.zone?.name ?? "—"}</span>
                <span className="text-[12px] text-white/45">{enc.max_capacity}</span>
                <span className="text-[12px] text-white/45">{enc.current_occupancy}</span>
                <span className="text-[12px] text-white/45">{enc._count?.animals ?? 0}</span>
                <DeleteButton onClick={() => remove(enc.enclosure_id)} disabled={deleting === enc.enclosure_id} />
              </div>
            ))}
          </div>
        )}
      </TableWrap>

      {showModal && (
        <Modal title="Add Enclosure" onClose={() => setShowModal(false)}>
          <form onSubmit={addEnclosure} className="flex flex-col gap-4">
            <Sel label="Zone *" value={form.zone_id} onChange={e => setForm(f => ({ ...f, zone_id: e.target.value }))} required>
              <option value="" disabled>Select zone…</option>
              {zones.map(z => <option key={z.zone_id} value={z.zone_id} style={{ background: "#0d1a0f" }}>{z.name}</option>)}
            </Sel>
            <Inp label="Code Name *" value={form.code_name} onChange={e => setForm(f => ({ ...f, code_name: e.target.value }))} required placeholder="e.g. ALPHA-01" />
            <Inp label="Max Capacity *" type="number" min="1" value={form.max_capacity} onChange={e => setForm(f => ({ ...f, max_capacity: e.target.value }))} required placeholder="e.g. 10" />
            <SubmitButton submitting={submitting} label="Create Enclosure" loadingLabel="Creating…" />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EnclosuresTab;
