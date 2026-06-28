import React from "react";
import { Leaf } from "lucide-react";

/**
 * Consistent page header used across all dashboard pages.
 *
 * @param {string} eyebrow     - Small uppercase label above the title (e.g. "Abhayarnya · Zones").
 * @param {string} titlePlain  - Plain portion of the h1 (e.g. "Explore").
 * @param {string} titleAccent - Lime-coloured accent portion of the h1 (e.g. "Zones").
 * @param {string} subtitle    - Optional muted description line beneath the title.
 */
const PageHeader = ({ eyebrow, titlePlain, titleAccent, subtitle }) => (
  <div className="mb-8">
    <div className="mb-3 flex items-center gap-2.5">
      <Leaf size={12} className="text-lime-300/50" />
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-300/50">
        {eyebrow}
      </p>
    </div>
    <h1 className="text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
      {titlePlain}{" "}
      <span style={{ color: "#a3e635" }}>{titleAccent}</span>
    </h1>
    {subtitle && (
      <p className="mt-2 max-w-xl text-sm text-white/28 leading-relaxed">{subtitle}</p>
    )}
  </div>
);

export default PageHeader;
