import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, PawPrint, LayoutGrid, Ticket,
  IndianRupee, Leaf, Plus, Trash2, ChevronDown,
  AlertTriangle, RefreshCw, Shield, Stethoscope,
  UserPlus, X, CheckCircle,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axiosInstance";

/* ═══════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════ */
const Eyebrow = ({ children }) => (
  <div className="mb-2 flex items-center gap-2">
    <Leaf size={10} className="text-lime-300/50" />
    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-lime-300/50">{children}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, accent = "#a3e635", loading }) => (
  <div
    className="flex flex-col gap-3 p-5"
    style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.88) 0%,rgba(9,18,10,0.95) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.09)" }}
  >
    <div className="flex h-10 w-10 items-center justify-center" style={{ background: `${accent}12`, border: `1px solid ${accent}22`, borderRadius: "10px", color: accent }}>
      <Icon size={18} strokeWidth={1.6} />
    </div>
    {loading ? (
      <div className="h-8 w-20 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
    ) : (
      <p className="text-3xl font-black text-white">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
    )}
    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/30">{label}</p>
  </div>
);

const Badge = ({ label, color }) => (
  <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]"
    style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}>
    {label}
  </span>
);

const ROLE_COLOR   = { VISITOR: "#60a5fa", RANGER: "#34d399", ADMIN: "#a3e635" };
const STATUS_COLOR = { HEALTHY: "#4ade80", UNDER_CARE: "#fbbf24", CRITICAL: "#f87171", QUARANTINED: "#818cf8" };
const CLIMATE_COLOR = { TROPICAL: "#34d399", TEMPERATE: "#60a5fa", ARID: "#fbbf24", WETLAND: "#818cf8", ALPINE: "#e2e8f0" };

/* ────────────── Modal wrapper ────────────── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="relative w-full max-w-lg overflow-hidden" style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.98) 0%,rgba(9,18,10,0.99) 100%)", borderRadius: "20px", border: "1px solid rgba(163,230,53,0.15)", boxShadow: "0 0 60px rgba(163,230,53,0.07)" }}>
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,#a3e635,rgba(163,230,53,0.1),transparent)" }} />
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-white">{title}</p>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10" style={{ color: "rgba(255,255,255,0.35)" }}><X size={15} /></button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

/* ────────────── Form input ────────────── */
const inputStyle = { background: "rgba(13,26,15,0.70)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "8px", color: "rgba(255,255,255,0.75)", outline: "none", fontSize: "13px" };
const Inp = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/30">{label}</label>
    <input {...props} className="w-full px-3 py-2.5 placeholder-white/18 transition focus:border-lime-400/50" style={inputStyle} />
  </div>
);
const Sel = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/30">{label}</label>
    <select {...props} className="w-full cursor-pointer px-3 py-2.5" style={{ ...inputStyle, color: props.value ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.22)" }}>{children}</select>
  </div>
);

/* ────────────── Toast ────────────── */
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const bg = type === "error" ? "rgba(239,68,68,0.12)" : "rgba(163,230,53,0.10)";
  const border = type === "error" ? "rgba(239,68,68,0.30)" : "rgba(163,230,53,0.30)";
  const color  = type === "error" ? "#f87171" : "#a3e635";
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 shadow-2xl" style={{ background: bg, border: `1px solid ${border}`, borderRadius: "12px", maxWidth: "340px" }}>
      {type === "error" ? <AlertTriangle size={16} style={{ color }} /> : <CheckCircle size={16} style={{ color }} />}
      <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.80)" }}>{msg}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TAB: OVERVIEW
═══════════════════════════════════════════════ */
const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: Users,        label: "Total Visitors",  value: stats?.total_visitors ?? 0, accent: "#60a5fa" },
    { icon: UserCheck,    label: "Staff Members",   value: stats?.total_staff    ?? 0, accent: "#34d399" },
    { icon: PawPrint,     label: "Animals Tracked", value: stats?.total_animals  ?? 0, accent: "#a3e635" },
    { icon: LayoutGrid,   label: "Active Zones",    value: stats?.total_zones    ?? 0, accent: "#a3e635" },
    { icon: Ticket,       label: "Total Bookings",  value: stats?.total_tickets  ?? 0, accent: "#fbbf24" },
    { icon: IndianRupee,  label: "Total Revenue ₹", value: stats?.total_revenue  ?? 0, accent: "#fbbf24" },
  ];

  return (
    <div>
      <div className="mb-6">
        <Eyebrow>Sanctuary Overview</Eyebrow>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">System <span style={{ color: "#a3e635" }}>Statistics</span></h2>
        <p className="mt-1 text-xs text-white/28">Real-time aggregate data across all sanctuary operations.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(c => <StatCard key={c.label} {...c} loading={loading} />)}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TAB: VISITORS
═══════════════════════════════════════════════ */
const VisitorsTab = ({ toast }) => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null); // visitor_id being updated

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

      <div style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.85) 0%,rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.09)", overflow: "hidden" }}>
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.5fr_80px_80px_130px] gap-4 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Name</span><span>Email</span><span>Age</span><span>Bookings</span><span>Role</span>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />)}
          </div>
        ) : visitors.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/20">No visitors found.</p>
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
                  <option value="RANGER">Ranger</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TAB: STAFF
═══════════════════════════════════════════════ */
const StaffTab = ({ toast }) => {
  const [staff, setStaff]       = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ visitor_id: "", role: "", first_name: "", last_name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/admin/staff"), api.get("/admin/visitors")])
      .then(([s, v]) => { setStaff(s.data.staff); setVisitors(v.data.visitors); })
      .catch(() => toast("Failed to load staff.", "error"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const STAFF_ROLES = ["RANGER", "VETERINARIAN", "ADMINISTRATOR", "FIELD_ANALYST"];

  // When visitor is selected, pre-fill name + email
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

  const staffIds = new Set(staff.map(s => s.staff_id));

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Personnel Registry</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Staff & <span style={{ color: "#34d399" }}>Rangers</span></h2>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black transition hover:brightness-110" style={{ background: "#a3e635", borderRadius: "8px" }}>
          <Plus size={12} /> Add Staff
        </button>
      </div>

      <div style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.85) 0%,rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.09)", overflow: "hidden" }}>
        <div className="grid grid-cols-[1fr_1.5fr_1fr_80px] gap-4 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Name</span><span>Email</span><span>Staff Role</span><span>Cases</span>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-5">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />)}</div>
        ) : staff.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/20">No staff registered yet.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {staff.map(s => (
              <div key={s.staff_id} className="grid grid-cols-[1fr_1.5fr_1fr_80px] items-center gap-4 px-5 py-3">
                <span className="truncate text-[13px] font-semibold text-white/75">{s.first_name} {s.last_name}</span>
                <span className="truncate text-[11px] text-white/38">{s.email}</span>
                <Badge label={s.role.replace("_", " ")} color="#34d399" />
                <span className="text-[12px] text-white/45">{s._count?.medical_cases ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <button type="submit" disabled={submitting} className="mt-1 w-full py-3 text-[11px] font-black uppercase tracking-[0.28em] text-black transition hover:brightness-110 disabled:opacity-50" style={{ background: "#a3e635", borderRadius: "8px" }}>
              {submitting ? "Registering…" : "Register Staff Member"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TAB: ANIMALS
═══════════════════════════════════════════════ */
const AnimalsTab = ({ toast }) => {
  const [animals, setAnimals]   = useState([]);
  const [enclosures, setEnclosures] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ enclosure_id: "", species: "", scientific_name: "", nickname: "", birth_date: "", health_status: "HEALTHY" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/sanctuary"), api.get("/zones")])
      .then(([a, z]) => {
        setAnimals(a.data.animals);
        // Flatten enclosures from zones list
        const encs = [];
        (z.data.zones ?? []).forEach(zone => {
          // zones from vw_zone_summary don't include enclosures — load them from zone detail
        });
        setEnclosures(encs);
      })
      .catch(() => toast("Failed to load animals.", "error"))
      .finally(() => setLoading(false));
  }, []);

  // Load enclosures list separately
  useEffect(() => {
    api.get("/sanctuary").then(r => setAnimals(r.data.animals)).catch(() => {}).finally(() => setLoading(false));
    // Fetch all zones with enclosures
    api.get("/zones").then(async r => {
      const zones = r.data.zones ?? [];
      const enc = [];
      await Promise.all(zones.map(z => api.get(`/zones/${z.zone_id}`).then(res => {
        (res.data.zone?.enclosures ?? []).forEach(e => enc.push({ ...e, zone_name: res.data.zone.name }));
      }).catch(() => {})));
      setEnclosures(enc);
    }).catch(() => {});
  }, []);

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

  const remove = async (animal_id) => {
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
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black transition hover:brightness-110" style={{ background: "#a3e635", borderRadius: "8px" }}>
          <Plus size={12} /> Add Animal
        </button>
      </div>

      <div style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.85) 0%,rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.09)", overflow: "hidden" }}>
        <div className="grid grid-cols-[1fr_1fr_1fr_130px_44px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Species</span><span>Nickname</span><span>Zone / Enclosure</span><span>Status</span><span></span>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-5">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />)}</div>
        ) : animals.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/20">No animals registered.</p>
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
                  {["HEALTHY","UNDER_CARE","CRITICAL","QUARANTINED"].map(s => (
                    <option key={s} value={s} style={{ background: "#0d1a0f" }}>{s.replace("_"," ")}</option>
                  ))}
                </select>
                <button onClick={() => remove(a.animal_id)} disabled={deleting === a.animal_id} className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-red-500/12" style={{ color: "rgba(248,113,113,0.45)" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
                {["HEALTHY","UNDER_CARE","CRITICAL","QUARANTINED"].map(s => <option key={s} value={s} style={{ background: "#0d1a0f" }}>{s.replace("_"," ")}</option>)}
              </Sel>
            </div>
            <Sel label="Assign to Enclosure" value={form.enclosure_id} onChange={e => setForm(f => ({ ...f, enclosure_id: e.target.value }))}>
              <option value="">No enclosure (unassigned)</option>
              {enclosures.map(e => <option key={e.enclosure_id} value={e.enclosure_id} style={{ background: "#0d1a0f" }}>{e.code_name} — {e.zone_name}</option>)}
            </Sel>
            <button type="submit" disabled={submitting} className="mt-1 w-full py-3 text-[11px] font-black uppercase tracking-[0.28em] text-black transition hover:brightness-110 disabled:opacity-50" style={{ background: "#a3e635", borderRadius: "8px" }}>
              {submitting ? "Registering…" : "Register Animal"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TAB: ZONES
═══════════════════════════════════════════════ */
const ZonesTab = ({ toast }) => {
  const [zones, setZones]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [form, setForm] = useState({ name: "", climate: "TROPICAL", camera_traps_count: "", ticket_price: "" });
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
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black transition hover:brightness-110" style={{ background: "#a3e635", borderRadius: "8px" }}>
          <Plus size={12} /> Add Zone
        </button>
      </div>

      <div style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.85) 0%,rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.09)", overflow: "hidden" }}>
        <div className="grid grid-cols-[1.5fr_1fr_80px_80px_100px_100px_44px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Name</span><span>Climate</span><span>Animals</span><span>Cameras</span><span>Price ₹</span><span>Revenue ₹</span><span></span>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-5">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />)}</div>
        ) : zones.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/20">No zones configured.</p>
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
                <button onClick={() => remove(z.zone_id)} disabled={deleting === z.zone_id} className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-red-500/12" style={{ color: "rgba(248,113,113,0.45)" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Add New Zone" onClose={() => setShowModal(false)}>
          <form onSubmit={addZone} className="flex flex-col gap-4">
            <Inp label="Zone Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Northern Wetlands" />
            <div className="grid grid-cols-2 gap-3">
              <Sel label="Climate Type *" value={form.climate} onChange={e => setForm(f => ({ ...f, climate: e.target.value }))}>
                {["TROPICAL","TEMPERATE","ARID","WETLAND","ALPINE"].map(c => <option key={c} value={c} style={{ background: "#0d1a0f" }}>{c}</option>)}
              </Sel>
              <Inp label="Camera Traps" type="number" min="0" value={form.camera_traps_count} onChange={e => setForm(f => ({ ...f, camera_traps_count: e.target.value }))} placeholder="0" />
            </div>
            <Inp label="Ticket Price (₹) *" type="number" min="0" step="0.01" value={form.ticket_price} onChange={e => setForm(f => ({ ...f, ticket_price: e.target.value }))} required placeholder="e.g. 500" />
            <button type="submit" disabled={submitting} className="mt-1 w-full py-3 text-[11px] font-black uppercase tracking-[0.28em] text-black transition hover:brightness-110 disabled:opacity-50" style={{ background: "#a3e635", borderRadius: "8px" }}>
              {submitting ? "Creating…" : "Create Zone"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TAB: ALL TICKETS
═══════════════════════════════════════════════ */
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

      {/* Summary chips */}
      {summary && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-3 px-5 py-3" style={{ background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.12)", borderRadius: "12px" }}>
            <Ticket size={14} style={{ color: "rgba(163,230,53,0.55)" }} />
            <div><p className="text-xl font-black text-white">{summary.total_tickets}</p><p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Total Bookings</p></div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "12px" }}>
            <IndianRupee size={14} style={{ color: "rgba(251,191,36,0.70)" }} />
            <div><p className="text-xl font-black" style={{ color: "#f5dfa0" }}>₹{summary.total_revenue.toLocaleString("en-IN")}</p><p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/28">Total Revenue</p></div>
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.85) 0%,rgba(9,18,10,0.92) 100%)", borderRadius: "18px", border: "1px solid rgba(163,230,53,0.09)", overflow: "hidden" }}>
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_80px_100px] gap-3 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span>Visitor</span><span>Zone</span><span>Date</span><span>Base ₹</span><span>Total ₹</span>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-5">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />)}</div>
        ) : tickets.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/20">No tickets found.</p>
        ) : (
          <div className="divide-y max-h-[520px] overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
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
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═══════════════════════════════════════════════ */
const TABS = [
  { id: "overview", label: "Overview",  icon: LayoutGrid  },
  { id: "visitors", label: "Visitors",  icon: Users       },
  { id: "staff",    label: "Staff",     icon: UserCheck   },
  { id: "animals",  label: "Animals",   icon: PawPrint    },
  { id: "zones",    label: "Zones",     icon: Shield      },
  { id: "tickets",  label: "Tickets",   icon: Ticket      },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null); // { msg, type }

  const showToast = (msg, type = "success") => setToast({ msg, type });

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        {/* ── Page heading ── */}
        <div className="mb-8">
          <Eyebrow>Abhayarnya · Control Centre</Eyebrow>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
            Admin <span style={{ color: "#a3e635" }}>Dashboard</span>
          </h1>
          <p className="mt-2 text-sm text-white/28">Full administrative control over sanctuary data and operations.</p>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="mb-8 flex flex-wrap gap-1 p-1.5"
          style={{ background: "rgba(13,26,15,0.70)", borderRadius: "14px", border: "1px solid rgba(163,230,53,0.09)" }}
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] transition-all duration-150"
                style={{
                  borderRadius: "10px",
                  background: active ? "#a3e635" : "transparent",
                  color:       active ? "#0d1a0f" : "rgba(255,255,255,0.35)",
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "visitors" && <VisitorsTab toast={showToast} />}
        {activeTab === "staff"    && <StaffTab    toast={showToast} />}
        {activeTab === "animals"  && <AnimalsTab  toast={showToast} />}
        {activeTab === "zones"    && <ZonesTab    toast={showToast} />}
        {activeTab === "tickets"  && <TicketsTab  toast={showToast} />}
      </div>

      {/* ── Toast notification ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
