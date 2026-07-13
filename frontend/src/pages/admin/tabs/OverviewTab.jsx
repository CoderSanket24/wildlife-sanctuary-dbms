import React, { useState, useEffect } from "react";
import { Users, UserCheck, PawPrint, LayoutGrid, Ticket, IndianRupee } from "lucide-react";
import api from "../../../api/axiosInstance";
import { Eyebrow, StatCard } from "../shared/adminComponents";

const OverviewTab = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: Users,       label: "Total Visitors",  value: stats?.total_visitors ?? 0, accent: "#60a5fa" },
    { icon: UserCheck,   label: "Staff Members",   value: stats?.total_staff    ?? 0, accent: "#34d399" },
    { icon: PawPrint,    label: "Animals Tracked", value: stats?.total_animals  ?? 0, accent: "#a3e635" },
    { icon: LayoutGrid,  label: "Active Zones",    value: stats?.total_zones    ?? 0, accent: "#a3e635" },
    { icon: Ticket,      label: "Total Bookings",  value: stats?.total_tickets  ?? 0, accent: "#fbbf24" },
    { icon: IndianRupee, label: "Total Revenue ₹", value: stats?.total_revenue  ?? 0, accent: "#fbbf24" },
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

export default OverviewTab;
