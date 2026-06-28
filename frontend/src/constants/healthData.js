import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldAlert,
} from "lucide-react";

/**
 * Shared metadata for each AnimalStatus enum value.
 * Used by: AnimalRow (ZoneDetail), future Animals page, future AnimalDetail page.
 */
export const HEALTH_META = {
  HEALTHY: {
    icon:  CheckCircle,
    label: "Healthy",
    color: "#4ade80",
    bg:    "rgba(74,222,128,0.09)",
  },
  UNDER_CARE: {
    icon:  AlertTriangle,
    label: "Under Care",
    color: "#fbbf24",
    bg:    "rgba(251,191,36,0.09)",
  },
  CRITICAL: {
    icon:  XCircle,
    label: "Critical",
    color: "#f87171",
    bg:    "rgba(248,113,113,0.09)",
  },
  QUARANTINED: {
    icon:  ShieldAlert,
    label: "Quarantined",
    color: "#c084fc",
    bg:    "rgba(192,132,252,0.09)",
  },
};
