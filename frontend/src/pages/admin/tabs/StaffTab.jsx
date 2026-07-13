import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../../api/axiosInstance";
import { STAFF_ROLES } from "../shared/adminConstants";
import { Eyebrow, Badge, Modal, Inp, Sel, TableWrap, TableSkeleton, EmptyState, AddButton, DeleteButton, SubmitButton } from "../shared/adminComponents";

const StaffTab = ({ toast }) => {
  const [staff, setStaff]       = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ visitor_id: "", role: "", first_name: "", last_name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/admin/staff"), api.get("/admin/visitors")])
      .then(([s, v]) => { setStaff(s.data.staff); setVisitors(v.data.visitors); })
      .catch(() => toast("Failed to load staff.", "error"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const handleVisitorSelect = e => {
    const vid = parseInt(e.target.value, 10);
    const vis = visitors.find(v => v.visitor_id === vid);
    setForm(f => ({ ...f, visitor_id: e.target.value, first_name: vis?.first_name ?? "", last_name: vis?.last_name ?? "", email: vis?.email ?? "" }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.visitor_id || !form.role) { toast("Select a visitor and role.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/admin/staff", { ...form, visitor_id: parseInt(form.visitor_id, 10) });
      toast("Staff member added successfully.");
      setShowModal(false);
      setForm({ visitor_id: "", role: "", first_name: "", last_name: "", email: "" });
      load();
    } catch (err) {
      toast(err.response?.data?.error ?? "Failed to add staff.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async staff_id => {
    if (!window.confirm("Remove this staff member? They will be demoted back to Visitor.")) return;
    setDeleting(staff_id);
    try {
      await api.delete(`/admin/staff/${staff_id}`);
      setStaff(v => v.filter(x => x.staff_id !== staff_id));
      toast("Staff member removed.");
    } catch (err) {
      toast(err.response?.data?.error ?? "Failed to remove staff.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const staffIds = new Set(staff.map(s => s.staff_id));

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Personnel Registry</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Staff &amp; <span style={{ color: "#34d399" }}>Rangers</span></h2>
        </div>
        <AddButton onClick={() => setShowModal(true)}><Plus size={12} /> Add Staff</AddButton>
      </div>

      <TableWrap>
        <div className="grid grid-cols-[1fr_1.5fr_1fr_80px_44px] gap-4 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Name</span><span>Email</span><span>Staff Role</span><span>Cases</span><span></span>
        </div>
        {loading ? (
          <TableSkeleton rows={3} />
        ) : staff.length === 0 ? (
          <EmptyState message="No staff registered yet." />
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {staff.map(s => (
              <div key={s.staff_id} className="grid grid-cols-[1fr_1.5fr_1fr_80px_44px] items-center gap-4 px-5 py-3">
                <span className="truncate text-[13px] font-semibold text-white/75">{s.first_name} {s.last_name}</span>
                <span className="truncate text-[11px] text-white/38">{s.email}</span>
                <Badge label={s.role.replace("_", " ")} color="#34d399" />
                <span className="text-[12px] text-white/45">{s._count?.medical_cases ?? 0}</span>
                <DeleteButton onClick={() => remove(s.staff_id)} disabled={deleting === s.staff_id} />
              </div>
            ))}
          </div>
        )}
      </TableWrap>

      {showModal && (
        <Modal title="Add Staff Member" onClose={() => setShowModal(false)}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Sel label="Select Visitor" value={form.visitor_id} onChange={handleVisitorSelect} required>
              <option value="" disabled>Pick a visitor to promote…</option>
              {visitors.filter(v => !staffIds.has(v.visitor_id)).map(v => (
                <option key={v.visitor_id} value={v.visitor_id} style={{ background: "#0d1a0f" }}>
                  {v.first_name} {v.last_name} — {v.email}
                </option>
              ))}
            </Sel>
            <Sel label="Staff Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
              <option value="" disabled>Select role…</option>
              {STAFF_ROLES.map(r => <option key={r} value={r} style={{ background: "#0d1a0f" }}>{r.replace("_", " ")}</option>)}
            </Sel>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="First Name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required placeholder="First" />
              <Inp label="Last Name"  value={form.last_name}  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}  required placeholder="Last" />
            </div>
            <Inp label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="staff@example.com" />
            <SubmitButton submitting={submitting} label="Register Staff Member" loadingLabel="Registering…" />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StaffTab;
