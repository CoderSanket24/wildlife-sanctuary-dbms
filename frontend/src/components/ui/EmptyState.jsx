import React from "react";

/**
 * Centred empty-state block with an icon, heading and sub-text.
 *
 * @param {React.ElementType} icon    - Lucide icon component to display.
 * @param {string}            heading - Bold heading text (e.g. "No zones found").
 * @param {string}            subtext - Softer explanation line below the heading.
 */
const EmptyState = ({ icon: Icon, heading, subtext }) => (
  <div className="flex flex-col items-center gap-4 py-20 text-center">
    {Icon && <Icon size={36} style={{ color: "rgba(163,230,53,0.20)" }} />}
    <p className="text-lg font-black uppercase tracking-tight text-white/30">{heading}</p>
    {subtext && <p className="text-sm text-white/20">{subtext}</p>}
  </div>
);

export default EmptyState;
