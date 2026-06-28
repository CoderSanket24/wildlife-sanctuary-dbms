import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import EmptyState from "../components/ui/EmptyState";
import ZoneCard from "../components/zones/ZoneCard";
import ZoneFilterBar from "../components/zones/ZoneFilterBar";
import { CLIMATE_META } from "../constants/climateData";
import api from "../api/axiosInstance";

/* ── Loading skeleton grid ── */
const ZoneSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div
        key={i}
        className="animate-pulse"
        style={{
          background:   "rgba(13,26,15,0.60)",
          borderRadius: "18px",
          border:       "1px solid rgba(163,230,53,0.06)",
          height:       "280px",
        }}
      />
    ))}
  </div>
);

/* ════════════════════════════════════════
   ZONES PAGE
════════════════════════════════════════ */
const Zones = () => {
  const [zones, setZones]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [climate, setClimate] = useState("ALL");

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        const res = await api.get("/zones");
        setZones(res.data.zones);
      } catch (err) {
        setError(err.response?.data?.error ?? "Failed to load zones.");
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const filtered = zones.filter(z => {
    const matchSearch  = z.name.toLowerCase().includes(search.toLowerCase());
    const matchClimate = climate === "ALL" || z.climate === climate;
    return matchSearch && matchClimate;
  });

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        <PageHeader
          eyebrow="Abhayarnya · Sanctuary Zones"
          titlePlain="Explore"
          titleAccent="Zones"
          subtitle="Browse all sanctuary zones, their enclosures, resident animals, and entry pricing."
        />

        <ZoneFilterBar
          search={search}   onSearch={setSearch}
          climate={climate} onClimate={setClimate}
        />

        {loading && <ZoneSkeleton />}

        {!loading && error && <ErrorAlert message={error} />}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={MapPin}
            heading="No zones found"
            subtext={search ? `No zones match "${search}"` : "No sanctuary zones have been created yet."}
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/22">
              Showing {filtered.length} of {zones.length} zone{zones.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(zone => (
                <ZoneCard key={zone.zone_id} zone={zone} />
              ))}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Zones;
