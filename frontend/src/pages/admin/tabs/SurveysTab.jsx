import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import api from "../../../api/axiosInstance";
import { Eyebrow, Modal, Inp, Sel, TableWrap, TableSkeleton, EmptyState, AddButton, DeleteButton, SubmitButton } from "../shared/adminComponents";

const SurveysTab = ({ toast }) => {
  const [surveys, setSurveys]   = useState([]);
  const [animals, setAnimals]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ animal_id: "", sighting_count: "1", latitude: "", longitude: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/admin/surveys"), api.get("/sanctuary")])
      .then(([s, a]) => { setSurveys(s.data.surveys); setAnimals(a.data.animals); })
      .catch(() => toast("Failed to load surveys.", "error"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const addSurvey = async e => {
    e.preventDefault();
    if (!form.animal_id || !form.latitude || !form.longitude) { toast("Animal, latitude and longitude required.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/fauna/surveys", {
        animal_id: parseInt(form.animal_id),
        sighting_count: parseInt(form.sighting_count) || 1,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      toast("Survey logged.");
      setShowModal(false);
      setForm({ animal_id: "", sighting_count: "1", latitude: "", longitude: "" });
      load();
    } catch (err) {
      toast(err.response?.data?.error ?? "Failed to log survey.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async id => {
    if (!window.confirm("Delete this survey record?")) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/surveys/${id}`);
      setSurveys(v => v.filter(x => x.survey_id !== id));
      toast("Survey deleted.");
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
          <Eyebrow>Field Telemetry</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Camera Trap <span style={{ color: "#34d399" }}>Surveys</span></h2>
        </div>
        <AddButton onClick={() => setShowModal(true)}><Plus size={12} /> Log Survey</AddButton>
      </div>

      <TableWrap>
        <div className="grid grid-cols-[1.5fr_80px_110px_110px_100px_44px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Animal</span><span>Sightings</span><span>Latitude</span><span>Longitude</span><span>Date</span><span></span>
        </div>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : surveys.length === 0 ? (
          <EmptyState message="No surveys logged." />
        ) : (
          <div className="divide-y max-h-130 overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {surveys.map(s => (
              <div key={s.survey_id} className="grid grid-cols-[1.5fr_80px_110px_110px_100px_44px] items-center gap-3 px-5 py-3">
                <p className="truncate text-[12px] font-semibold text-white/80">
                  {s.animal?.nickname ? `${s.animal.nickname} (${s.animal.species})` : (s.animal?.species ?? "—")}
                </p>
                <span className="text-[12px] font-bold" style={{ color: "#34d399" }}>{s.sighting_count}</span>
                <span className="font-mono text-[11px] text-white/45">{s.latitude}</span>
                <span className="font-mono text-[11px] text-white/45">{s.longitude}</span>
                <span className="text-[10px] text-white/30">{new Date(s.survey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</span>
                <DeleteButton onClick={() => remove(s.survey_id)} disabled={deleting === s.survey_id} />
              </div>
            ))}
          </div>
        )}
      </TableWrap>

      {showModal && (
        <Modal title="Log Survey" onClose={() => setShowModal(false)}>
          <form onSubmit={addSurvey} className="flex flex-col gap-4">
            <Sel label="Animal *" value={form.animal_id} onChange={e => setForm(f => ({ ...f, animal_id: e.target.value }))} required>
              <option value="" disabled>Select animal…</option>
              {animals.map(a => <option key={a.animal_id} value={a.animal_id} style={{ background: "#0d1a0f" }}>{a.nickname ? `${a.nickname} (${a.species})` : a.species}</option>)}
            </Sel>
            <Inp label="Sighting Count" type="number" min="1" value={form.sighting_count} onChange={e => setForm(f => ({ ...f, sighting_count: e.target.value }))} placeholder="1" />
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Latitude *"  type="number" step="any" value={form.latitude}  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}  required placeholder="e.g. 20.5937" />
              <Inp label="Longitude *" type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required placeholder="e.g. 78.9629" />
            </div>
            <SubmitButton submitting={submitting} label="Log Survey" loadingLabel="Logging…" />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SurveysTab;
