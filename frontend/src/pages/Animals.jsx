import React, { useEffect, useState } from "react";
import { PawPrint } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import EmptyState from "../components/ui/EmptyState";
import AnimalCard from "../components/animals/AnimalCard";
import AnimalFilterBar from "../components/animals/AnimalFilterBar";
import { HEALTH_META } from "../constants/healthData";
import api from "../api/axiosInstance";

/* ── Skeleton grid while fetching ── */
const AnimalSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div
        key={i}
        className="animate-pulse"
        style={{
          background:   "rgba(13,26,15,0.60)",
          borderRadius: "18px",
          border:       "1px solid rgba(163,230,53,0.06)",
          height:       "290px",
        }}
      />
    ))}
  </div>
);

/* ════════════════════════════════════════
   ANIMALS PAGE
════════════════════════════════════════ */
const Animals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("ALL");

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const res = await api.get("/sanctuary");
        setAnimals(res.data.animals);
      } catch (err) {
        setError(err.response?.data?.error ?? "Failed to load animals.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  /* Client-side filter (search + status) */
  const filtered = animals.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || [a.species, a.nickname, a.scientific_name]
      .some(v => v?.toLowerCase().includes(q));
    const matchStatus = status === "ALL" || a.health_status === status;
    return matchSearch && matchStatus;
  });

  /* Status summary counts for the sub-header chips */
  const counts = animals.reduce((acc, a) => {
    acc[a.health_status] = (acc[a.health_status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        <PageHeader
          eyebrow="Abhayarnya · Wildlife Roster"
          titlePlain="Track"
          titleAccent="Animals"
          subtitle="Browse every resident animal, monitor health status, and explore their enclosure history."
        />

        {/* Health summary chips (only when loaded) */}
        {!loading && !error && animals.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.entries(HEALTH_META).map(([key, meta]) => {
              const count = counts[key] ?? 0;
              if (!count) return null;
              return (
                <button
                  key={key}
                  onClick={() => setStatus(status === key ? "ALL" : key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
                  style={{
                    background:   status === key ? `${meta.color}18` : "rgba(255,255,255,0.03)",
                    border:       status === key ? `1px solid ${meta.color}44` : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "999px",
                    color:        status === key ? meta.color : "rgba(255,255,255,0.35)",
                  }}
                >
                  <meta.icon size={10} strokeWidth={2} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                    {meta.label}
                  </span>
                  <span
                    className="ml-0.5 text-[9px] font-black"
                    style={{ color: status === key ? meta.color : "rgba(255,255,255,0.25)" }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <AnimalFilterBar
          search={search}  onSearch={setSearch}
          status={status}  onStatus={setStatus}
        />

        {loading && <AnimalSkeleton />}

        {!loading && error && <ErrorAlert message={error} />}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={PawPrint}
            heading="No animals found"
            subtext={
              search || status !== "ALL"
                ? "Try adjusting your search or status filter."
                : "No animals have been registered in the sanctuary yet."
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/22">
              Showing {filtered.length} of {animals.length} animal{animals.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(a => (
                <AnimalCard key={a.animal_id} animal={a} />
              ))}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Animals;
