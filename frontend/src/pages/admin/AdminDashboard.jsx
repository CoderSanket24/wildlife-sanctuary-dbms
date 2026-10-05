import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import DashboardLayout from "../../components/DashboardLayout";

// Shared
import { TABS }         from "./shared/adminConstants";
import { Eyebrow, Toast } from "./shared/adminComponents";

// Tabs
import OverviewTab    from "./tabs/OverviewTab";
import VisitorsTab    from "./tabs/VisitorsTab";
import StaffTab       from "./tabs/StaffTab";
import AnimalsTab     from "./tabs/AnimalsTab";
import ZonesTab       from "./tabs/ZonesTab";
import EnclosuresTab  from "./tabs/EnclosuresTab";
import HealthLogsTab  from "./tabs/HealthLogsTab";
import SurveysTab     from "./tabs/SurveysTab";
import FeedbackTab    from "./tabs/FeedbackTab";
import TicketsTab     from "./tabs/TicketsTab";

const TAB_COMPONENTS = {
  overview:    OverviewTab,
  visitors:    VisitorsTab,
  staff:       StaffTab,
  animals:     AnimalsTab,
  zones:       ZonesTab,
  enclosures:  EnclosuresTab,
  health:      HealthLogsTab,
  surveys:     SurveysTab,
  feedback:    FeedbackTab,
  tickets:     TicketsTab,
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast]         = useState(null); // { msg, type }

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Transport Layer: WebSocket / TCP (Unit III: CN Syllabus) ─────────────────
  useEffect(() => {
    // VITE_API_URL is "http://localhost:5000/api" — strip "/api" to get the root server
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const BACKEND = API_URL.replace(/\/api$/, "");

    // Establish a persistent TCP connection to the Socket.io server
    const socket = io(BACKEND, { withCredentials: true });

    socket.on("connect", () => {
      console.log("[Transport Layer] TCP Socket Connected:", socket.id);
    });

    // Listen for real-time ticket booking events emitted by the server
    socket.on("new_ticket", (ticket) => {
      const zoneName = ticket?.zone?.name ?? "a zone";
      showToast(`🎟️ Live: New ticket booked for ${zoneName}!`, "success");
      console.log("[WebSocket] new_ticket event received:", ticket);
    });

    socket.on("disconnect", () => {
      console.log("[Transport Layer] TCP Socket Disconnected");
    });

    // Cleanup: close TCP connection when component unmounts
    return () => socket.disconnect();
  }, []);
  // ─────────────────────────────────────────────────────────────────────────────

  const ActiveComponent = TAB_COMPONENTS[activeTab];

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
            const Icon   = tab.icon;
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

        {/* ── Active tab ── */}
        <ActiveComponent toast={showToast} />

      </div>

      {/* ── Toast notification ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
