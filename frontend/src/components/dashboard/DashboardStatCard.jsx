import React from "react";
import { Link } from "react-router-dom";

/**
 * Large stat card used on the main Dashboard overview.
 * Features glassmorphism background, paw + leaf SVG watermarks,
 * a glowing border (lime or amber variant), and a big numeric value.
 *
 * @param {React.ElementType} icon    - Lucide icon component.
 * @param {string}            label   - Descriptive label below the value.
 * @param {string|number}     value   - The statistic to display (e.g. "12" or "—").
 * @param {string}            to      - React Router path the card links to.
 * @param {"lime"|"amber"}    variant - Colour theme. Defaults to "lime".
 */
const DashboardStatCard = ({ icon: Icon, label, value, to, variant = "lime" }) => {
  const isAmber = variant === "amber";

  const tokens = isAmber
    ? {
        bg:             "linear-gradient(145deg, rgba(30,20,5,0.92) 0%, rgba(20,14,4,0.97) 100%)",
        border:         "rgba(212,168,83,0.55)",
        glow:           "rgba(212,168,83,0.30)",
        iconBg:         "rgba(212,168,83,0.15)",
        iconColor:      "#d4a853",
        watermarkColor: "rgba(212,168,83,0.08)",
        valueColor:     "#f5dfa0",
        labelColor:     "rgba(245,223,160,0.55)",
      }
    : {
        bg:             "linear-gradient(145deg, rgba(13,26,15,0.92) 0%, rgba(9,18,10,0.97) 100%)",
        border:         "rgba(163,230,53,0.45)",
        glow:           "rgba(163,230,53,0.22)",
        iconBg:         "rgba(163,230,53,0.12)",
        iconColor:      "#a3e635",
        watermarkColor: "rgba(163,230,53,0.06)",
        valueColor:     "#e8efe8",
        labelColor:     "rgba(200,220,180,0.55)",
      };

  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01]"
      style={{
        background:          tokens.bg,
        borderRadius:        "18px",
        border:              `1.5px solid ${tokens.border}`,
        boxShadow:           `0 0 0 0 ${tokens.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        backdropFilter:      "blur(22px)",
        WebkitBackdropFilter:"blur(22px)",
        minHeight:           "195px",
        transition:          "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* Hover glow ring */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ borderRadius: "18px", boxShadow: `0 0 28px 4px ${tokens.glow}` }}
      />

      {/* Paw watermark */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -bottom-3 -right-3 h-28 w-28"
        fill={tokens.watermarkColor}
      >
        <ellipse cx="50" cy="72" rx="18" ry="14" />
        <ellipse cx="27" cy="52" rx="10" ry="13" />
        <ellipse cx="73" cy="52" rx="10" ry="13" />
        <ellipse cx="37" cy="35" rx="9"  ry="11" />
        <ellipse cx="63" cy="35" rx="9"  ry="11" />
      </svg>

      {/* Leaf watermark */}
      <svg
        viewBox="0 0 80 80"
        className="pointer-events-none absolute -top-4 right-8 h-20 w-20 rotate-12"
        fill={tokens.watermarkColor}
      >
        <path d="M40 5 C60 5, 75 20, 75 40 C75 62, 55 72, 40 75 C40 75, 5 60, 5 40 C5 18, 20 5, 40 5Z" />
      </svg>

      {/* Icon chip */}
      <div
        className="flex h-11 w-11 items-center justify-center"
        style={{
          background:   tokens.iconBg,
          borderRadius: "12px",
          border:       `1px solid ${tokens.border}`,
          color:        tokens.iconColor,
        }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* Value + label */}
      <div>
        <p
          className="text-5xl font-black leading-none tracking-tight"
          style={{ color: tokens.valueColor }}
        >
          {value}
        </p>
        <p
          className="mt-2 text-[12px] font-semibold tracking-wide"
          style={{ color: tokens.labelColor }}
        >
          {label}
        </p>
      </div>
    </Link>
  );
};

export default DashboardStatCard;
