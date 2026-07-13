import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import api from "../../../api/axiosInstance";
import { STATUS_COLOR, HEALTH_STATUSES } from "../shared/adminConstants";
import { Eyebrow, Modal, Inp, Sel, TableWrap, TableSkeleton, EmptyState, AddButton, DeleteButton, SubmitButton, inputStyle } from "../shared/adminComponents";

const AnimalsTab = ({ toast }) => {
  const [animals, setAnimals]       = useState([]);
  const [enclosures, setEnclosures] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [form, setForm]             = useState({ enclosure_id: "", species: "", scientific_name: "", nickname: "", birth_date: "", health_status: "HEALTHY" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/sanctuary")
      .then(r => setAnimals(r.data.animals))
      .catch(() => toast("Failed to load animals.", "error"))
      .finally(() => setLoading(false));

    api.get("/zones").then(async r => {
      const zones = r.data.zones ?? [];
      const enc = [];
      await Promise.all(zones.map(z =>
        api.get(`/zones/${z.zone_id}`).then(res => {
          (res.data.zone?.enclosures ?? []).forEach(e => enc.push({ ...e, zone_name: res.data.zone.name }));
        }).catch(() => {})
      ));
      setEnclosures(enc);
    }).catch(() => {});
  }, []);

  useEffect(load, [load]);

  const registerAnimal = async e => {
    e.preventDefault();
    if (!form.species) { toast("Species is required.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/sanctuary/animals", {
        ...form,
        enclosure_id: form.enclosure_id ? parseInt(form.enclosure_id, 10) : null,
        birth_date: form.birth_date || null,
      });
      toast("Animal registered successfully.");
      setShowModal(false);
      setForm({ enclosure_id: "", species: "", scientific_name: "", nickname: "", birth_date: "", health_status: "HEALTHY" });
      setLoading(true);
      api.get("/sanctuary").then(r => setAnimals(r.data.animals)).finally(() => setLoading(false));
    } catch (err) {
      toast(err.response?.data?.error ?? "Failed to register animal.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (animal_id, health_status) => {
    try {
      await api.put(`/admin/animals/${animal_id}/status`, { health_status });
      setAnimals(a => a.map(x => x.animal_id === animal_id ? { ...x, health_status } : x));
      toast("Status updated.");
    } catch {
      toast("Failed to update status.", "error");
    }
  };

  const remove = async animal_id => {
    if (!window.confirm("Remove this animal from the registry?")) return;
    setDeleting(animal_id);
    try {
      await api.delete(`/admin/animals/${animal_id}`);
      setAnimals(a => a.filter(x => x.animal_id !== animal_id));
      toast("Animal removed.");
    } catch {
      toast("Failed to remove animal.", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Fauna Registry</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Manage <span style={{ color: "#a3e635" }}>Animals</span></h2>
        </div>
        <AddButton onClick={() => setShowModal(true)}><Plus size={12} /> Add Animal</AddButton>
      </div>

      <TableWrap>
        <div className="grid grid-cols-[1fr_1fr_1fr_130px_44px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Species</span><span>Nickname</span><span>Zone / Enclosure</span><span>Status</span><span></span>
        </div>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : animals.length === 0 ? (
          <EmptyState message="No animals registered." />
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {animals.map(a => (
              <div key={a.animal_id} className="grid grid-cols-[1fr_1fr_1fr_130px_44px] items-center gap-3 px-5 py-3">
                <span className="truncate text-[12px] font-semibold text-white/75">{a.species}</span>
                <span className="truncate text-[11px] text-white/40">{a.nickname ?? "—"}</span>
                <span className="truncate text-[11px] text-white/38">{a.enclosure?.code_name ?? "—"} {a.enclosure?.zone?.name ? `· ${a.enclosure.zone.name}` : ""}</span>
                <select
                  value={a.health_status}
                  onChange={e => changeStatus(a.animal_id, e.target.value)}
                  className="cursor-pointer px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ ...inputStyle, color: STATUS_COLOR[a.health_status], fontSize: "10px" }}
                >
                  {HEALTH_STATUSES.map(s => (
                    <option key={s} value={s} style={{ background: "#0d1a0f" }}>{s.replace("_", " ")}</option>
                  ))}
                </select>
                <DeleteButton onClick={() => remove(a.animal_id)} disabled={deleting === a.animal_id} />
              </div>
            ))}
          </div>
        )}
      </TableWrap>

      {showModal && (
        <Modal title="Register Animal" onClose={() => setShowModal(false)}>
          <form onSubmit={registerAnimal} className="flex flex-col gap-4">
            <Inp label="Species *" value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))} required placeholder="e.g. Bengal Tiger" />
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Scientific Name" value={form.scientific_name} onChange={e => setForm(f => ({ ...f, scientific_name: e.target.value }))} placeholder="Panthera tigris" />
              <Inp label="Nickname" value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} placeholder="Arjun" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Birth Date" type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
              <Sel label="Health Status" value={form.health_status} onChange={e => setForm(f => ({ ...f, health_status: e.target.value }))}>
                {HEALTH_STATUSES.map(s => <option key={s} value={s} style={{ background: "#0d1a0f" }}>{s.replace("_", " ")}</option>)}
              </Sel>
            </div>
            <Sel label="Assign to Enclosure" value={form.enclosure_id} onChange={e => setForm(f => ({ ...f, enclosure_id: e.target.value }))}>
              <option value="">No enclosure (unassigned)</option>
              {enclosures.map(e => <option key={e.enclosure_id} value={e.enclosure_id} style={{ background: "#0d1a0f" }}>{e.code_name} — {e.zone_name}</option>)}
            </Sel>
            <SubmitButton submitting={submitting} label="Register Animal" loadingLabel="Registering…" />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AnimalsTab;
