import React from "react";
import { Link } from "react-router-dom";

/**
 * Icon + label button in the Quick Actions grid on the Dashboard.
 *
 * @param {React.ElementType} icon  - Lucide icon component.
 * @param {string}            label - Short action label text.
 * @param {string}            to    - React Router path to navigate to.
 */
const QuickActionButton = ({ icon: Icon, label, to }) => (
  <Link
    to={to}
    className="group flex flex-col items-center justify-center gap-2.5 p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-lime-400/5"
    style={{
      background:   "rgba(255,255,255,0.03)",
      border:       "1px solid rgba(163,230,53,0.10)",
      borderRadius: "14px",
    }}
  >
    <div
      className="flex h-10 w-10 items-center justify-center transition-colors duration-200 group-hover:text-lime-300"
      style={{ color: "rgba(163,230,53,0.50)" }}
    >
      <Icon size={22} strokeWidth={1.5} />
    </div>
    <span
      className="text-center text-[10px] font-bold uppercase tracking-[0.22em] transition-colors duration-200 group-hover:text-white/80"
      style={{ color: "rgba(255,255,255,0.40)" }}
    >
      {label}
    </span>
  </Link>
);

export default QuickActionButton;
