import {
  Leaf,
  Wind,
  Droplets,
  Sun,
  Mountain,
} from "lucide-react";

/**
 * Shared metadata for each ClimateType enum value.
 * Used by: ZoneCard, ZoneFilterBar, ZoneDetail (hero header).
 */
export const CLIMATE_META = {
  TROPICAL: {
    icon:   Leaf,
    label:  "Tropical",
    color:  "#4ade80",
    bg:     "rgba(74,222,128,0.10)",
    border: "rgba(74,222,128,0.22)",
  },
  TEMPERATE: {
    icon:   Wind,
    label:  "Temperate",
    color:  "#60a5fa",
    bg:     "rgba(96,165,250,0.10)",
    border: "rgba(96,165,250,0.22)",
  },
  ARID: {
    icon:   Sun,
    label:  "Arid",
    color:  "#fbbf24",
    bg:     "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.22)",
  },
  WETLAND: {
    icon:   Droplets,
    label:  "Wetland",
    color:  "#38bdf8",
    bg:     "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.22)",
  },
  ALPINE: {
    icon:   Mountain,
    label:  "Alpine",
    color:  "#c084fc",
    bg:     "rgba(192,132,252,0.10)",
    border: "rgba(192,132,252,0.22)",
  },
};
