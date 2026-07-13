import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import api from "../../../api/axiosInstance";
import { CLIMATE_COLOR } from "../shared/adminConstants";
import { Eyebrow, Badge, Modal, Inp, Sel, TableWrap, TableSkeleton, EmptyState, AddButton, DeleteButton, SubmitButton } from "../shared/adminComponents";

const ZonesTab = ({ toast }) => {
  const [zones, setZones]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm]         = useState({ name: "", climate: "TROPICAL", camera_traps_count: "", ticket_price: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/zones")
      .then(r => setZones(r.data.zones ?? []))
      .catch(() => toast("Failed to load zones.", "error"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const addZone = async e => {
    e.preventDefault();
    if (!form.name || !form.ticket_price) { toast("Name and ticket price are required.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/zones/add", { ...form, camera_traps_count: parseInt(form.camera_traps_count) || 0, ticket_price: parseFloat(form.ticket_price) });
      toast("Zone created successfully.");
      setShowModal(false);
      setForm({ name: "", climate: "TROPICAL", camera_traps_count: "", ticket_price: "" });
      load();
    } catch (err) {
      toast(err.response?.data?.error ?? "Failed to create zone.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async zone_id => {
    if (!window.confirm("Delete this zone? This will cascade to all enclosures, animals, and tickets.")) return;
    setDeleting(zone_id);
    try {
      await api.delete(`/admin/zones/${zone_id}`);
      setZones(z => z.filter(x => x.zone_id !== zone_id));
      toast("Zone deleted.");
    } catch {
      toast("Failed to delete zone.", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Sanctuary Zones</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Manage <span style={{ color: "#fbbf24" }}>Zones</span></h2>
        </div>
        <AddButton onClick={() => setShowModal(true)}><Plus size={12} /> Add Zone</AddButton>
      </div>

      <TableWrap>
        <div className="grid grid-cols-[1.5fr_1fr_80px_80px_100px_100px_44px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Name</span><span>Climate</span><span>Animals</span><span>Cameras</span><span>Price ₹</span><span>Revenue ₹</span><span></span>
        </div>
        {loading ? (
          <TableSkeleton rows={3} />
        ) : zones.length === 0 ? (
          <EmptyState message="No zones configured." />
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {zones.map(z => (
              <div key={z.zone_id} className="grid grid-cols-[1.5fr_1fr_80px_80px_100px_100px_44px] items-center gap-3 px-5 py-3">
                <span className="truncate text-[13px] font-semibold text-white/80">{z.name}</span>
                <Badge label={z.climate} color={CLIMATE_COLOR[z.climate] ?? "#a3e635"} />
                <span className="text-[12px] text-white/45">{z.total_animals ?? 0}</span>
                <span className="text-[12px] text-white/45">{z.camera_traps_count ?? 0}</span>
                <span className="text-[12px] text-white/60">₹{parseFloat(z.ticket_price ?? 0).toLocaleString("en-IN")}</span>
                <span className="text-[12px]" style={{ color: "#fbbf24" }}>₹{parseFloat(z.total_revenue ?? 0).toLocaleString("en-IN")}</span>
                <DeleteButton onClick={() => remove(z.zone_id)} disabled={deleting === z.zone_id} />
              </div>
            ))}
          </div>
        )}
      </TableWrap>

      {showModal && (
        <Modal title="Add New Zone" onClose={() => setShowModal(false)}>
          <form onSubmit={addZone} className="flex flex-col gap-4">
            <Inp label="Zone Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Northern Wetlands" />
            <div className="grid grid-cols-2 gap-3">
              <Sel label="Climate Type *" value={form.climate} onChange={e => setForm(f => ({ ...f, climate: e.target.value }))}>
                {["TROPICAL", "TEMPERATE", "ARID", "WETLAND", "ALPINE"].map(c => <option key={c} value={c} style={{ background: "#0d1a0f" }}>{c}</option>)}
              </Sel>
              <Inp label="Camera Traps" type="number" min="0" value={form.camera_traps_count} onChange={e => setForm(f => ({ ...f, camera_traps_count: e.target.value }))} placeholder="0" />
            </div>
            <Inp label="Ticket Price (₹) *" type="number" min="0" step="0.01" value={form.ticket_price} onChange={e => setForm(f => ({ ...f, ticket_price: e.target.value }))} required placeholder="e.g. 500" />
            <SubmitButton submitting={submitting} label="Create Zone" loadingLabel="Creating…" />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ZonesTab;
